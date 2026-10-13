
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/userService";
import "../style/CustomerDashboard.css";

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getMyProfile();

      // to support common API response structures.
      const user =
        result.data?.user ??
        result.data?.profile ??
        result.data;

      if (!user || typeof user !== "object") {
        throw new Error("Your profile information was not returned.");
      }
      setProfile(user);
    } 
     catch (err) {
      setError(
        err.message || "Unable to load your account."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = () => {
    localStorage.removeItem("shopcartToken");
    localStorage.removeItem("shopcartUser");

    window.dispatchEvent(new Event("shopcart-auth-changed"));

    navigate("/login", { replace: true });
  };

  const customerName =
    profile?.name ||
    profile?.fullName ||
    [
      profile?.firstName,
      profile?.lastName,
    ].filter(Boolean).join(" ") ||
    "ShopCart Customer";

  const customerEmail =
    profile?.email || "Email not provided";

  const initials = customerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  // Loading screen.
  if (loading) {
    return (
      <main className="customer-dashboard">
        <div className="customer-dashboard-message">
          <p>Loading your account...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="customer-dashboard">
        <div className="customer-dashboard-error">
          <h2>Unable to load your account</h2>

          <p>{error}</p>

          <button type="button" onClick={loadProfile}>
            Try Again
          </button>

          <button type="button" className="customer-secondary-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="customer-dashboard">

      <header className="customer-dashboard-header">
        <div>
          <span className="customer-dashboard-eyebrow">
            MY SHOPCART ACCOUNT
          </span>

          <h1>My Dashboard</h1>
          <p> Manage your account and keep track of your shopping. </p>
        </div>

        <button type="button" className="customer-logout-button"  onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      <section className="customer-welcome-banner">
        <div className="customer-avatar">
          {initials || "SC"}
        </div>

        <div className="customer-welcome-text">
          <span>WELCOME BACK</span>

          <h2>Hello, {customerName}!</h2>

          <p>
            Welcome to your personal ShopCart space.
            Your shopping activities start here.
          </p>
        </div>
      </section>

      <section className="customer-profile-section">
        <div className="customer-section-heading">
          <div>
            <h2>My Profile</h2>
            <p>Your personal account information.</p>
          </div>

          <button type="button" className="customer-refresh-button" onClick={loadProfile}>
            Refresh Profile
          </button>
        </div>

        <div className="customer-profile-card">
          <div className="customer-profile-avatar">
            {initials || "SC"}
          </div>

          <div className="customer-profile-information">
            <h3>{customerName}</h3>

            <p>{customerEmail}</p>

            {profile?.phone && (
              <p>Phone: {profile.phone}</p>
            )}

            {profile?.address && (
              <p>
                Address:{" "}
                {typeof profile.address === "string"
                  ? profile.address
                  : [
                      profile.address.street,
                      profile.address.city,
                      profile.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
              </p>
            )}

            <span className="customer-account-badge">
              Customer Account
            </span>
          </div>
        </div>
      </section>

      {/* Customer shopping actions */}
      <section className="customer-actions-section">
        <div className="customer-section-heading">
          <div>
            <h2>My Shopping</h2>
            <p>Choose what you would like to do.</p>
          </div>
        </div>

        <div className="customer-actions-grid">

          {/* Browse products */}
          <Link
            to="/products"
            className="customer-action-card"
          >
            <div className="customer-action-icon">
              <span aria-hidden="true">▦</span>
            </div>

            <h3>Shop Products</h3>

            <p>
              Explore the ShopCart catalogue and discover
              products you want to buy.
            </p>

            <span className="customer-action-link">
              Browse products →
            </span>
          </Link>

          {/* Shopping cart */}
          <Link
            to="/cart"
            className="customer-action-card"
          >
            <div className="customer-action-icon">
              <span aria-hidden="true">🛒</span>
            </div>

            <h3>My Cart</h3>

            <p>
              Review the products you have added to your
              shopping cart and manage quantities.
            </p>

            <span className="customer-action-link">
              View my cart →
            </span>
          </Link>

          {/* Customer orders */}
          <Link
            to="/orders"
            className="customer-action-card"
          >
            <div className="customer-action-icon">
              <span aria-hidden="true">▤</span>
            </div>

            <h3>My Orders</h3>

            <p>
              Review your purchases and follow the status
              of your orders.
            </p>

            <span className="customer-action-link">
              View my orders →
            </span>
          </Link>

        </div>
      </section>

      {/* Account assistance */}
      <section className="customer-help-section">
        <div>
          <h3>Need help with your account?</h3>

          <p>
            You can return to your dashboard whenever you
            need to manage your ShopCart activities.
          </p>
        </div>

        <Link to="/" className="customer-home-link">
          Back to Home
        </Link>
      </section>

    </main>
  );
};

export default CustomerDashboard;
