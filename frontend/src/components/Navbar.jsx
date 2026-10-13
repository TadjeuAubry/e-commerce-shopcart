import { NavLink } from "react-router-dom";
import "../style/Navbar.css"
import Logo from "../assets/home/Logo.jpg";

const Navbar = () => {
  return (
    <header className="shopcart-header">
      <div className="top-bar">
        <p> Phone: +237-671-068-219 </p>
        <p>  Free delivery on selected orders  </p>
        
      </div>

      <nav className="navbar">

        <NavLink to="/" className="logo-placeholder">
           <img src={Logo} alt="logo" />
          <span>SHOPCART</span>
        </NavLink>

        <div className="nav-links">

          <NavLink to="/">  Home </NavLink>
          <NavLink to="/products"> Categories </NavLink>
          <NavLink to="/products">Deals </NavLink>
          <NavLink to="/products"> What's New </NavLink>
          <NavLink to="/products"> Delivery</NavLink>

        </div>
        <div className="search-container">
          <input type="text"  placeholder="Search products" aria-label="Search products"/>
        </div>

        <div className="nav-actions">

          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/account">Account</NavLink>
          <NavLink to="/cart">Cart</NavLink>

        </div>

      </nav>
    </header>
  );
};

export default Navbar;