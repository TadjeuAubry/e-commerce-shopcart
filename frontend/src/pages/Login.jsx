
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { loginUser } from "../services/authService";
// import Logo from "../assets/home/Logo.jpg";
// import "../style/Login.css";

// const Login = () => {
//   const navigate = useNavigate();

//   // Store the values entered into the form
//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });

//   const [errorMessage, setErrorMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   //This will Update the form field
//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((previousData) => ({
//       ...previousData,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setErrorMessage("");
//     setIsLoading(true);

//     try {
//       const result = await loginUser({
//         email: formData.email.trim(),
//         password: formData.password
//       });

//       const { token, user } = result.data || {};
//     //    console.log("Logged-in user:", user);

//       if (!token || !user) {
//         throw new Error(
//           "The server did not return the expected login information."
//         );
//       }

//       localStorage.setItem("shopcartToken", token);
//       localStorage.setItem("shopcartUser", JSON.stringify(user));
//       window.dispatchEvent(new Event("shopcart-auth-changed"));

//      if (user.role === "admin") {
//          navigate("/admin", { replace: true });
//        } else {
//           navigate("/account", { replace: true });
//        }

//     }
//       catch (error) {
//       setErrorMessage(
//         error.message || "Unable to log in. Please try again."
//       );
//     } 
//       finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <main className="login-page">
//       <section className="login-card">
//         <Link to="/" className="login-logo">
//          <img src={Logo} alt="logo" />
//           ShopCart
//         </Link>

//         <h1 className="login-title">Welcome back</h1>

//         <p className="login-subtitle">
//           Sign in to your ShopCart account to continue shopping.
//         </p>

//         <form className="login-form" onSubmit={handleSubmit}>
//           <div className="login-field">
//             <label htmlFor="email" className="login-label">
//               Email address
//             </label>

//             <input
//               id="email"
//               name="email"
//               type="email"
//               className="login-input"
//               placeholder="Enter your email"
//               value={formData.email}
//               onChange={handleChange}
//               autoComplete="username"
//               required
//             />
//           </div>

//           <div className="login-field">
//             <label htmlFor="password" className="login-label">
//               Password
//             </label>

//             <input
//               id="password"
//               name="password"
//               type="password"
//               className="login-input"
//               placeholder="Enter your password"
//               value={formData.password}
//               onChange={handleChange}
//               autoComplete="current-password"
//               required
//             />
//           </div>

//           {errorMessage && (
//             <p className="login-error" role="alert"> {errorMessage} </p>
//           )}

//           <button type="submit" className="login-button" disabled={isLoading} >
//             {isLoading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         <p className="login-footer">
//           Don't have an account?{" "}
//           <Link to="/register">Create an account</Link>
//         </p>

//         <Link to="/" className="login-back-link">
//           Back to shopping
//         </Link>
//       </section>
//     </main>
//   );
// };

// export default Login;



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import Logo from "../assets/home/Logo.jpg";
import "../style/Login.css";

const validateLoginField = (name, value) => {
  const trimmedValue = value.trim();

  if (name === "email") {
    if (!trimmedValue) {
      return "Email address is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedValue)) {
      return "Please enter a valid email address.";
    }
  }

  if (name === "password" && !value) {
    return "Password is required.";
  }

  return "";
};

const validateLoginForm = (formData) => {
  const errors = {};

  ["email", "password"].forEach((field) => {
    const message = validateLoginField(
      field,
      formData[field]
    );

    if (message) {
      errors[field] = message;
    }
  });

  return errors;
};

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update the field and refresh its validation message.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");

    setFieldErrors((previousErrors) => {
      if (!previousErrors[name]) {
        return previousErrors;
      }

      const message = validateLoginField(name, value);
      const updatedErrors = { ...previousErrors };

      if (message) {
        updatedErrors[name] = message;
      } else {
        delete updatedErrors[name];
      }

      return updatedErrors;
    });
  };

  // Validate when a customer leaves a field.
  const handleBlur = (event) => {
    const { name, value } = event.target;
    const message = validateLoginField(name, value);

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

    // Validate both fields before contacting the backend.
    const errors = validateLoginForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage("Please correct the highlighted fields.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = result.data || {};

      if (!token || !user) {
        throw new Error(
          "The server did not return the expected login information."
        );
      }

      localStorage.setItem("shopcartToken", token);
      localStorage.setItem("shopcartUser", JSON.stringify(user));

      // Notify the cart and navbar that authentication changed.
      window.dispatchEvent(
        new Event("shopcart-auth-changed")
      );

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/account", { replace: true });
      }
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to log in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">

        <Link to="/" className="login-logo">
          <img src={Logo} alt="ShopCart logo" />
          ShopCart
        </Link>

        <h1 className="login-title">
          Welcome back
        </h1>

        <p className="login-subtitle">
          Sign in to your ShopCart account to continue shopping.
        </p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">
              Email address
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              className="login-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="username"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "login-email-error" : undefined
              }
              disabled={isLoading}
            />

            {fieldErrors.email && (
              <p
                id="login-email-error"
                className="login-field-error"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="login-field">
            <label
              htmlFor="login-password"
              className="login-label"
            >
              Password
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password
                  ? "login-password-error"
                  : undefined
              }
              disabled={isLoading}
            />

            {fieldErrors.password && (
              <p
                id="login-password-error"
                className="login-field-error"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Authentication error */}
          {errorMessage && (
            <p className="login-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
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
