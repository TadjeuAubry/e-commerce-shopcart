
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {  getAdminUsers,  createAdminUser, updateAdminUser, updateAdminUserStatus, deleteAdminUser } from "../services/adminService";
import "../style/AdminUsers.css";

const createEmptyUserForm = () => ({
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "customer"
});

// Read the current user without assuming localStorage contains valid JSON.
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("shopcartUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const AdminUsers = () => {
  const navigate = useNavigate();

  // User list and request states.
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  // Form state.
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(createEmptyUserForm);

  // Feedback messages.
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentUser = getStoredUser();
  const currentUserId = currentUser?._id
    ? String(currentUser._id)
    : "";

  // Retrieve users from the backend.
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getAdminUsers();

      if (!Array.isArray(result.data)) {
        throw new Error("The server returned an unexpected users list.");
      }

      setUsers(result.data);
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to load users."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Update a form field.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Open a blank form to create a user.
  const openCreateForm = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingUserId(null);
    setFormData(createEmptyUserForm());
    setShowForm(true);
  };

  // Open the form with an existing user's information.
  const openEditForm = (user) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingUserId(user._id);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role: user.role || "customer"
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close and reset the form.
  const closeForm = () => {
    setShowForm(false);
    setEditingUserId(null);
    setFormData(createEmptyUserForm());
    setErrorMessage("");
  };

  // Create or update a user.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role
    };

    if (!userData.name || !userData.email || !userData.phone) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (!["customer", "admin"].includes(userData.role)) {
      setErrorMessage("Please select a valid user role.");
      return;
    }

    // A password is needed only when creating an account.
    if (!editingUserId) {
      if (formData.password.length < 8) {
        setErrorMessage(
          "The new user's password must contain at least 8 characters."
        );
        return;
      }

      userData.password = formData.password;
    }

    setIsSaving(true);

    try {
      if (editingUserId) {
        await updateAdminUser(editingUserId, userData);
        setSuccessMessage("User updated successfully!");
      } else {
        await createAdminUser(userData);
        setSuccessMessage("User created successfully!");
      }

      setShowForm(false);
      setEditingUserId(null);
      setFormData(createEmptyUserForm());

      await loadUsers();
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to save the user."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Activate or deactivate an account.
  const handleToggleStatus = async (user) => {
    const nextStatus = user.isActive === false;

    const action = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}'s account?`
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");
    setBusyUserId(user._id);

    try {
      await updateAdminUserStatus(user._id, nextStatus);

      setSuccessMessage(
        `User account ${nextStatus ? "activated" : "deactivated"} successfully.`
      );

      await loadUsers();
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to change the user's status."
      );
    } finally {
      setBusyUserId(null);
    }
  };

  // Delete a user after confirmation.
  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name} (${user.email})? This action cannot be undone.`
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");
    setBusyUserId(user._id);

    try {
      await deleteAdminUser(user._id);

      setSuccessMessage("User deleted successfully.");

      if (editingUserId === user._id) {
        closeForm();
      }

      await loadUsers();
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to delete this user."
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const activeUsers = users.filter(
    (user) => user.isActive !== false
  ).length;

  const inactiveUsers = users.length - activeUsers;

  return (
    <main className="admin-users-page">
      {/* Page header */}
      <header className="admin-users-header">
        <div>
          <p className="admin-users-eyebrow">
            SHOPCART ADMINISTRATION
          </p>

          <h1>Users</h1>

          <p className="admin-users-description">
            Create and manage customer and administrator accounts.
          </p>
        </div>

        <div className="admin-users-header-actions">
          <button
            type="button"
            className="admin-users-secondary-button"
            onClick={() => navigate("/admin")}
          >
            Back to dashboard
          </button>

          <button
            type="button"
            className="admin-users-secondary-button"
            onClick={loadUsers}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="admin-users-primary-button"
            onClick={openCreateForm}
            disabled={isSaving}
          >
            + Add user
          </button>
        </div>
      </header>

      {/* Operation feedback */}
      {successMessage && (
        <div className="admin-users-success" role="status">
          {successMessage}
        </div>
      )}

      {errorMessage && !showForm && (
        <div className="admin-users-error" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Create/edit user form */}
      {showForm && (
        <section className="admin-user-form-section">
          <div className="admin-user-form-heading">
            <div>
              <p className="admin-users-eyebrow">
                ACCOUNT MANAGEMENT
              </p>

              <h2>
                {editingUserId ? "Edit user" : "Create a user"}
              </h2>
            </div>

            <button
              type="button"
              className="admin-users-close-button"
              onClick={closeForm}
              disabled={isSaving}
              aria-label="Close user form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-user-form-grid">
              <label>
                Full name *
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address *
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Phone number *
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </label>

              {!editingUserId && (
                <label>
                  Password *
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />

                  <span className="admin-users-field-help">
                    At least 8 characters.
                  </span>
                </label>
              )}

              <label>
                Account role *
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={
                    editingUserId &&
                    String(editingUserId) === currentUserId
                  }
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>

                {editingUserId &&
                  String(editingUserId) === currentUserId && (
                    <span className="admin-users-field-help">
                      You cannot change your own administrator role here.
                    </span>
                  )}
              </label>
            </div>

            {errorMessage && (
              <div className="admin-users-error" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="admin-user-form-actions">
              <button
                type="button"
                className="admin-users-secondary-button"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-users-primary-button"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingUserId
                    ? "Save changes"
                    : "Create account"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* User summary */}
      <section className="admin-users-summary">
        <article className="admin-users-summary-card">
          <span>Total users</span>
          <strong>{users.length}</strong>
          <small>Registered accounts</small>
        </article>

        <article className="admin-users-summary-card">
          <span>Active accounts</span>
          <strong>{activeUsers}</strong>
          <small>Accounts currently active</small>
        </article>

        <article className="admin-users-summary-card">
          <span>Inactive accounts</span>
          <strong>{inactiveUsers}</strong>
          <small>Deactivated accounts</small>
        </article>
      </section>

      {/* User table */}
      <section className="admin-users-table-section">
        <div className="admin-users-table-heading">
          <div>
            <h2>User directory</h2>
            <p>Accounts retrieved from the ShopCart backend.</p>
          </div>

          <span className="admin-users-count">
            {users.length} users
          </span>
        </div>

        {isLoading ? (
          <p className="admin-users-message">
            Loading users from the server...
          </p>
        ) : errorMessage && users.length === 0 ? (
          <div className="admin-users-empty">
            <p>{errorMessage}</p>

            <button
              type="button"
              className="admin-users-secondary-button"
              onClick={loadUsers}
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-users-empty">
            <h3>No users found</h3>
            <p>Create an account to get started.</p>
          </div>
        ) : (
          <div className="admin-users-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isCurrentUser =
                    String(user._id) === currentUserId;

                  const isBusy = busyUserId === user._id;
                  const isActive = user.isActive !== false;

                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-identity">
                          <div className="admin-user-avatar">
                            {(user.name || "U")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="admin-user-name">
                            <strong>
                              {user.name || "Unnamed user"}
                              {isCurrentUser && (
                                <span className="admin-user-you">
                                  You
                                </span>
                              )}
                            </strong>

                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{user.phone || "—"}</td>

                      <td>
                        <span
                          className={`admin-user-role ${
                            user.role === "admin"
                              ? "administrator"
                              : "customer"
                          }`}
                        >
                          {user.role === "admin"
                            ? "Administrator"
                            : "Customer"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-user-status ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <div className="admin-user-actions">
                          <button
                            type="button"
                            className="admin-user-action-button"
                            onClick={() => openEditForm(user)}
                            disabled={isBusy || isSaving}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-user-action-button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={
                              isBusy ||
                              isSaving ||
                              isCurrentUser
                            }
                            title={
                              isCurrentUser
                                ? "You cannot deactivate your own account"
                                : ""
                            }
                          >
                            {isBusy
                              ? "Working..."
                              : isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="admin-user-action-button delete"
                            onClick={() => handleDelete(user)}
                            disabled={
                              isBusy ||
                              isSaving ||
                              isCurrentUser
                            }
                            title={
                              isCurrentUser
                                ? "You cannot delete your own account"
                                : ""
                            }
                          >
                            {isBusy ? "Working..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminUsers;
