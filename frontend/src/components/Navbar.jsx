// import { NavLink } from "react-router-dom";
// import "../style/Navbar.css"
// import Logo from "../assets/home/Logo.jpg";

// const Navbar = () => {
//   return (
//     <header className="shopcart-header">
//       <div className="top-bar">
//         <p> Phone: +237-671-068-219 </p>
//         <p>  Free delivery on selected orders  </p>
        
//       </div>

//       <nav className="navbar">

//         <NavLink to="/" className="logo-placeholder">
//            <img src={Logo} alt="logo" />
//           <span>SHOPCART</span>
//         </NavLink>

//         <div className="nav-links">

//           <NavLink to="/">  Home </NavLink>
//           <NavLink to="/products"> Categories </NavLink>
//           <NavLink to="/products">Deals </NavLink>
//           <NavLink to="/products"> What's New </NavLink>
//           <NavLink to="/products"> Delivery</NavLink>

//         </div>
//         <div className="search-container">
//           <input type="text"  placeholder="Search products" aria-label="Search products"/>
//         </div>

//         <div className="nav-actions">

//           <NavLink to="/login">Login</NavLink>
//           <NavLink to="/register">Register</NavLink>
//           <NavLink to="/account">Account</NavLink>
//           <NavLink to="/cart">Cart</NavLink>

//         </div>

//       </nav>
//     </header>
//   );
// };

// export default Navbar;


import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/productService";
import "../style/Navbar.css";
import Logo from "../assets/home/Logo.jpg";

const readAuth = () => {
  const token = localStorage.getItem("shopcartToken");
  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("shopcartUser") || "null"
    );
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
  const { cartItems } = useCart();

  const [auth, setAuth] = useState(readAuth);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);

  // Keep the navigation synchronized with login/logout.
  useEffect(() => {
    const syncAuth = () => setAuth(readAuth());

    window.addEventListener( "shopcart-auth-changed",syncAuth );

    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(
        "shopcart-auth-changed",
        syncAuth
      );

      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Load category names from existing backend products.
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const products = await getProducts();

        const uniqueCategories = new Map();

        (Array.isArray(products) ? products : []).forEach(
          (product) => {
            const category = product.category?.trim();

            if (!category) return;

            const key = category.toLowerCase();

            if (!uniqueCategories.has(key)) {
              uniqueCategories.set(key, category);
            }
          }
        );

        if (isMounted) {
          setCategories(
            Array.from(uniqueCategories.values()).sort(
              (a, b) => a.localeCompare(b)
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

  // Count products in the current customer's cart.
  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Search by product name, description, or category.
  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  // Clear the local authentication details on logout.
  const handleLogout = () => {
    localStorage.removeItem("shopcartToken");
    localStorage.removeItem("shopcartUser");

    window.dispatchEvent(
      new Event("shopcart-auth-changed")
    );

    navigate("/login", { replace: true });
  };

  const isAdmin = auth.user?.role === "admin";

  return (
    <header className="shopcart-header">

      <div className="top-bar">
        <p>☎ +237-671-068-219</p>
        <p>Free delivery on selected orders</p>
      </div>

      <nav className="navbar">

        {/* Logo */}
        <NavLink to="/" className="logo-placeholder">
          <img src={Logo} alt="ShopCart logo" />
          <span>SHOPCART</span>
        </NavLink>

      
        <div className="nav-links">

          <NavLink to="/" end> Home </NavLink>

          <div className="nav-category-menu">
            <NavLink to="/products" className="nav-category-trigger" aria-label="Browse all products and categories" >
              Categories 
             <span aria-hidden="true">⌄</span>
            </NavLink>

            <div className="nav-category-dropdown">
              <NavLink to="/products">
                All Products
              </NavLink>

              {categories.map((category) => (
                <NavLink key={category}
                  to={`/products?category=${encodeURIComponent(
                    category
                  )}`}
                >
                  {category}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/products?deals=true"> Deals </NavLink>
          <NavLink to="/products?sort=newest"> What's New </NavLink>

          <a href="/#delivery-info"> Delivery </a>

        </div>

        <form className="search-container" onSubmit={handleSearch} role="search">
          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <button type="submit" aria-label="Submit search">
            <span aria-hidden="true">⌕</span>
          </button>
        </form>

        <div className="nav-actions">

          {auth.isLoggedIn ? (
            <>
              <NavLink to={isAdmin ? "/admin" : "/account"}>
                {isAdmin ? "Admin" : "Account"}
              </NavLink>

              <button type="button" className="nav-logout-button" onClick={handleLogout} >
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
              <span className="nav-cart-count">
                {cartCount}
              </span>
            )}
          </NavLink>

        </div>

      </nav>
    </header>
  );
};

export default Navbar;
