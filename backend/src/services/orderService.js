const Cart = require("../models/Cart");
const Order = require("../models/Order");

const createOrder = async (userId, shippingAddress) => {

  const cart = await Cart.findOne({ userId }).populate(
    "items.productId"
  );

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (cart.items.length === 0) {
    throw new Error("Cannot create an order from an empty cart");
  }

  let totalAmount = 0;

  const orderItems = [];

  // Check every cart item
  for (const item of cart.items) {
    const product = item.productId;

    if (!product) {
      throw new Error("One of the products in the cart no longer exists");
    }

    if (item.quantity > product.stock) {
      throw new Error(
        `Not enough stock available for ${product.title}`
      );
    }

    const itemTotal = product.price * item.quantity;

    totalAmount += itemTotal;

    orderItems.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: item.quantity,
      image: Array.isArray(product.images)
        ? product.images[0]
        : product.images
    });
  }

  // Create the order
  const order = await Order.create({
    userId,
    items: orderItems,
    totalAmount,
    shippingAddress,
    paymentStatus: "pending",
    orderStatus: "pending"
  });

  // this rempty the cart after the order has been created
  cart.items = [];
  await cart.save();

  return order;
};

const getUserOrders = async (userId) => {
  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 });

  return orders;
};

const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    userId
  });

  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};