import { useEffect, useState } from "react";
import { getAdminOrders, updateAdminOrderStatus,} from "../services/adminService";
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
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      setNotice("");

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

  const getShippingAddress = (order) => {
  const address =
    order.shippingAddress ||
    order.deliveryAddress ||
    order.address;

  if (!address) return "Not provided";

  if (typeof address === "string") return address;

  if (typeof address === "object") {
    const parts = [
      address.fullName,
      address.addressLine1,
      address.addressLine2,
      address.street,
      address.city,
      address.region,
      address.state,
      address.postalCode,
      address.zipCode,
      address.country,
    ].filter(Boolean);

    return parts.length ? parts.join(", ") : "Not provided";
  }

  return "Not provided";
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
                <th>Details</th>
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

                    <td>
                        <button type="button" className="order-view-btn" onClick={() => setSelectedOrder(order)}>
                          View Details
                        </button>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
  <div
    className="order-modal-backdrop"
    onClick={(event) => {
      if (event.target === event.currentTarget) {
        setSelectedOrder(null);
      }
    }}
  >
    <section
      className="order-details-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
    >
      <div className="order-details-header">
        <div>
          <h2 id="order-details-title">Order Details</h2>
          <p>
            Order #{String(selectedOrder._id).slice(-8)}
          </p>
        </div>

        <button
          type="button"
          className="order-close-btn"
          onClick={() => setSelectedOrder(null)}
          aria-label="Close order details"
        >
          ×
        </button>
      </div>

      <div className="order-details-grid">
        <div>
          <strong>Customer</strong>
          <span>{getCustomerName(selectedOrder)}</span>
        </div>

        <div>
          <strong>Email</strong>
          <span>
            {selectedOrder.user?.email ||
              selectedOrder.customer?.email ||
              "Not provided"}
          </span>
        </div>

        <div>
          <strong>Phone</strong>
          <span>
            {selectedOrder.user?.phone ||
              selectedOrder.customer?.phone ||
              selectedOrder.shippingAddress?.phone ||
              "Not provided"}
          </span>
        </div>

        <div>
          <strong>Order date</strong>
          <span>{formatDate(selectedOrder.createdAt)}</span>
        </div>

        <div>
          <strong>Status</strong>
          <span>
            {selectedOrder.status || "Pending"}
          </span>
        </div>

        <div>
          <strong>Delivery address</strong>
          <span>
            {getShippingAddress(selectedOrder)}
          </span>
        </div>
      </div>

      <h3>Ordered Products</h3>

      {Array.isArray(selectedOrder.items) &&
      selectedOrder.items.length > 0 ? (
        <div className="order-details-table-wrapper">
          <table className="order-details-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {selectedOrder.items.map((item, index) => {
                const productName =
                  item.product?.name ||
                  item.productName ||
                  item.name ||
                  item.title ||
                  "Product";

                const quantity = Number(item.quantity ?? 1);

                const price = Number(
                  item.price ?? item.product?.price ?? 0
                );

                return (
                  <tr key={
                      item._id ||
                      item.product?._id ||
                      `${productName}-${index}`
                    }
                  >
                    <td>{productName}</td>
                    <td>{quantity}</td>
                    <td>
                      {price.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {(price * quantity).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No item details were returned for this order.</p>
      )}

      <div className="order-details-total">
        <strong>Order Total</strong>

        <strong>
          {getOrderTotal(selectedOrder).toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </strong>
      </div>
    </section>
  </div>
)}
    </section>
  );
};

export default AdminOrders;