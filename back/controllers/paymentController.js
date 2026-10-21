const asyncHandler = require("express-async-handler");

const getStripe = require("../confing/stripe");
const Order = require("../models/order");
const Clothes = require("../models/clothes");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const CURRENCY = (process.env.STRIPE_CURRENCY || "egp").toLowerCase();

// Stripe بيتعامل بأصغر وحدة في العملة (سنت / قرش)
const toMinorUnit = (amount) => Math.round(amount * 100);

// =====================================
// HELPER: تأكيد الدفع (بيتنادى من الـ webhook ومن verify)
// الشرط isPaid:false بيضمن إن الطلب يتأكد مرة واحدة بس
// =====================================
const markOrderAsPaid = async (orderId, session) => {
  // من غير orderId الفلتر هيبقى {isPaid:false} وممكن يمسك أي طلب
  if (!orderId) return null;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, isPaid: false },
    {
      isPaid: true,
      paidAt: new Date(),
      status: "paid",
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id
    },
    { returnDocument: "after" }
  );

  // لو order رجع null يبقى اتأكد قبل كده، متخصمش المخزون تاني
  if (!order) {
    return Order.findById(orderId);
  }

  // خصم الكمية من المخزون
  await Promise.all(
    order.items.map((item) =>
      Clothes.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      )
    )
  );

  return order;
};

// =====================================
// CREATE CHECKOUT SESSION  -  POST /api/payments/create-checkout-session
// body: { items: [{ productId, quantity, size }] }
// =====================================
const createCheckoutSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const { items } = req.body;

  // 1) هات المنتجات من الداتابيز (السعر بييجي من السيرفر مش من الفرونت)
  const productIds = items.map((i) => i.productId);
  const products = await Clothes.find({ _id: { $in: productIds } });

  const orderItems = [];

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId);

    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name}`);
    }

    if (item.size && !product.size.includes(item.size)) {
      res.status(400);
      throw new Error(`Size ${item.size} is not available for ${product.name}`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: item.size || "",
      quantity: item.quantity
    });
  }

  const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 2) اعمل الطلب في الداتابيز بحالة pending
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalPrice,
    currency: CURRENCY
  });

  // 3) اعمل Checkout Session على Stripe
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: orderItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: CURRENCY,
        unit_amount: toMinorUnit(item.price),
        product_data: {
          name: item.size ? `${item.name} (${item.size})` : item.name,
          // Stripe بيقبل صور https بس
          ...(item.image?.startsWith("https://") && { images: [item.image] })
        }
      }
    })),
    client_reference_id: order._id.toString(),
    metadata: { orderId: order._id.toString(), userId: req.user.id },
    success_url: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/checkout/cancel?order_id=${order._id}`
  });

  order.stripeSessionId = session.id;
  await order.save();

  res.status(200).json({
    success: true,
    url: session.url,
    orderId: order._id
  });
});

// =====================================
// VERIFY SESSION  -  GET /api/payments/verify/:sessionId
// صفحة النجاح في الفرونت بتناديه عشان تتأكد من الدفع
// =====================================
const verifySession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

  const orderId = session.metadata?.orderId;
  const order = orderId ? await Order.findById(orderId) : null;

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not allowed");
  }

  if (session.payment_status !== "paid") {
    return res.status(200).json({
      success: false,
      message: "Payment not completed",
      paymentStatus: session.payment_status,
      data: order
    });
  }

  const paidOrder = await markOrderAsPaid(orderId, session);

  res.status(200).json({
    success: true,
    message: "Payment confirmed",
    data: paidOrder
  });
});

// =====================================
// STRIPE WEBHOOK  -  POST /api/payments/webhook
// متسجل في index.js قبل express.json()
// =====================================
const stripeWebhook = async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe webhook is not configured");
    return res.status(503).json({ received: false, message: "Stripe webhook is not configured" });
  }

  const signature = req.headers["stripe-signature"];
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (Buffer)
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId && session.payment_status === "paid") {
          await markOrderAsPaid(orderId, session);
          console.log(`Order ${orderId} paid`);
        }
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await Order.updateOne({ _id: orderId, isPaid: false }, { status: "cancelled" });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    res.status(500).json({ received: false });
  }
};

module.exports = { createCheckoutSession, verifySession, stripeWebhook };
