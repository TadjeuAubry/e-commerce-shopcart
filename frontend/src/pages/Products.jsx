
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productService";
import "../style/Products.css";

const normalizeCategory = (value = "") =>
  value.trim().toLowerCase().replace(/ies$/, "y").replace(/s$/, "");

const getCategoryLabel = (category) => {
  const normalized = normalizeCategory(category);

  const labels = {
    headphone: "Headphones",
    laptop: "Laptops",
    smartphone: "Smartphones",
    accessory: "Accessories",
  };

  return labels[normalized] || category;
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const showDeals = searchParams.get("deals") === "true";
  const requestedSort = searchParams.get("sort") || "featured";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [sortBy, setSortBy] = useState(requestedSort);

  // Fetch all products from the backend.
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
        if (isMounted) {
          setError(
            err.message || "Unable to load products."
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


  const categories = useMemo(() => {
    const uniqueCategories = new Map();

    products.forEach((product) => {
      if (product.category) {
        const key = normalizeCategory(product.category);

        if (!uniqueCategories.has(key)) {
          uniqueCategories.set(key, product.category);
        }
      }
    });

    return Array.from(uniqueCategories.values()).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = !selectedCategory ||
        normalizeCategory(product.category) ===
          normalizeCategory(selectedCategory);
          

      const searchableText = [
        product.title,
        product.subtitle,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);
      const matchesDeals = !showDeals || product.isDiscounted === true;

      return matchesCategory && matchesSearch && matchesDeals;
    });

    switch (sortBy) {
      case "name":
        result.sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
        break;
        
        case "newest":
           result.sort((a, b) =>
             new Date(b.createdAt || 0).getTime() -
             new Date(a.createdAt || 0).getTime()
          );
       break;

      case "price-low":
        result.sort(
          (a, b) => Number(a.price) - Number(b.price)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
        break;

      case "rating":
        result.sort(
          (a, b) => Number(b.rating) - Number(a.rating)
        );
        break;

      default:
        // Keep the original backend order.
        break;
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy]);

  const chooseCategory = (category) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm("");
    setSortBy("featured");
  };

  const categoryHeading = selectedCategory
    ? getCategoryLabel(selectedCategory)
    : "All Products";

  return (
    <main className="products-page">

      {/* Page heading */}
      <header className="products-page-header">
        <div>
          <span className="products-page-label">
            DISCOVER SHOPCART
          </span>

          <h1>{categoryHeading}</h1>

          <p>
            Explore our collection and find products that
            fit your needs.
          </p>
        </div>

        <Link to="/" className="products-back-home">
          ← Back to Home
        </Link>
      </header>

      {/* Search and sorting */}
      <section className="products-toolbar">
        <div className="products-search">
          <label htmlFor="product-search">
            Search products
          </label>

          <input
            id="product-search"
            type="search"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="products-sort">
          <label htmlFor="product-sort">
            Sort by
          </label>

          <select id="product-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)} >
            <option value="featured">Featured</option>
            <option value="name">Name: A to Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </section>

      {/* Category filters */}
      <section className="products-category-filters">
        <h2>Shop by Category</h2>

        <div className="products-category-list">
          <button
            type="button"
            className={`products-category-button ${
              !selectedCategory ? "active" : ""
            }`}
            onClick={() => chooseCategory("")}
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`products-category-button ${
                normalizeCategory(selectedCategory) ===
                normalizeCategory(category)
                  ? "active"
                  : ""
              }`}
              onClick={() => chooseCategory(category)}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </section>

      {/* Results heading */}
      <div className="products-results-heading">
        <div>
          <h2>
            {selectedCategory
              ? `${getCategoryLabel(selectedCategory)} Products`
              : "Explore Our Products"}
          </h2>

          {!loading && !error && (
            <p>
              {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"} found
            </p>
          )}
        </div>

        {(selectedCategory || searchTerm || sortBy !== "featured") && (
          <button
            type="button"
            className="products-clear-filters"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="products-page-message">
          <p>Loading products from ShopCart...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="products-page-message products-page-error">
          <h2>Unable to load products</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Product results */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="products-page-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="products-page-message">
          <h2>No products found</h2>

          <p>
            Try another search term or choose a different category.
          </p>

          <button
            type="button"
            onClick={clearFilters}
          >
            View All Products
          </button>
        </div>
      )}

    </main>
  );
};

export default Products;
