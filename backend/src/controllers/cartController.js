const cartService = require("../services/cartService");

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.userId);

    res.status(200).json({ success: true, data: cart });
  } 
   catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await cartService.addToCart(
      req.user.userId,
      productId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart
    });
  } 
  catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(
      req.user.userId,
      productId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart
    });
  } 
  catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(
      req.user.userId,
      productId
    );

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: cart
    });
  } 
   catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};