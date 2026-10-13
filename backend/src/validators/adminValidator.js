
const mongoose = require("mongoose");

// this validate a user ID from the URL
const validateUserIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }

  next();
};

// this validate an order ID from the URL
const validateOrderIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID"
    });
  }

  next();
};

// this validate data when an admin creates a user
const createAdminUserValidator = (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  if (
    typeof name !== "string" ||
    name.trim().length < 2
  ) {
    return res.status(400).json({
      success: false,
      message: "Name must contain at least 2 characters"
    });
  }

  if (typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 8
  ) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters"
    });
  }

  if (
    phone !== undefined &&
    typeof phone !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be a string"
    });
  }

  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be customer or admin"
    });
  }

  next();
};

// Validate data when an admin updates a user
const updateAdminUserValidator = (req, res, next) => {
  const { name, email, phone, role } = req.body;

  const allowedFields = ["name", "email", "phone", "role"];
  const submittedFields = Object.keys(req.body);

  if (
    submittedFields.length === 0 ||
    submittedFields.some((field) => !allowedFields.includes(field))
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide valid fields to update"
    });
  }

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length < 2)
  ) {
    return res.status(400).json({
      success: false,
      message: "Name must contain at least 2 characters"
    });
  }

  if (email !== undefined) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      typeof email !== "string" ||
      !emailPattern.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }
  }

  if (
    phone !== undefined &&
    typeof phone !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be a string"
    });
  }

  if (
    role !== undefined &&
    !["customer", "admin"].includes(role)
  ) {
    return res.status(400).json({
      success: false,
      message: "Role must be customer or admin"
    });
  }

  next();
};

// Validate account activation/deactivation
const updateUserStatusValidator = (req, res, next) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isActive must be true or false"
    });
  }

  next();
};

const updateOrderStatusValidator = (req, res, next) => {
  const { orderStatus } = req.body || {};

  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ];

  if (
    typeof orderStatus !== "string" ||
    !allowedStatuses.includes(orderStatus)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
      allowedStatuses
    });
  }

  next();
};

module.exports = {
  validateUserIdParam,
  validateOrderIdParam,
  createAdminUserValidator,
  updateAdminUserValidator,
  updateUserStatusValidator,
  updateOrderStatusValidator
};
