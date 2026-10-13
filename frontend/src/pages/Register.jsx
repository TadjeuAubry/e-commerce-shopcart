import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import Logo from "../assets/home/Logo.jpg";
import "../style/Register.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

// Validate individual registration fields.
const validateRegisterField = (name, value, formData) => {
  const trimmedValue = value.trim();

  switch (name) {
    case "name":
      if (!trimmedValue) {
        return "Full name is required.";
      }

      if (trimmedValue.length < 2) {
        return "Full name must contain at least 2 characters.";
      }

      return "";

    case "email": {
      if (!trimmedValue) {
        return "Email address is required.";
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(trimmedValue)) {
        return "Please enter a valid email address.";
      }

      return "";
    }

    case "phone":
      if (!trimmedValue) {
        return "Phone number is required.";
      }

      if (trimmedValue.length < 6) {
        return "Phone number must contain at least 6 characters.";
      }

      return "";

    case "password":
      if (!value) {
        return "Password is required.";
      }

      if (value.length < 8) {
        return "Password must contain at least 8 characters.";
      }

      if (!/[A-Za-z]/.test(value)) {
        return "Password must contain at least one letter.";
      }

      if (!/[0-9]/.test(value)) {
        return "Password must contain at least one number.";
      }

      return "";

    case "confirmPassword":
      if (!value) {
        return "Please confirm your password.";
      }

      if (value !== formData.password) {
        return "Passwords do not match.";
      }

      return "";

    default:
      return "";
  }
};

const validateRegisterForm = (formData) => {
  const errors = {};

  Object.keys(INITIAL_FORM).forEach((field) => {
    const message = validateRegisterField(
      field,
      formData[field],
      formData
    );

    if (message) {
      errors[field] = message;
    }
  });

  return errors;
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update a field and revalidate fields that already show errors.
  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedForm = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedForm);
    setErrorMessage("");
    setSuccessMessage("");

    setFieldErrors((previousErrors) => {
      const updatedErrors = { ...previousErrors };

      // Revalidate the edited field if it has already been checked.
      if (previousErrors[name]) {
        const message = validateRegisterField(
          name,
          value,
          updatedForm
        );

        if (message) {
          updatedErrors[name] = message;
        } else {
          delete updatedErrors[name];
        }
      }

      // If the password changes, the confirmation may no longer match.
      if (
        name === "password" &&
        (previousErrors.confirmPassword ||
          updatedForm.confirmPassword)
      ) {
        const confirmationMessage = validateRegisterField(
          "confirmPassword",
          updatedForm.confirmPassword,
          updatedForm
        );

        if (confirmationMessage) {
          updatedErrors.confirmPassword = confirmationMessage;
        } else {
          delete updatedErrors.confirmPassword;
        }
      }

      return updatedErrors;
    });
  };

  // Show validation feedback when leaving a field.
  const handleBlur = (event) => {
    const { name, value } = event.target;
    const message = validateRegisterField(
      name,
      value,
      formData
    );

    setFieldErrors((previousErrors) => {
      const updatedErrors = { ...previousErrors };

      if (message) {
        updatedErrors[name] = message;
      } else {
        delete updatedErrors[name];
      }

      return updatedErrors;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const errors = validateRegisterForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage("Please correct the highlighted fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Do not send confirmPassword to the backend.
      const result = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setSuccessMessage(
        result.message ||
          "Registration successful! You can now sign in."
      );

      // Keep the success message visible briefly before redirecting.
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
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
          <img src={Logo} alt="ShopCart logo" />
          ShopCart
        </Link>

        <h1 className="register-title">
          Create your account
        </h1>

        <p className="register-subtitle">
          Join ShopCart and start discovering your favourite products.
        </p>

        <form
          className="register-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Full name */}
          <div className="register-field">
            <label htmlFor="register-name" className="register-label">
              Full name
            </label>

            <input
              id="register-name"
              name="name"
              type="text"
              className="register-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "register-name-error" : undefined
              }
              disabled={isLoading}
            />

            {fieldErrors.name && (
              <p
                id="register-name-error"
                className="register-field-error"
              >
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="register-field">
            <label htmlFor="register-email" className="register-label">
              Email address
            </label>

            <input
              id="register-email"
              name="email"
              type="email"
              className="register-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "register-email-error" : undefined
              }
              disabled={isLoading}
            />

            {fieldErrors.email && (
              <p
                id="register-email-error"
                className="register-field-error"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="register-field">
            <label htmlFor="register-phone" className="register-label">
              Phone number
            </label>

            <input
              id="register-phone"
              name="phone"
              type="tel"
              className="register-input"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              required
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={
                fieldErrors.phone ? "register-phone-error" : undefined
              }
              disabled={isLoading}
            />

            {fieldErrors.phone && (
              <p
                id="register-phone-error"
                className="register-field-error"
              >
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="register-field">
            <label
              htmlFor="register-password"
              className="register-label"
            >
              Password
            </label>

            <input
              id="register-password"
              name="password"
              type="password"
              className="register-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              minLength={8}
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password
                  ? "register-password-error"
                  : "register-password-help"
              }
              disabled={isLoading}
            />

            <p
              id="register-password-help"
              className="register-field-hint"
            >
              Use at least 8 characters, including a letter and a number.
            </p>

            {fieldErrors.password && (
              <p
                id="register-password-error"
                className="register-field-error"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="register-field">
            <label
              htmlFor="register-confirm-password"
              className="register-label"
            >
              Confirm password
            </label>

            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              className="register-input"
              placeholder="Enter your password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? "register-confirm-password-error"
                  : undefined
              }
              disabled={isLoading}
            />

            {fieldErrors.confirmPassword && (
              <p
                id="register-confirm-password-error"
                className="register-field-error"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* General error */}
          {errorMessage && (
            <p className="register-error" role="alert">
              {errorMessage}
            </p>
          )}

          {/* Success message */}
          {successMessage && (
            <p className="register-success" role="status">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
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
