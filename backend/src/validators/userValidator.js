const userValidator = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must contain at least 2 characters"
    });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Password is required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters"
    });
  }

  if (phone !== undefined && typeof phone !== "string") {
    return res.status(400).json({
      success: false,
      message: "Phone number must be a string"
    });
  }

  next();
};

module.exports = userValidator;