const bcrypt = require("bcrypt");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

const getAllUsers = async () => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  return users;
};

const createUser = async (userData) => {
  const {
    name,
    email,
    password,
    phone,
    role
  } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  if (!["customer", "admin"].includes(role)) {
    throw new Error("Invalid user role");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};


const updateUser = async (userId, adminId, userData) => {
  const { name, email, phone, role } = userData;

  // Prevent an admin from removing their own admin role
  if (
    userId.toString() === adminId.toString() &&
    role !== undefined &&
    role !== "admin"
  ) {
    throw new Error("You cannot remove your own admin role");
  }

  // Find the user to update
  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const updates = {};

  // Update allowed fields only
  if (name !== undefined) {
    updates.name = name.trim();
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();

    // Make sure another user is not using this email
    const duplicateEmail = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId }
    });

    if (duplicateEmail) {
      throw new Error("Email is already registered");
    }

    updates.email = normalizedEmail;
  }

  if (phone !== undefined) {
    updates.phone = phone.trim();
  }

  if (role !== undefined) {
    if (!["customer", "admin"].includes(role)) {
      throw new Error("Invalid user role");
    }

    updates.role = role;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    {
      new: true,
      runValidators: true
    }
  ).select("-password");

  return updatedUser;
};

// Activate or deactivate a user account
const updateUserStatus = async (userId, adminId, isActive) => {
  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be true or false");
  }

  // Prevent an admin from deactivating their own account
  if (
    userId.toString() === adminId.toString() &&
    isActive === false
  ) {
    throw new Error("You cannot deactivate your own account");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deactivating the only active administrator
  if (user.role === "admin" && isActive === false) {
    const activeAdminCount = await User.countDocuments({
      role: "admin",
      isActive: true
    });

    if (activeAdminCount <= 1) {
      throw new Error(
        "Cannot deactivate the only active administrator"
      );
    }
  }

  user.isActive = isActive;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};


const deleteUser = async (userId, adminId) => {
  
  if (String(userId) === String(adminId)) {
    throw new Error("You cannot delete your own admin account");
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin" && user.isActive) {
    const activeAdminCount = await User.countDocuments({
      role: "admin",
      isActive: true
    });

    if (activeAdminCount <= 1) {
      throw new Error(
        "Cannot delete the only active administrator"
      );
    }
  }

  const existingOrder = await Order.findOne({ userId });

  if (existingOrder) {
    throw new Error(
      "This user has order history. Deactivate the account instead."
    );
  }

  await Cart.deleteOne({ userId });

  await User.findByIdAndDelete(userId);

  return user;
};


const getAllOrders = async () => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return orders;
};


const updateOrderStatus = async (orderId, orderStatus) => {
  const Product = require("../models/Product");

  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ];

  if (!allowedStatuses.includes(orderStatus)) {
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  // Do not allow a cancelled order to be reopened.
  if (order.orderStatus === "cancelled") {
    throw new Error("A cancelled order cannot be updated");
  }

  // Do not cancel an order that has already been delivered.
  if (
    orderStatus === "cancelled" &&
    order.orderStatus === "delivered"
  ) {
    throw new Error("A delivered order cannot be cancelled");
  }

  if (orderStatus === "cancelled") {
    const restoredProducts = [];

    try {
      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } }
        );

        if (result.matchedCount !== 1) {
          throw new Error(
            `Could not restore stock for ${item.title}`
          );
        }

        restoredProducts.push({
          productId: item.productId,
          quantity: item.quantity
        });
      }

      order.orderStatus = "cancelled";
      await order.save();
    } catch (error) {
      
      for (const item of restoredProducts.reverse()) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }

      throw error;
    }
  } else {
    order.orderStatus = orderStatus;
    await order.save();
  }

  return Order.findById(orderId).populate( "userId", "name email" );
};


module.exports = {
  getAllUsers,
   createUser,
   updateUser,
   updateUserStatus,
   deleteUser,
   getAllOrders,
   updateOrderStatus
};