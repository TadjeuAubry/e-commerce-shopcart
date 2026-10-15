import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/productService";
import "../style/Navbar.css";
import Logo from "../assets/home/Logo.jpg";

const readAuth = () => {
  const token = localStorage.getItem("shopcartToken");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("shopcartUser") || "null");
  } catch {
    user = null;
  }

  return {
    isLoggedIn: Boolean(token),
    user,
  };
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

  const [auth, setAuth] = useState(readAuth);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setAuth(readAuth());
    };

    window.addEventListener("shopcart-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("shopcart-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const products = await getProducts();
        const uniqueCategories = new Map();

        (Array.isArray(products) ? products : []).forEach((product) => {
          const category = product.category?.trim();

          if (!category) return;

          const key = category.toLowerCase();

          if (!uniqueCategories.has(key)) {
            uniqueCategories.set(key, category);
          }
        });

        if (isMounted) {
          setCategories(
            Array.from(uniqueCategories.values()).sort((a, b) =>
              a.localeCompare(b)
            )
          );
        }
      } catch (error) {
        console.error("Unable to load navbar categories:", error);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate the total quantity of items in the cart.
  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Search products.
  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    setIsMobileMenuOpen(false);

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  // Log out the current user.
  const handleLogout = () => {
    localStorage.removeItem("shopcartToken");
    localStorage.removeItem("shopcartUser");

    window.dispatchEvent(new Event("shopcart-auth-changed"));

    setIsMobileMenuOpen(false);

    navigate("/login", { replace: true });
  };

  // Toggle the mobile navigation panel.
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((open) => !open);
  };

  const isAdmin = auth.user?.role === "admin";

  return (
    <header className="shopcart-header">
      {/* Top information bar */}
      <div className="top-bar">
        <p>☎ +237-671-068-219</p>
        <p>Free delivery on selected orders</p>
      </div>

      {/* Main navigation */}
      <nav className="navbar" aria-label="Main navigation">
        {/* ShopCart logo */}
        <NavLink
          to="/"
          className="logo-placeholder"
          aria-label="ShopCart home"
        >
          <img src={Logo} alt="ShopCart logo" />
          <span>SHOPCART</span>
        </NavLink>

        {/* Mobile menu toggle with your SVG icons */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label={
            isMobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
          aria-controls="shopcart-navigation"
        >
          {isMobileMenuOpen ? (
            /* Close icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#1f1f1f"
              aria-hidden="true"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          ) : (
            /* Hamburger menu icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#1f1f1f"
              aria-hidden="true"
            >
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
            </svg>
          )}
        </button>

        {/* Navigation content: collapses on mobile */}
        <div
          id="shopcart-navigation"
          className={`navbar-content ${
            isMobileMenuOpen ? "is-open" : ""
          }`}
        >
          {/* Main links */}
          <div className="nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>

            {/* Dynamic categories dropdown */}
            <div className="nav-category-menu">
              <NavLink
                to="/products"
                className="nav-category-trigger"
                aria-label="Browse all products and categories"
              >
                Categories <span aria-hidden="true">⌄</span>
              </NavLink>

              <div className="nav-category-dropdown">
                <NavLink to="/products">All Products</NavLink>

                {categories.map((category) => (
                  <NavLink
                    key={category}
                    to={`/products?category=${encodeURIComponent(category)}`}
                  >
                    {category}
                  </NavLink>
                ))}
              </div>
            </div>

            <NavLink to="/products?deals=true">Deals</NavLink>

            <NavLink to="/products?sort=newest">What's New</NavLink>

            <a href="/#delivery-info">Delivery</a>
          </div>

          {/* Product search */}
          <form
            className="search-container"
            onSubmit={handleSearch}
            role="search"
          >
            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <button type="submit" aria-label="Submit search">
              <span aria-hidden="true">⌕</span>
            </button>
          </form>

          {/* Account and cart actions */}
          <div className="nav-actions">
            {auth.isLoggedIn ? (
              <>
                <NavLink to={isAdmin ? "/admin" : "/account"}>
                  {isAdmin ? "Admin" : "Account"}
                </NavLink>

                <button
                  type="button"
                  className="nav-logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>

                <NavLink to="/register" className="nav-register-link">
                  Register
                </NavLink>
              </>
            )}

            <NavLink to="/cart" className="nav-cart-link">
              Cart

              {cartCount > 0 && (
                <span className="nav-cart-count">{cartCount}</span>
              )}
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
