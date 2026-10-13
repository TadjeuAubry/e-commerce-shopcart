
import { Link } from "react-router-dom";
import Logo from "../assets/home/Logo.jpg"
import "../style/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">
            <span className="footer-brand-icon" aria-hidden="true">
              <img src={Logo} alt="logo" />
            </span>
            <span>ShopCart</span>
          </Link>

          <p className="footer-brand-description">
            Discover quality products, enjoy great prices,
            and experience a better way to shop.
          </p>

          <span className="footer-brand-tagline">
            Your shopping, made simple.
          </span>
        </div>

        <div className="footer-column">
          <h2>Shop</h2>

          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
          <Link to="/cart">Shopping Cart</Link>
        </div>

        <div className="footer-column">
          <h2>My Account</h2>

          <Link to="/account">My Dashboard</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
        </div>

        <div id="delivery-info" className="footer-column footer-help-column">
          <h2>Dekivery & Support</h2>

          <p>
            Delivery fees and arrangements are confirmed at checkout.
            Visit your account to review your orders and delivery details.
          </p>

          <Link to="/account" className="footer-help-link">
            Visit My Account →
          </Link>

          <Link to="/orders" className="footer-help-link">
            Track My Orders →
          </Link>
        </div>

      </div>

      {/* Footer bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>
            © {currentYear} ShopCart. All rights reserved.
          </p>

          <Link to="/" className="footer-back-to-top">
            Back to Home ↑
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
