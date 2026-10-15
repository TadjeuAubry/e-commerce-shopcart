
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

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

  const originalItems = cart.items.map((item) => ({
    productId: item.productId?._id || item.productId,
    quantity: item.quantity
  }));

  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.productId;

    if (!product) {
      throw new Error(
        "One of the products in the cart no longer exists"
      );
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new Error(
        `Invalid quantity for ${product.title}`
      );
    }

    if (item.quantity > product.stock) {
      throw new Error(
        `Not enough stock available for ${product.title}`
      );
    }

    totalAmount += product.price * item.quantity;

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

  const stockChanges = [];
  let createdOrder = null;

  try {
    
    for (const item of orderItems) {
      const result = await Product.updateOne(
        {
          _id: item.productId,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        }
      );

      if (result.modifiedCount !== 1) {
        throw new Error(
          `Not enough stock available for ${item.title}. Please refresh your cart.`
        );
      }

      stockChanges.push({
        productId: item.productId,
        quantity: item.quantity
      });
    }

    createdOrder = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentStatus: "pending",
      orderStatus: "pending"
    });

    cart.items = [];
    await cart.save();

    return createdOrder;
  } catch (error) {

    if (createdOrder) {
      await Order.deleteOne({ _id: createdOrder._id });
    }

    for (const change of stockChanges.reverse()) {
      await Product.updateOne(
        { _id: change.productId },
        { $inc: { stock: change.quantity } }
      );
    }

    await Cart.updateOne(
      { _id: cart._id },
      { $set: { items: originalItems } }
    );

    throw error;
  }
};

const getUserOrders = async (userId) => {
  return Order.find({ userId }).sort({ createdAt: -1 });
};

const getOrderById = async (userId, orderId) => {
  return Order.findOne({
    _id: orderId,
    userId
  });
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};
