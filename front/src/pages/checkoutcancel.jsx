import { Link } from "react-router-dom";
import { useLocale } from "../hooks/UseLocale";

const CheckoutCancel = () => {
  const { language } = useLocale();
  const ar = language === "ar";

  return (
    <main className="container py-5 flex-grow-1 text-center">
      <div className="empty-state">
        <span className="badge bg-warning mb-3 d-inline-block">
          {ar ? "تم إلغاء الدفع" : "Checkout cancelled"}
        </span>
        <h1 className="h2">
          {ar ? "لم يتم إتمام الدفع." : "Your payment was not completed."}
        </h1>
        <p className="text-muted">
          {ar
            ? "ما زالت منتجاتك في السلة، ويمكنك المحاولة مرة أخرى."
            : "Your items are still in your bag. You can try checkout again."}
        </p>
        <Link className="btn btn-dark mt-3" to="/cart">
          {ar ? "العودة إلى السلة" : "Return to your bag"}
        </Link>
      </div>
    </main>
  );
};

export default CheckoutCancel;
