
import { useCallback, useEffect, useState } from "react";
import { getMyOrders, getMyOrderById,} from "../services/orderService";
import "../style/MyOrders.css";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatMoney = (amount) => {
  const value = Number(amount);

  return (Number.isFinite(value) ? value : 0).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};

const getOrderStatus = (order) =>
  String(order.status ?? order.orderStatus ?? "pending")
    .toLowerCase();

const getOrderTotal = (order) => {
  const total =
    order.totalAmount ??
    order.totalPrice ??
    order.total;

  if (total !== undefined && total !== null) {
    const value = Number(total);
    return Number.isFinite(value) ? value : 0;
  }

  return (order.items || []).reduce((sum, item) => {
    const price = Number(
      item.price ?? item.product?.price ?? 0
    );

    const quantity = Number(item.quantity ?? 1);

    return sum + price * quantity;
  }, 0);
};

const getProductName = (item) =>
  item.product?.name ||
  item.productName ||
  item.name ||
  item.title ||
  "ShopCart Product";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setNotice("");

      const result = await getMyOrders();

      const orderData = Array.isArray(result.data)
        ? result.data
        : result.data?.orders;

      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      setError(
        err.message || "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Retrieve the full information for one customer order.
  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const result = await getMyOrderById(order._id);

      const detailedOrder =
        result.data?.order ?? result.data;

      if (
        detailedOrder &&
        typeof detailedOrder === "object" &&
        !Array.isArray(detailedOrder)
      ) {
        setSelectedOrder(detailedOrder);
      } else {
        setDetailsError(
          "The server did not return the order details."
        );
      }
    } catch (err) {
      setDetailsError(
        err.message || "Unable to retrieve order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    setDetailsError("");
  };

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-message">
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="my-orders-page">

      <header className="my-orders-header">
        <div>
          <span className="my-orders-eyebrow">
            YOUR SHOPCART ACCOUNT
          </span>

          <h1>My Orders</h1>
          <p> View your purchases and keep track of your orders. </p>
        </div>

        <button  type="button" className="my-orders-refresh" onClick={loadOrders} >
          Refresh Orders
        </button>
      </header>

      {/* Error messages */}
      {error && (
        <div className="my-orders-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadOrders}>
            Try Again
          </button>
        </div>
      )}

      {notice && (
        <p className="my-orders-notice" role="status">
             {notice}
        </p>
      )}

      {/* Orders count */}
      {!error && (
        <div className="my-orders-summary">
          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>

          <div>
            <span>Delivered Orders</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    getOrderStatus(order) === "delivered"
                ).length
              }
            </strong>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!error && orders.length === 0 && (
        <section className="my-orders-empty">
          <div className="my-orders-empty-icon">
            <span aria-hidden="true">□</span>
          </div>

          <h2>You haven't placed any orders yet</h2>

          <p>
            When you purchase products from ShopCart,
            your orders will appear here.
          </p>

          <a href="/products" className="my-orders-shop-link">
            Start Shopping
          </a>
        </section>
      )}

      {/* Customer order cards */}
      {!error && orders.length > 0 && (
        <section className="my-orders-list">
          {orders.map((order) => {
            const status = getOrderStatus(order);
            const items = Array.isArray(order.items)
              ? order.items
              : [];

            return (
              <article className="my-order-card" key={order._id}>
                
                <div className="my-order-card-header">
                  <div>
                    <span className="my-order-label">
                      ORDER NUMBER
                    </span>

                    <h2> #{String(order._id).slice(-8)} </h2>
                  </div>

                  <span className={`my-order-status status-${status.replace( /[^a-z0-9-]/g, "")}`}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1)}
                  </span>
                </div>

                <div className="my-order-information">
                  <div>
                    <span>Order Date</span>
                    <strong>
                      {formatDate(order.createdAt)}
                    </strong>
                  </div>

                  <div>
                    <span>Products</span>
                    <strong>
                      {items.reduce(
                        (total, item) =>
                          total + Number(item.quantity ?? 1),
                        0
                      )}{" "}
                      item(s)
                    </strong>
                  </div>

                  <div>
                    <span>Order Total</span>
                    <strong>
                      {formatMoney(getOrderTotal(order))}
                    </strong>
                  </div>
                </div>

                <div className="my-order-products">
                  {items.slice(0, 3).map((item, index) => (
                    <div className="my-order-product"
                      key={
                        item._id ||
                        item.product?._id ||
                        `${order._id}-${index}`
                      }
                    >
                      <span>{getProductName(item)}</span>
                      <span> Qty: {Number(item.quantity ?? 1)} </span>
                    </div>
                  ))}

                  {items.length > 3 && (
                    <p className="my-order-more-products">
                      +{items.length - 3} more product(s)
                    </p>
                  )}

                  {items.length === 0 && (
                    <p>
                      Product details are not available in
                      this order summary.
                    </p>
                  )}
                </div>

                {/* Action */}
                <div className="my-order-card-footer">
                  <span>
                    Status:{" "}
                    {status.charAt(0).toUpperCase() +
                      status.slice(1)}
                  </span>

                  <button type="button" className="my-order-details-button" onClick={() => handleViewDetails(order)}>
                    View Details
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selectedOrder && (
        <div
          className="my-order-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <section
            className="my-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-order-modal-title"
          >
            <div className="my-order-modal-header">
              <div>
                <h2 id="my-order-modal-title">
                  Order Details
                </h2>

                <p>
                  Order #
                  {String(selectedOrder._id).slice(-8)}
                </p>
              </div>

              <button type="button" className="my-order-modal-close" onClick={closeDetails}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            {detailsLoading && (
              <p>Loading order details...</p>
            )}

            {detailsError && (
              <div className="my-order-details-error">
                <p>{detailsError}</p>
                <p>
                  The order summary is still displayed when
                  available.
                </p>
              </div>
            )}

            <div className="my-order-detail-grid">
              <div>
                <span>Order Date</span>
                <strong>
                  {formatDate(selectedOrder.createdAt)}
                </strong>
              </div>

              <div>
                <span>Order Status</span>
                <strong>
                  {getOrderStatus(selectedOrder)
                    .charAt(0)
                    .toUpperCase() +
                    getOrderStatus(selectedOrder).slice(1)}
                </strong>
              </div>

              <div>
                <span>Order Total</span>
                <strong>
                  {formatMoney(
                    getOrderTotal(selectedOrder)
                  )}
                </strong>
              </div>

              <div>
                <span>Number of Products</span>
                <strong>
                  {(selectedOrder.items || []).length}
                </strong>
              </div>
            </div>

            <h3>Products in This Order</h3>

            {Array.isArray(selectedOrder.items) &&
            selectedOrder.items.length > 0 ? (
              <div className="my-order-detail-table-wrapper">
                <table className="my-order-detail-table">
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
                        const price = Number(
                          item.price ??
                            item.product?.price ??
                            0
                        );

                        const quantity = Number( item.quantity ?? 1 );

                        return (
                          <tr
                            key={
                              item._id ||
                              item.product?._id ||
                              `${selectedOrder._id}-${index}`
                            }
                          >
                            <td>{getProductName(item)}</td>
                            <td>{quantity}</td>
                            <td>{formatMoney(price)}</td>
                            <td>
                              {formatMoney(price * quantity)}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                No product details were returned for this order.
              </p>
            )}

            {(selectedOrder.shippingAddress ||
              selectedOrder.deliveryAddress ||
              selectedOrder.address) && (
              <div className="my-order-delivery">
                <h3>Delivery Information</h3>

                <p>
                  {typeof (
                    selectedOrder.shippingAddress ||
                    selectedOrder.deliveryAddress ||
                    selectedOrder.address
                  ) === "string"
                    ? selectedOrder.shippingAddress ||
                      selectedOrder.deliveryAddress ||
                      selectedOrder.address
                    : [
                        (
                          selectedOrder.shippingAddress ||
                          selectedOrder.deliveryAddress ||
                          selectedOrder.address
                        )?.fullName,
                        (
                          selectedOrder.shippingAddress ||
                          selectedOrder.deliveryAddress ||
                          selectedOrder.address
                        )?.addressLine1,
                        (
                          selectedOrder.shippingAddress ||
                          selectedOrder.deliveryAddress ||
                          selectedOrder.address
                        )?.street,
                        (
                          selectedOrder.shippingAddress ||
                          selectedOrder.deliveryAddress ||
                          selectedOrder.address
                        )?.city,
                        (
                          selectedOrder.shippingAddress ||
                          selectedOrder.deliveryAddress ||
                          selectedOrder.address
                        )?.region,
                        (
                          selectedOrder.shippingAddress ||
                          selectedOrder.deliveryAddress ||
                          selectedOrder.address
                        )?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Address not provided"}
                </p>
              </div>
            )}

            <div className="my-order-modal-total">
              <span>Total</span>
              <strong>
                {formatMoney(getOrderTotal(selectedOrder))}
              </strong>
            </div>

            <button type="button"className="my-order-modal-done" onClick={closeDetails}>
              Close Details
            </button>
          </section>
        </div>
      )}

    </main>
  );
};

export default MyOrders;
