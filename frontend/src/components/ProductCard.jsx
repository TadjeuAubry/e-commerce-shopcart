import { getProductImage } from "../utils/productImages";
import "../style/ProductCard.css";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const imageName = Array.isArray(product.images)
    ? product.images[0]
    : product.images;

  const imageUrl = getProductImage(imageName);

  const handleAddToCart = () => {
    addToCart(product);
    navigate("/cart");
  };
  
console.log("PRODUCT ID:", product._id);

  return (
    <article className="product-card">
       
        <Link to={`/products/${product._id}`} className="product-image-link" >
         <div className="product-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title}  className="product-image"/>
        ) : (
          <span>{product.title}</span>
        )}
      </div>

     </Link>

     
      <div className="product-info">

        <span className="product-category"> {product.category} </span>
         <Link to={`/products/${product._id}`} className="product-title-link" >
         <h3>{product.title}</h3>
         </Link>

        <p className="product-description"> {product.subtitle} </p>

        <div className="product-bottom">

          <span className="product-price">${product.price.toFixed(2)} </span>
          <span className="product-rating"> ★ {product.rating} ({product.reviewsCount}) </span>

        </div>

         <button
          type="button" className="add-to-cart-button" onClick={handleAddToCart} >
          Add to Cart
        </button>

      </div>

    </article>
  );
};

export default ProductCard;