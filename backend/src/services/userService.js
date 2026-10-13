const User = require("../models/User");

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "-password"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateUserProfile = async (userId, userData) => {
  const { name, phone } = userData;

  const updates = {};

  if (name !== undefined) {
    updates.name = name;
  }

  if (phone !== undefined) {
    updates.phone = phone;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = {
  getUserProfile,
  updateUserProfile
};