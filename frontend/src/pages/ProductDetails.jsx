import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error loading product:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error || !product) {
    return <p>{error || "Product not found."}</p>;
  }

  const images = Array.isArray(product.images)
    ? product.images
    : [product.images];

  const currentImage = getProductImage(images[selectedImage]);

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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
      addToCart(product);
    } 
    navigate("/cart");

  };

  return (
    <section className="product-details-page">

      <div className="product-details-container">
        <div className="product-gallery">

          <div className="product-main-image">
            {currentImage && (
              <img src={currentImage} alt={product.title}/>
            )}
          </div>

          <div className="product-thumbnails">
            {images.map((image, index) => {
              const imageUrl = getProductImage(image);

              return (
                <button type="button" key={image} className={`product-thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  {imageUrl && (
                    <img src={imageUrl} alt={`${product.title} view ${index + 1}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

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
            <span> {product.reviewsCount} reviews </span>
          </div>

          <div className="product-details-price">
            ${product.price.toFixed(2)}
          </div>

          {product.monthlyPrice && (
            <p className="monthly-price">
              Or ${product.monthlyPrice.toFixed(2)} / month
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

          <div className="quantity-section">

            <span>Quantity</span>
            <div className="quantity-control">

              <button type="button" onClick={handleQuantityDecrease} >
                -
              </button>
              <span>{quantity}</span>
              <button type="button"  onClick={handleQuantityIncrease}>
                +
              </button>

            </div>
          </div>

          <button type="button"  className="details-add-to-cart" disabled={product.stock === 0} onClick={handleAddToCart}>
            {product.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

        </div>
      </div>

    </section>
  );
};

export default ProductDetails;