
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required"
    });
  }

  const parts = authHeader.split(" ");

  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer" ||
    !parts[1]
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication format"
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(
      parts[1],
      process.env.JWT_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }


  try {
    const user = await User.findById(decoded.userId)
      .select("role isActive");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated"
      });
    }

    req.user = {
       userId: user._id.toString(),
        role: user.role
       };

    return next();
  }
   catch (error) {

    return next(error);
  }
};

module.exports = authMiddleware;
