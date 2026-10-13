const userService = require("../services/userService");

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } 
    catch (error) {
    next(error);
  }
};


const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(
      req.user.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};