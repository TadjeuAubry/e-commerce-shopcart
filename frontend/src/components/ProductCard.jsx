
import { useState } from "react";
import { getProductImage } from "../utils/productImages";
import "../style/ProductCard.css";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const imageName = Array.isArray(product.images)
    ? product.images[0]
    : product.images;

  const imageUrl = getProductImage(imageName);

  // Add the product and wait for the backend response.
  const handleAddToCart = async () => {
    setCartError("");

    if (addingToCart) return;

    setAddingToCart(true);

    try {
      const result = await addToCart(product, 1);

      if (!result?.success) {
        setCartError(
          result?.message || "Unable to add this product to your cart."
        );
        return;
      }

      // Navigate only after the backend confirms success.
      navigate("/cart");
    } catch (error) {
      setCartError(
        error.message || "Unable to add this product to your cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <article className="product-card">

      <Link
        to={`/products/${product._id}`}
        className="product-image-link"
      >
        <div className="product-image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="product-image"
            />
          ) : (
            <span>{product.title}</span>
          )}
        </div>
      </Link>

      <div className="product-info">

        <span className="product-category">
          {product.category}
        </span>

        <Link
          to={`/products/${product._id}`}
          className="product-title-link"
        >
          <h3>{product.title}</h3>
        </Link>

        <p className="product-description">
          {product.subtitle}
        </p>

        <div className="product-bottom">
          <span className="product-price">
            ${Number(product.price).toFixed(2)}
          </span>

          <span className="product-rating">
            ★ {product.rating} ({product.reviewsCount})
          </span>
        </div>

        {cartError && (
          <div className="product-cart-error" role="alert">
            <p>{cartError}</p>

            {!localStorage.getItem("shopcartToken") && (
              <Link to="/login">Log in to continue</Link>
            )}
          </div>
        )}

        <button
          type="button"
          className="add-to-cart-button"
          onClick={handleAddToCart}
          disabled={addingToCart || product.stock <= 0}
        >
          {product.stock <= 0
            ? "Out of Stock"
            : addingToCart
              ? "Adding..."
              : "Add to Cart"}
        </button>

      </div>
    </article>
  );
};

export default ProductCard;
