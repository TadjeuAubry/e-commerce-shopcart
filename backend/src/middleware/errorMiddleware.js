
const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err.message);

  // Let Express handle errors if the response has already started
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";

  // Handle MongoDB and JWT errors first
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this information already exists";
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    statusCode = 401;
    message = "Invalid or expired authentication token";
  } else {
    // Authentication errors
    if (message === "Invalid email or password") {
      statusCode = 401;
    } else if (message === "This account has been deactivated") {
      statusCode = 403;
    }

    // Resources that do not exist
    else if (
      [
        "User not found",
        "Order not found",
        "Product not found",
        "Cart not found",
        "Product is not in the cart"
      ].includes(message)
    ) {
      statusCode = 404;
    }

    // Conflicts with existing data or current stock
    else if (
      message === "Email is already registered" ||
      message.includes("order history") ||
      message === "Requested quantity exceeds available stock" ||
      message === "Product is out of stock" ||
      message.startsWith("Not enough stock available for ")
    ) {
      statusCode = 409;
    }

    // Invalid input or prohibited account-management operations
    else if (
      message === "Invalid user role" ||
      message === "Invalid order status" ||
      message === "Cannot create an order from an empty cart" ||
      message === "No valid fields provided for update" ||
      message.includes("Invalid") ||
      message.includes("must be") ||
      message.includes("must contain") ||
      message.includes("Please provide") ||
      message.includes("cannot") ||
      message.includes("Cannot") ||
      message.includes("required")
    ) {
      statusCode = 400;
    }
  }

  //ovoid expose unexpected internal errors to clients
  if (statusCode >= 500) {
    statusCode = 500;
    message = "Internal server error";
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorMiddleware;
