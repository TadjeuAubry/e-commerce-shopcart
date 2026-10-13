
import { Link, useLocation } from "react-router-dom";
import "../style/OrderConfirmation.css";

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

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  const orderId = order?._id;
  const orderNumber = orderId
    ? String(orderId).slice(-8).toUpperCase()
    : null;

  const orderTotal =
    order?.totalAmount ?? order?.totalPrice ?? order?.total ?? 0;

  const orderStatus =
    order?.orderStatus ?? order?.status ?? "pending";

  return (
    <main className="order-confirmation-page">
      <section className="order-confirmation-card">

        <div
          className="order-confirmation-icon"
          aria-hidden="true"
        >
          ✓
        </div>

        <span className="order-confirmation-eyebrow">
          SHOPCART
        </span>

        <h1>
          {orderId
            ? "Order Placed Successfully!"
            : "Your Orders"}
        </h1>

        <p className="order-confirmation-description">
          {orderId
            ? "Thank you for shopping with ShopCart. Your order has been saved successfully."
            : "Visit your order history to review your recent purchases and track their status."}
        </p>

        {orderId && (
          <div className="order-confirmation-summary">

            <div>
              <span>Order Reference</span>
              <strong>#{orderNumber}</strong>
            </div>

            <div>
              <span>Order Total</span>
              <strong>${formatMoney(orderTotal)}</strong>
            </div>

            <div>
              <span>Order Status</span>
              <strong className="order-confirmation-status">
                {String(orderStatus).charAt(0).toUpperCase() +
                  String(orderStatus).slice(1)}
              </strong>
            </div>

          </div>
        )}

        <div className="order-confirmation-actions">

          <Link
            to="/orders"
            className="order-confirmation-primary"
          >
            View My Orders
          </Link>

          <Link
            to="/"
            className="order-confirmation-secondary"
          >
            Continue Shopping
          </Link>

        </div>

        <p className="order-confirmation-note">
          You can return to your ShopCart account at any time
          to review your orders.
        </p>

      </section>
    </main>
  );
};

export default OrderConfirmation;
