import { useEffect, useState } from "react";
import Loading from "../companint/Loading";
import { getAllOrders, updateOrderStatus } from "../Services/OrdersServices";
import { useLocale } from "../hooks/UseLocale";

const orderStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
const statusLabels = {
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

const AdminOrders = () => {
  const { language } = useLocale();
  const ar = language === "ar";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  useEffect(() => {
    let active = true;

    getAllOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message || "Failed to load orders.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleStatus = async (id, status) => {
    setError("");
    setUpdatingOrderId(id);

    try {
      const updatedOrder = await updateOrderStatus(id, status);
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === id ? updatedOrder : order,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not update order status.",
      );
    } finally {
      setUpdatingOrderId("");
    }
  };

  return (
    <main className="container py-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <div>
          <p className="section-kicker mb-1">{ar ? "إدارة الطلبات" : "Order management"}</p>
          <h1 className="h2 mb-0">{ar ? "جميع الطلبات" : "All orders"}</h1>
        </div>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {loading ? (
        <div className="text-center py-5"><Loading message="Loading orders…" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 empty-state">
          <span className="badge bg-muted mb-3 d-inline-block">{ar ? "لا طلبات" : "No orders"}</span>
          <h1 className="h2">{ar ? "لا توجد طلبات بعد." : "No orders found."}</h1>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle bg-white shadow-soft">
            <thead className="table-dark">
              <tr>
                <th>Order</th>
                <th>{ar ? "العميل" : "Customer"}</th>
                <th>{ar ? "العناصر" : "Items"}</th>
                <th>{ar ? "المجموع" : "Total"}</th>
                <th>{ar ? "الحالة" : "Status"}</th>
                <th>{ar ? "تحديث" : "Update"}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="small">
                    {order._id}
                    <div className="text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    {order.user?.name || "Deleted user"}
                    <div className="small text-muted">{order.user?.email}</div>
                  </td>
                  <td>
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <span
                      className={`badge bg-${statusColors[order.status] || "secondary"} status-badge`}
                    >
                      {ar ? statusLabels[order.status]?.ar : statusLabels[order.status]?.en}
                    </span>
                  </td>
                  <td>
                    <select
                      aria-label={`Update status for order ${order._id}`}
                      className="form-select form-select-sm"
                      value={order.status}
                      disabled={updatingOrderId === order._id}
                      onChange={(event) =>
                        handleStatus(order._id, event.target.value)
                      }
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {ar ? statusLabels[status]?.ar : statusLabels[status]?.en}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;
