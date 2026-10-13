
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import Logo from "../assets/home/Logo.jpg";
import "../style/Register.css";

const Register = () => {
  const navigate = useNavigate();

  // Store the information entered by the user.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  // Store form feedback and loading status.
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update the corresponding field whenever the user types.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    // Clear old messages when the user changes a field.
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Validate the form and submit the registration request.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // Ensure both passwords match.
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Avoid sending a password that is too short.
    if (formData.password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Send only fields required for account registration.
      const result = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      setSuccessMessage(
        result.message || "Registration successful! You can now sign in."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } 
      catch (error) {
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <Link to="/" className="register-logo">
           <img src={Logo} alt="logo" />
          ShopCart
        </Link>

        <h1 className="register-title">Create your account</h1>

        <p className="register-subtitle">
          Join ShopCart and start discovering your favorite products.
        </p>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label htmlFor="name" className="register-label">
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              className="register-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="email" className="register-label">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="register-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="phone" className="register-label">
              Phone number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              className="register-input"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="password" className="register-label">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className="register-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="confirmPassword" className="register-label">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="register-input"
              placeholder="Enter your password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {errorMessage && (
            <p className="register-error" role="alert">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="register-success" role="status">
              {successMessage}
            </p>
          )}

          <button type="submit" className="register-button" disabled={isLoading} >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>

        <Link to="/" className="register-back-link">
          Back to shopping
        </Link>
      </section>
    </main>
  );
};

export default Register;
