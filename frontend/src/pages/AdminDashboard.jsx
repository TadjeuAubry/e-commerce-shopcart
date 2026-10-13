
import { useNavigate } from "react-router-dom";
import "../style/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Read the logged-in user's information
  const storedUser = localStorage.getItem("shopcartUser");

  let user = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    user = {};
  }

  // Log out and return to the login page
  const handleLogout = () => {
    localStorage.removeItem("shopcartToken");
    localStorage.removeItem("shopcartUser");

    navigate("/login", { replace: true });
  };

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">ShopCart</div>

        <p className="admin-sidebar-label">ADMINISTRATION</p>

        <nav className="admin-navigation">
          <button
            type="button"
            className="admin-nav-item active"
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() => navigate("/admin/products")}
          >
            <span>□</span>
            Products
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() => navigate("/admin/users")}
          >
            <span>♙</span>
            Users
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() => navigate("/admin/orders")}
          >
            <span>▤</span>
            Orders
          </button>
        </nav>

        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">SHOPCART MANAGEMENT</p>
            <h1>Dashboard</h1>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>{user.name || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="admin-welcome">
          <p>ADMIN OVERVIEW</p>
          <h2>Welcome back, {user.name || "Admin"}!</h2>
          <span>
            Manage your ShopCart store from one place.
          </span>
        </section>

        <section className="admin-stat-grid">
          <article className="admin-stat-card">
            <div className="admin-stat-icon">□</div>
            <h3>Products</h3>
            <p>Manage your product catalogue.</p>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
            >
              Manage products →
            </button>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">♙</div>
            <h3>Users</h3>
            <p>View and manage customer accounts.</p>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
            >
              Manage users →
            </button>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">▤</div>
            <h3>Orders</h3>
            <p>Review orders and update their status.</p>
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
            >
              Manage orders →
            </button>
          </article>
        </section>

        <section className="admin-info-panel">
          <h2>Store management</h2>
          <p>
            Your dashboard is ready. The product, user, and
            order management pages will be connected next.
          </p>
        </section>
      </section>
    </main>
  );
};

export default AdminDashboard;
