
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProductById } from "../services/productService";
import { getProductImage } from "../utils/productImages";
import "../style/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");

  // Fetch the selected product from the backend.
  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(id);

        if (isMounted) {
          setProduct(data);
          setSelectedImage(0);
          setQuantity(1);
        }
      } catch (error) {
        console.error("Error loading product:", error);

        if (isMounted) {
          setError(error.message || "Unable to load this product.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error || !product) {
    return (
      <section className="product-details-page">
        <p>{error || "Product not found."}</p>
      </section>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images
    : product.images
      ? [product.images]
      : [];

  const currentImage = getProductImage(images[selectedImage]);

  // Prevent the quantity from exceeding the available stock.
  const handleQuantityIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((currentQuantity) => currentQuantity + 1);
    }
  };

  const handleQuantityDecrease = () => {
    setQuantity((currentQuantity) =>
      currentQuantity > 1 ? currentQuantity - 1 : 1
    );
  };

  // Send the selected quantity in one backend request.
  const handleAddToCart = async () => {
    if (addingToCart || product.stock <= 0) return;

    setCartError("");
    setAddingToCart(true);

    try {
      const result = await addToCart(product, quantity);

      if (!result?.success) {
        setCartError(
          result?.message || "Unable to add this product to your cart."
        );
        return;
      }

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
    <section className="product-details-page">

      <div className="product-details-container">

        {/* Product images */}
        <div className="product-gallery">

          <div className="product-main-image">
            {currentImage ? (
              <img src={currentImage} alt={product.title} />
            ) : (
              <span>{product.title}</span>
            )}
          </div>

          <div className="product-thumbnails">
            {images.map((image, index) => {
              const imageUrl = getProductImage(image);

              return (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`product-thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`${product.title} view ${index + 1}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Product information */}
        <div className="product-details-info">

          <span className="product-details-category">
            {product.category}
          </span>

          <h1>{product.title}</h1>

          <p className="product-details-subtitle">
            {product.subtitle}
          </p>

          <div className="product-details-rating">
            <span>★ {product.rating}</span>
            <span>{product.reviewsCount} reviews</span>
          </div>

          <div className="product-details-price">
            ${Number(product.price).toFixed(2)}
          </div>

          {product.monthlyPrice != null && (
            <p className="monthly-price">
              Or ${Number(product.monthlyPrice).toFixed(2)} / month
            </p>
          )}

          {product.isDiscounted && (
            <span className="discount-badge">
              {product.discountPercent}% OFF
            </span>
          )}

          <div className="product-stock">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </div>


          {product.stock > 0 && (
            <div className="quantity-section">

              <span>Quantity</span>

              <div className="quantity-control">

                <button type="button" onClick={handleQuantityDecrease} 
                disabled={
                  quantity <= 1 || addingToCart
                }
                  aria-label="Decrease quantity"
                >
                  -
                </button>

                <span>{quantity}</span>

                <button type="button" onClick={handleQuantityIncrease}
                  disabled={
                    quantity >= product.stock || addingToCart
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>
            </div>
          )}

          {cartError && (
            <div className="product-cart-error" role="alert">
              <p>{cartError}</p>

              {!localStorage.getItem("shopcartToken") && (
                <Link to="/login">Log in to continue</Link>
              )}
            </div>
          )}

          <button type="button" className="details-add-to-cart" disabled={product.stock <= 0 || addingToCart}
            onClick={handleAddToCart}
          >
            {product.stock <= 0
              ? "Out of Stock"
              : addingToCart
                ? "Adding..."
                : "Add to Cart"}
          </button>

        </div>
      </div>

    </section>
  );
};

export default ProductDetails;
