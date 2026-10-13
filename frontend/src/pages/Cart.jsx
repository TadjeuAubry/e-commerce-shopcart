import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProductImage } from "../utils/productImages";
import "../style/Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  if (cartItems.length === 0) {
    return (
      <section className="cart-page cart-empty">

        <div className="cart-empty-content">
          <h1>Your Cart Is Empty</h1>
          <p>
            You haven't added any products to your cart yet.
          </p>

          <button type="button" className="continue-shopping-button" onClick={() => navigate("/products")} >
            Continue Shopping
          </button>

        </div>

      </section>
    );
  }

  return (
    <section className="cart-page">

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
          type="button" className="clear-cart-button" onClick={clearCart}>
          Clear Cart
        </button>

      </div>

      <div className="cart-layout">

        <div className="cart-items">

          {cartItems.map((item) => {

            const imageName = Array.isArray(item.images)
              ? item.images[0]
              : item.images;

            const imageUrl = getProductImage(imageName);
            const subtotal = item.price * item.quantity;

            return (
              <article className="cart-item" key={item._id}>
                <div className="cart-item-image">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.title} />
                  ) : (
                    <span>{item.title}</span>
                  )}
                </div>

                <div className="cart-item-details">
                  <span className="cart-item-category">
                    {item.category}
                  </span>

                  <h2>{item.title}</h2>

                  <p>
                    {item.subtitle}
                  </p>

                  <span className="cart-item-price">
                    ${item.price.toFixed(2)}
                  </span>

                  <div className="cart-item-actions">
                    <div className="quantity-control">

                      <button type="button" onClick={() => decreaseQuantity(item._id)}>
                        -
                      </button>

                      <span> {item.quantity} </span>

                      <button type="button" onClick={() => increaseQuantity(item._id)} >
                        +
                      </button>
                    </div>

                    <button type="button" className="remove-item-button" onClick={() => removeFromCart(item._id)}>
                      Remove
                    </button>

                  </div>
                </div>

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
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Total</span>
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>

          <button type="button" className="checkout-button" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>

          <button type="button" className="continue-shopping-button" onClick={() => navigate("/products")}>
            Continue Shopping
          </button>

        </aside>
      </div>

    </section>
  );
};

export default Cart;