const express = require("express");
const authController = require("../controllers/authController");
const userValidator = require("../validators/userValidator");
const loginValidator = require("../validators/loginValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post( "/register",userValidator, authController.register);
router.post( "/login", loginValidator, authController.login);
router.get("/me", authMiddleware, authController.getCurrentUser);
router.get( "/admin-test", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to the admin area"
    });
  }
);
module.exports = router;