import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { useCart } from "../hooks/UseCart";
import { useLocale } from "../hooks/UseLocale";
import { createCheckoutSession } from "../Services/PaymentServices";

const Cart = () => {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { isAuthenticated } = useAuth();
  const { language, t } = useLocale();
  const ar = language === "ar";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const money = (value) =>
    new Intl.NumberFormat(ar ? "ar-EG" : "en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(value);

  const checkout = async () => {
    if (!isAuthenticated) {
      return navigate("/login", {
        state: {
          from: "/cart",
          message: ar ? "سجّل دخولك لإتمام الطلب." : "Please log in to complete your order.",
        },
      });
    }
    setLoading(true);
    setError("");
    try {
      const response = await createCheckoutSession(
        items.map(({ productId, quantity, size }) => ({ productId, quantity, size })),
      );
      window.location.assign(response.url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (ar ? "تعذر بدء الدفع. حاول مجددًا." : "We could not start checkout. Please try again."),
      );
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="container py-5 flex-grow-1 text-center">
        <div className="empty-state">
          <span className="badge bg-muted mb-3 d-inline-block">{t("cartTag")}</span>
          <h1 className="h2">{ar ? "سلتك في انتظارك." : "Your bag is waiting."}</h1>
          <p className="text-muted">{ar ? "أضف القطع التي تريد الاحتفاظ بها." : "Add the pieces you want to keep close."}</p>
          <Link className="btn btn-dark mt-3" to="/products">
            {ar ? "استكشف المنتجات" : "Explore the collection"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <p className="section-kicker mb-1">{t("cartTag")}</p>
          <h1 className="h2 mb-0">{t("cartTitle")}</h1>
        </div>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="row g-4">
        <section className="col-lg-8">
          <div className="card border-0 shadow-soft overflow-hidden">
            {items.map((item) => (
              <article
                className="d-flex gap-3 p-4 border-bottom align-items-center"
                key={item.key}
              >
                <img
                  src={item.image}
                  alt=""
                  className="cart-thumb"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/product-placeholder.svg";
                  }}
                />
                <div className="flex-grow-1">
                  <Link className="fw-bold text-dark" to={`/products/${item.productId}`}>
                    {item.name}
                  </Link>
                  <div className="text-muted small">
                    {ar ? "المقاس" : "Size"}: {item.size}
                  </div>
                  <strong>{money(item.price)}</strong>
                </div>
                <input
                  className="form-control"
                  style={{ width: 80 }}
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.key, event.target.value)}
                />
                <button
                  className="btn btn-link text-danger p-0"
                  onClick={() => removeItem(item.key)}
                >
                  {t("remove")}
                </button>
              </article>
            ))}
          </div>
        </section>
        <aside className="col-lg-4">
          <div className="feature-card">
            <h2 className="h4 mb-3">{ar ? "ملخص الطلب" : "Order summary"}</h2>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">{t("subtotal")}</span>
              <strong className="fs-5">{money(total)}</strong>
            </div>
            <p className="small text-muted mb-4">
              {ar ? "يتم احتساب الشحن والضرائب بأمان عند الدفع." : "Shipping and any taxes are calculated securely at checkout."}
            </p>
            <button
              className="btn btn-dark w-100"
              disabled={loading}
              onClick={checkout}
            >
              {loading ? (ar ? "جارٍ فتح الدفع الآمن…" : "Opening secure checkout…") : t("checkout")}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Cart;
