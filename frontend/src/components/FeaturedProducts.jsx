import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/productService";
import "../style/FeaturedProducts.css";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        
        }
       
      } 
       catch (err) {
        console.error("error loading product:", err);

        if (isMounted) {
          setError(
            err.message || "Unable to load featured products."
          );
        }
       
      } finally {
       if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();
  return () => {
      isMounted = false;
    };
  }, []);

   const featuredProducts = products.slice(0, 4);

  return (
    <section className="featured-products-section"
      aria-labelledby="featured-products-title"
    >

      <div className="featured-products-heading">
        <div className="featured-products-heading-content">
          <span className="featured-products-label">
            OUR COLLECTION
          </span>

          <h2 id="featured-products-title">
            Featured Products
          </h2>

          <p>
            Discover quality products, explore your favourites,
            and find something that suits your needs.
          </p>
        </div>

        <Link to="/products" className="view-all-button" >
          View All 
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {loading && (
        <div className="featured-products-message">
          <p>Loading products...</p>
        </div>
      )}

      {!loading && error && (
        <div className="featured-products-message featured-products-error" role="alert">
          <p>{error}</p>
          <Link to="/products"> Browse All Products </Link>
        </div>
      )}

      {!loading && !error && featuredProducts.length > 0 && (
        <div className="featured-products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id}
             product={product}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && featuredProducts.length === 0 && (
        <div className="featured-products-message">
          <p>No products are available yet.</p>

          <Link to="/products"> Browse Products </Link>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;