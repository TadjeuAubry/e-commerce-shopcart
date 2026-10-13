const orderValidator = (req, res, next) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress || typeof shippingAddress !== "object") {
    return res.status(400).json({
      success: false,
      message: "Shipping address is required"
    });
  }

  const {
    fullName,
    phone,
    city,
    region,
    address
  } = shippingAddress;

  if (
    !fullName ||
    typeof fullName !== "string" ||
    fullName.trim().length < 2
  ) {
    return res.status(400).json({
      success: false,
      message: "Full name must contain at least 2 characters"
    });
  }

  // Validate phone
  if (!phone || typeof phone !== "string") {
    return res.status(400).json({
      success: false,
      message: "Phone number is required"
    });
  }

  if (phone.trim().length < 6) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid phone number"
    });
  }

  if (
    !city ||
    typeof city !== "string" ||
    city.trim().length < 2
  ) {
    return res.status(400).json({
      success: false,
      message: "City must contain at least 2 characters"
    });
  }

  if (
    region !== undefined &&
    typeof region !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Region must be a string"
    });
  }

  // Validate address
  if (
    !address ||
    typeof address !== "string" ||
    address.trim().length < 5
  ) {
    return res.status(400).json({ success: false, message: "Please provide a valid delivery address" });
  }

  next();
};

const mongoose = require("mongoose");

const validateOrderIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  next();
};

module.exports = {
  orderValidator,
  validateOrderIdParam
};