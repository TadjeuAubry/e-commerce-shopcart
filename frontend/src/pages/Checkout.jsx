
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createMyOrder } from "../services/orderService";
import { getProductImage } from "../utils/productImages";
import "../style/Checkout.css";

const INITIAL_ADDRESS = {
  fullName: "",
  phone: "",
  city: "",
  region: "",
  address: "",
};

const validateField = (name, value) => {
  const trimmedValue = value.trim();

  switch (name) {
    case "fullName":
      if (!trimmedValue) return "Full name is required.";
      if (trimmedValue.length < 2) {
        return "Full name must contain at least 2 characters.";
      }
      return "";

    case "phone":
      if (!trimmedValue) return "Phone number is required.";
      if (trimmedValue.length < 6) {
        return "Phone number must contain at least 6 characters.";
      }
      return "";

    case "city":
      if (!trimmedValue) return "City is required.";
      if (trimmedValue.length < 2) {
        return "City must contain at least 2 characters.";
      }
      return "";

    case "address":
      if (!trimmedValue) {
        return "Delivery address is required.";
      }
      if (trimmedValue.length < 5) {
        return "Address must contain at least 5 characters.";
      }
      return "";

    default:
      return "";
  }
};

const validateForm = (formData) => {
  const errors = {};

  ["fullName", "phone", "city", "address"].forEach((field) => {
    const message = validateField(field, formData[field]);

    if (message) {
      errors[field] = message;
    }
  });

  return errors;
};

const Checkout = () => {
  const navigate = useNavigate();

  const { cartItems, cartLoading, refreshCart } = useCart();

  const [shippingAddress, setShippingAddress] =
    useState(INITIAL_ADDRESS);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(
    localStorage.getItem("shopcartToken")
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");

    setFieldErrors((currentErrors) => {
      if (!currentErrors[name]) return currentErrors;

      const message = validateField(name, value);
      const updatedErrors = { ...currentErrors };

      if (message) {
        updatedErrors[name] = message;
      } else {
        delete updatedErrors[name];
      }

      return updatedErrors;
    });
  };


  const handleBlur = (event) => {
    const { name, value } = event.target;
    const message = validateField(name, value);

    setFieldErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      if (message) {
        updatedErrors[name] = message;
      } else {
        delete updatedErrors[name];
      }

      return updatedErrors;
    });
  };

  // Submit the order only after successful client-side validation.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    const errors = validateForm(shippingAddress);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please correct the highlighted fields.");
      return;
    }

    if (!isLoggedIn) {
      setError("Please log in before placing your order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
          const result = await createMyOrder({
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            city: shippingAddress.city.trim(),
            region: shippingAddress.region.trim(),
            address: shippingAddress.address.trim(),
        });

// Extract the order returned by the backend.
const createdOrder = result?.data?.order ?? result?.data;

await refreshCart();

navigate("/order-confirmation", {
  replace: true,
  state: {
    order: createdOrder,
  },
});

    } catch (err) {
      setError(
        err.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <main className="checkout-page">
        <div className="checkout-message">
          <h1>Preparing Checkout</h1>
          <p>Loading your saved cart...</p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="checkout-page">
        <div className="checkout-message">
          <h1>Please Sign In</h1>
          <p>
            Log in to your ShopCart account before placing an order.
          </p>
          <Link to="/login" className="checkout-primary-link">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-message">
          <h1>Your Cart Is Empty</h1>
          <p>
            Add a product before proceeding to checkout.
          </p>
          <Link to="/" className="checkout-primary-link">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <div>
          <span className="checkout-eyebrow">
            SHOPCART CHECKOUT
          </span>
          <h1>Complete Your Order</h1>
          <p>
            Enter your delivery details and review your order.
          </p>
        </div>

        <Link to="/cart" className="checkout-back-link">
          ← Back to Cart
        </Link>
      </header>

      {error && (
        <div className="checkout-error" role="alert">
          <strong>Checkout needs your attention</strong>
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="checkout-layout"
        noValidate
      >
        <section className="checkout-form-section">
          <div className="checkout-section-heading">
            <span className="checkout-step-number">1</span>
            <div>
              <h2>Delivery Information</h2>
              <p>Where should we deliver your order?</p>
            </div>
          </div>

          <div className="checkout-fields">
            <div className="checkout-field">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={shippingAddress.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                required
                minLength={2}
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={
                  fieldErrors.fullName
                    ? "fullName-error"
                    : undefined
                }
                disabled={submitting}
              />
              {fieldErrors.fullName && (
                <p id="fullName-error" className="checkout-field-error">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={shippingAddress.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your phone number"
                required
                minLength={6}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={
                  fieldErrors.phone ? "phone-error" : undefined
                }
                disabled={submitting}
              />
              {fieldErrors.phone && (
                <p id="phone-error" className="checkout-field-error">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="city">City *</label>
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                value={shippingAddress.city}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your city"
                required
                minLength={2}
                aria-invalid={Boolean(fieldErrors.city)}
                aria-describedby={
                  fieldErrors.city ? "city-error" : undefined
                }
                disabled={submitting}
              />
              {fieldErrors.city && (
                <p id="city-error" className="checkout-field-error">
                  {fieldErrors.city}
                </p>
              )}
            </div>

            <div className="checkout-field">
              <label htmlFor="region">Region / State</label>
              <input
                id="region"
                name="region"
                type="text"
                autoComplete="address-level1"
                value={shippingAddress.region}
                onChange={handleChange}
                placeholder="Enter your region"
                disabled={submitting}
              />
            </div>

            <div className="checkout-field checkout-field-full">
              <label htmlFor="address">
                Complete Delivery Address *
              </label>
              <textarea
                id="address"
                name="address"
                autoComplete="street-address"
                value={shippingAddress.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your neighbourhood, street, building, or delivery directions"
                required
                minLength={5}
                rows={4}
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={
                  fieldErrors.address
                    ? "address-error"
                    : undefined
                }
                disabled={submitting}
              />
              {fieldErrors.address && (
                <p id="address-error" className="checkout-field-error">
                  {fieldErrors.address}
                </p>
              )}
            </div>
          </div>

          <p className="checkout-required-note">
            * Required fields
          </p>
        </section>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>
          <p className="checkout-summary-description">
            Review the products you are ordering.
          </p>

          <div className="checkout-summary-products">
            {cartItems.map((item) => {
              const imageName = Array.isArray(item.images)
                ? item.images[0]
                : item.images;

              const imageUrl = getProductImage(imageName);
              const quantity = Number(item.quantity || 1);
              const price = Number(item.price || 0);

              return (
                <div className="checkout-product" key={item._id}>
                  <div className="checkout-product-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.title} />
                    ) : (
                      <span>{item.title}</span>
                    )}
                    <span className="checkout-product-quantity">
                      {quantity}
                    </span>
                  </div>

                  <div className="checkout-product-info">
                    <strong>{item.title}</strong>
                    <span>${price.toFixed(2)} each</span>
                  </div>

                  <strong className="checkout-product-subtotal">
                    ${(price * quantity).toFixed(2)}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>

          <div className="checkout-summary-row">
            <span>Delivery</span>
            <span>To be confirmed</span>
          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-summary-total">
            <span>Order Total</span>
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>

          <p className="checkout-total-note">
            The backend calculates the final order total using
            the saved cart and current product prices.
          </p>

          <button
            type="submit"
            className="checkout-place-order-button"
            disabled={submitting}
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>

          <p className="checkout-payment-note">
            Payment integration will be added in a later stage.
          </p>
        </aside>
      </form>
    </main>
  );
};

export default Checkout;
