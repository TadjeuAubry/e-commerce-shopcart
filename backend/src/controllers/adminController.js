const adminService = require("../services/adminService");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};


const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await adminService.updateUser(
      id,
      req.user.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } 
    catch (error) {
    next(error);
  }
};

// Activate or deactivate a user's account
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await adminService.updateUserStatus(
      id,
      req.user.userId,
      isActive
    );

    res.status(200).json({
      success: true,
      message: isActive
        ? "User account activated successfully"
        : "User account deactivated successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await adminService.deleteUser(
      id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: user
    });
  } 
    catch (error) {
    next(error);
  }
};

// 6. Get all customer orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getAllOrders();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};


// 7. Update an order's status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await adminService.updateOrderStatus(
      id,
      orderStatus
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
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