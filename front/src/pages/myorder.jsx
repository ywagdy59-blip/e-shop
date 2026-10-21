import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../Services/OrdersServices";
import { useLocale } from "../hooks/UseLocale";
import Loading from "../companint/Loading";

const orderStatusLabels = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  paid: { en: "Paid", ar: "تم الدفع" },
  processing: { en: "Processing", ar: "قيد المعالجة" },
  shipped: { en: "Shipped", ar: "تم الشحن" },
  delivered: { en: "Delivered", ar: "تم التسليم" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
};
const statusColors = {
  pending: "warning",
  paid: "info",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
  }).format(price);

const MyOrders = () => {
  const { language } = useLocale();
  const ar = language === "ar";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyOrders()
      .then((res) => {
        if (active) setOrders(res.data || res);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Failed to load orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="text-center py-5"><Loading message="Loading orders…" /></div>;
  }

  return (
    <div className="container py-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <div>
          <p className="section-kicker mb-1">{ar ? "طلباتي" : "My orders"}</p>
          <h1 className="h2 mb-0">{ar ? "سجل الطلبات" : "Order history"}</h1>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div className="text-center py-5 empty-state">
          <span className="badge bg-muted mb-3 d-inline-block">{ar ? "لا طلبات" : "No orders"}</span>
          <h1 className="h2">{ar ? "لا توجد طلبات بعد." : "No orders yet."}</h1>
          <p className="text-muted">{ar ? "ابدأ بالتسوق الآن." : "Start shopping now."}</p>
          <Link to="/products" className="btn btn-dark mt-3">
            {ar ? "ابدأ التسوق" : "Start shopping"}
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div className="col-lg-4" key={order._id}>
              <div className="card border-0 shadow-soft h-100">
                <div className="card-header bg-white d-flex justify-content-between flex-wrap gap-2 p-3">
                  <span className="small text-muted">
                    #{order._id} · {new Date(order.createdAt).toLocaleString()}
                  </span>
                  <span className={`badge bg-${statusColors[order.status] || "secondary"} status-badge`}>
                    {ar ? orderStatusLabels[order.status]?.ar : orderStatusLabels[order.status]?.en}
                  </span>
                </div>
                <ul className="list-group list-group-flush">
                  {order.items.map((item, idx) => (
                    <li className="list-group-item d-flex justify-content-between" key={idx}>
                      <span>
                        {item.name}
                        {item.size && `(${item.size})`}
                        × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="card-footer bg-white text-end fw-bold p-3">
                  Total: {formatPrice(order.totalPrice)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
