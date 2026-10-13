
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
};

  const registerUser = async (userData) => {
  const { name, email, password, phone } = userData;

  const normalizedEmail = normalizeEmail(email);

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    !normalizedEmail ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    throw new Error("Invalid registration data");
  }

  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: typeof phone === "string" ? phone.trim() : phone,
    role: "customer"
  });

  // Convert the Mongoose document into a plain object
  const userResponse = user.toObject();

  delete userResponse.password;

  return userResponse;
};

const loginUser = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || typeof password !== "string") {
    throw new Error("Invalid email or password");
  }

  const user = await User.findOne({
    email: normalizedEmail
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify the supplied password 
  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("This account has been deactivated");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );

  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    token,
    user: userResponse
  };
};

module.exports = {
  registerUser,
  loginUser
};
