
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import Logo from "../assets/home/Logo.jpg";
import "../style/Login.css";

const Login = () => {
  const navigate = useNavigate();

  // Store the values entered into the form
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //This will Update the form field
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });

      const { token, user } = result.data || {};
    //    console.log("Logged-in user:", user);

      if (!token || !user) {
        throw new Error(
          "The server did not return the expected login information."
        );
      }

      localStorage.setItem("shopcartToken", token);
      localStorage.setItem("shopcartUser", JSON.stringify(user));

     if (user.role === "admin") {
         navigate("/admin", { replace: true });
       } else {
          navigate("/", { replace: true });
       }

    }
      catch (error) {
      setErrorMessage(
        error.message || "Unable to log in. Please try again."
      );
    } 
      finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <Link to="/" className="login-logo">
         <img src={Logo} alt="logo" />
          ShopCart
        </Link>

        <h1 className="login-title">Welcome back</h1>

        <p className="login-subtitle">
          Sign in to your ShopCart account to continue shopping.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="login-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage && (
            <p className="login-error" role="alert"> {errorMessage} </p>
          )}

          <button type="submit" className="login-button" disabled={isLoading} >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>

        <Link to="/" className="login-back-link">
          Back to shopping
        </Link>
      </section>
    </main>
  );
};

export default Login;
