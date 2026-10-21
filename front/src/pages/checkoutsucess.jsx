import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyCheckoutSession } from "../Services/PaymentServices";
import { useCart } from "../hooks/UseCart";
import { useLocale } from "../hooks/UseLocale";

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const { language } = useLocale();
  const ar = language === "ar";
  const sessionId = params.get("session_id");
  const [result, setResult] = useState({ sessionId: null, status: "checking", message: "" });

  useEffect(() => {
    let isActive = true;
    if (!sessionId) return () => { isActive = false; };

    const confirmPayment = async () => {
      try {
        const data = await verifyCheckoutSession(sessionId);

        if (!isActive) {
          return;
        }

        if (data.success) {
          clearCart();
          setResult({
            sessionId,
            status: "success",
            message: ar ? "تم تأكيد الدفع. طلبك في الطريق إليك." : "Payment confirmed. Your order is on its way.",
          });
          return;
        }

        setResult({
          sessionId,
          status: "error",
          message: data.message || (ar ? "دفعك لا يزال قيد الانتظار." : "Your payment is still pending."),
        });
      } catch {
        if (!isActive) {
          return;
        }

        setResult({
          sessionId,
          status: "error",
          message: ar
            ? "لا يمكننا تأكيد الدفع في الوقت الحالي. يرجى مراجعة طلباتك لاحقًا."
            : "We could not confirm the payment yet. Please check your orders shortly.",
        });
      }
    };

    confirmPayment();

    return () => {
      isActive = false;
    };
  }, [sessionId, clearCart, ar]);

  const currentResult = result.sessionId === sessionId;
  const paid = currentResult && result.status === "success";
  const failed = !sessionId || (currentResult && result.status === "error");
  const message = !sessionId
    ? ar ? "لم يتم العثور على جلسة الدفع." : "No checkout session was found."
    : currentResult && result.message
      ? result.message
      : ar ? "جارٍ تأكيد الدفع…" : "Confirming your payment…";
  const title = failed
    ? ar ? "نحتاج لحظة" : "We need a moment"
    : paid
      ? ar ? "شكرًا لطلبك." : "Thank you for your order."
      : ar ? "جارٍ تأكيد الدفع" : "Confirming your payment";

  return (
    <main className="container py-5 flex-grow-1 text-center">
      <div className="empty-state">
        <span className={`badge ${paid ? "bg-success" : "bg-warning text-dark"} mb-3 d-inline-block`}>
          {paid ? (ar ? "تم الدفع" : "Paid") : (ar ? "معلق" : "Pending")}
        </span>
        <h1 className="h2">{title}</h1>
        <p className="text-muted">{message}</p>
        <Link className="btn btn-dark mt-3" to="/products">
          {ar ? "استمر في التسوق" : "Continue shopping"}
        </Link>
      </div>
    </main>
  );
};

export default CheckoutSuccess;
