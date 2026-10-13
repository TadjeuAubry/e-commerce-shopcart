const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get( "/me", authMiddleware, userController.getProfile );

router.put( "/me",authMiddleware, userController.updateProfile );

module.exports = router;