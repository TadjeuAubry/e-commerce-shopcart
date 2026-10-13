const loginValidator = (req, res, next) => {
  const { email, password } = req.body;

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

  next();
};

module.exports = loginValidator;