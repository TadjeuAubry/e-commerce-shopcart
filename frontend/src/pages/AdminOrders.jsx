import { useEffect, useState } from "react";
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../services/adminService";
import "../style/AdminOrders.css";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString();
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [notice, setNotice] = useState("");

  // Load orders from the backend.
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAdminOrders();

      // Support either an array or an object containing an orders array.
      const orderData = Array.isArray(result.data)
        ? result.data
        : result.data?.orders;

      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const previousOrder = orders.find(
      (order) => order._id === orderId
    );

    if (!previousOrder || previousOrder.status === newStatus) return;

    try {
      setUpdatingOrderId(orderId);
      setError("");
      setNotice("");

      await updateAdminOrderStatus(orderId, newStatus);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setNotice("Order status updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Get a readable customer name.
  const getCustomerName = (order) =>
    order.user?.name ||
    order.user?.fullName ||
    order.customer?.name ||
    order.shippingAddress?.fullName ||
    "Customer";

  // Support common order total field names.
  const getOrderTotal = (order) => {
    const total =
      order.totalAmount ??
      order.totalPrice ??
      order.total;

    if (total !== undefined && total !== null) {
      return Number(total) || 0;
    }

    return (order.items || []).reduce((sum, item) => {
      const price = Number(item.price ?? item.product?.price ?? 0);
      const quantity = Number(item.quantity ?? 1);

      return sum + price * quantity;
    }, 0);
  };

  if (loading) {
    return (
      <section className="admin-orders-page">
        <p>Loading orders...</p>
      </section>
    );
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-heading">
        <div>
          <h1>Manage Orders</h1>
          <p>View customer orders and update their status.</p>
        </div>

        <button
          type="button"
          className="orders-refresh-btn"
          onClick={loadOrders}
        >
          Refresh
        </button>
      </div>

      {error && <p className="orders-error">{error}</p>}
      {notice && <p className="orders-notice">{notice}</p>}

      <div className="orders-summary">
        <span>Total orders</span>
        <strong>{orders.length}</strong>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <h2>No orders found</h2>
          <p>Customer orders will appear here when available.</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const currentStatus = String(
                  order.status || "pending"
                ).toLowerCase();

                return (
                  <tr key={order._id}>
                    <td className="order-id">
                      #{String(order._id).slice(-8)}
                    </td>

                    <td>
                      <strong>{getCustomerName(order)}</strong>
                      {order.user?.email && (
                        <small>{order.user.email}</small>
                      )}
                    </td>

                    <td>
                      {(order.items || []).length} item(s)
                    </td>

                    <td>
                      {getOrderTotal(order).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2,
                          maximumFractionDigits: 2 }
                      )}
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <select
                        className="order-status-select"
                        value={currentStatus}
                        disabled={updatingOrderId === order._id}
                        onChange={(event) =>
                          handleStatusChange(
                            order._id,
                            event.target.value
                          )
                        }
                      >
                        {!ORDER_STATUSES.includes(currentStatus) && (
                          <option value={currentStatus}>
                            {currentStatus}
                          </option>
                        )}

                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </option>
                        ))}
                      </select>

                      {updatingOrderId === order._id && (
                        <small>Saving...</small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminOrders;