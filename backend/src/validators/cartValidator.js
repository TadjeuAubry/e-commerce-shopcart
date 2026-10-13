const mongoose = require("mongoose");

const addToCartValidator = (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "A valid product ID is required"
    });
  }

  if (quantity === undefined || quantity === null) {
    return res.status(400).json({
      success: false,
      message: "Quantity is required"
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a whole number greater than 0"
    });
  }

  next();
};

const validateProductIdParam = (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  next();
};

// this will Validate quantity when updating a cart item
const updateCartItemValidator = (req, res, next) => {
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null) {
    return res.status(400).json({
      success: false,
      message: "Quantity is required"
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a whole number greater than 0"
    });
  }

  next();
};

module.exports = {
  addToCartValidator,
  validateProductIdParam,
  updateCartItemValidator
};