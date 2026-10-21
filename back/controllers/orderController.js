const asyncHandler = require("express-async-handler");

const Order = require("../models/order");

// =====================================
// MY ORDERS  -  GET /api/orders/my
// =====================================
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// =====================================
// ALL ORDERS  -  GET /api/orders  (Admin)
// =====================================
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// =====================================
// ORDER BY ID  -  GET /api/orders/:id  (Owner / Admin)
// =====================================
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user?._id?.toString() === req.user.id;

  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not allowed");
  }

  res.status(200).json({ success: true, data: order });
});

// =====================================
// UPDATE STATUS  -  PUT /api/orders/:id/status  (Admin)
// =====================================
const updateOrderStatus = asyncHandler(async (req, res) => {
  const allowed = ["shipped", "delivered", "cancelled"];
  const { status } = req.body;

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.isPaid && status !== "cancelled") {
    res.status(400);
    throw new Error("Order is not paid yet");
  }

  order.status = status;
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated",
    data: order
  });
});

module.exports = { getMyOrders, getAllOrders, getOrderById, updateOrderStatus };
