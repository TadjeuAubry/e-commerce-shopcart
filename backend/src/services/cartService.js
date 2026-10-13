const Cart = require("../models/Cart");
const Product = require("../models/Product");


const getCart = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate(
    "items.productId"
  );

  return cart;
};

const addToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock <= 0) {
    throw new Error("Product is out of stock");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    if (quantity > product.stock) {
      throw new Error("Requested quantity exceeds available stock");
    }

    cart = await Cart.create({ userId, items: 
     [{ productId, quantity }]
    });

    return Cart.findById(cart._id).populate("items.productId");
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new Error("Requested quantity exceeds available stock");
    }

    existingItem.quantity = newQuantity;
  } else {

    if (quantity > product.stock) {
      throw new Error("Requested quantity exceeds available stock");
    }

    cart.items.push({ productId, quantity });
  }

  await cart.save();

  return Cart.findById(cart._id).populate("items.productId");
};


const updateCartItem = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (quantity > product.stock) {
    throw new Error("Requested quantity exceeds available stock");
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (cartItem) => cartItem.productId.toString() === productId
  );

  if (!item) {
    throw new Error("Product is not in the cart");
  }

  item.quantity = quantity;

  await cart.save();

  return Cart.findById(cart._id).populate("items.productId");
};

const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemExists = cart.items.some(
    (item) => item.productId.toString() === productId
  );

  if (!itemExists) {
    throw new Error("Product is not in the cart");
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();

  return Cart.findById(cart._id).populate("items.productId");
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = [];

  await cart.save();

  return cart;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};