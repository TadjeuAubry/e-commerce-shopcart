import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/productService";
import "../style/FeaturedProducts.css";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("error loading product:", err)
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="featured-products-section">

      <div className="featured-products-heading">

        <div>
          <span className="featured-products-label">
            OUR PRODUCTS
          </span>

          <h2>Featured Products</h2>
          <p>
            Discover some of our most popular products.
          </p>
        </div>

      </div>

      {loading && <p>Loading products...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="featured-products-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </section>
  );
};

export default FeaturedProducts;