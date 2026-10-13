
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProductImage } from "../utils/productImages";
import "../style/Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    cartLoading,
    cartError,
    setCartError,
    refreshCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  // Calculate the total using the backend product prices.
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // ==========================================
  // 1. LOADING STATE
  // ==========================================

  if (cartLoading) {
    return (
      <section className="cart-page cart-loading-state">
        <div className="cart-empty-content">
          <h1>Loading Your Cart...</h1>
          <p>Fetching your saved cart from ShopCart.</p>
        </div>
      </section>
    );
  }

  // ==========================================
  // 2. EMPTY CART
  // ==========================================

  if (cartItems.length === 0) {
    return (
      <section className="cart-page cart-empty">
        <div className="cart-empty-content">
          <h1>Your Cart Is Empty</h1>

          <p>
            You haven't added any products to your cart yet.
          </p>

          {cartError && (
            <div className="cart-error-message" role="alert">
              <p>{cartError}</p>

              <button
                type="button"
                onClick={refreshCart}
              >
                Try Again
              </button>
            </div>
          )}

          <button
            type="button"
            className="continue-shopping-button"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  // ==========================================
  // 3. CART WITH PRODUCTS
  // ==========================================

  return (
    <section className="cart-page">

      {/* Cart heading */}
      <div className="cart-header">
        <div>
          <span className="cart-label">
            SHOPPING CART
          </span>

          <h1>Your Cart</h1>

          <p>
            Review your selected products before checkout.
          </p>
        </div>

        <button
          type="button"
          className="clear-cart-button"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>

      {/* Backend operation errors */}
      {cartError && (
        <div className="cart-error-message" role="alert">
          <p>{cartError}</p>

          <button
            type="button"
            onClick={() => setCartError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="cart-layout">

        {/* Product list */}
        <div className="cart-items">

          {cartItems.map((item) => {
            const imageName = Array.isArray(item.images)
              ? item.images[0]
              : item.images;

            const imageUrl = getProductImage(imageName);

            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 1);
            const subtotal = price * quantity;

            return (
              <article
                className="cart-item"
                key={item._id}
              >

                {/* Product image */}
                <div className="cart-item-image">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title || "ShopCart product"}
                    />
                  ) : (
                    <span>{item.title}</span>
                  )}
                </div>

                {/* Product information */}
                <div className="cart-item-details">

                  <span className="cart-item-category">
                    {item.category}
                  </span>

                  <h2>{item.title}</h2>

                  <p>{item.subtitle}</p>

                  <span className="cart-item-price">
                    ${price.toFixed(2)}
                  </span>

                  {/* Quantity and remove controls */}
                  <div className="cart-item-actions">

                    <div className="quantity-control">

                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.title}`}
                        onClick={() =>
                          decreaseQuantity(item._id)
                        }
                      >
                        -
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.title}`}
                        onClick={() =>
                          increaseQuantity(item._id)
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() =>
                        removeFromCart(item._id)
                      }
                    >
                      Remove
                    </button>

                  </div>
                </div>

                {/* Product subtotal */}
                <div className="cart-item-subtotal">
                  <span>Subtotal</span>

                  <strong>
                    ${subtotal.toFixed(2)}
                  </strong>
                </div>

              </article>
            );
          })}

        </div>

        <aside className="cart-summary">

          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong> ${cartTotal.toFixed(2)}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <strong> ${cartTotal.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>

          <button
            type="button"
            className="continue-shopping-button"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>

        </aside>
      </div>

    </section>
  );
};

export default Cart;
