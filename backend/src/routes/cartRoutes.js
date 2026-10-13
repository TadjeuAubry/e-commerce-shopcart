const express = require("express");
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");
const { addToCartValidator, validateProductIdParam, updateCartItemValidator} = require("../validators/cartValidator");

const router = express.Router();


router.get( "/", authMiddleware, cartController.getCart);

router.post("/items", authMiddleware, addToCartValidator, cartController.addToCart);

router.put( "/items/:productId", authMiddleware, validateProductIdParam, updateCartItemValidator, cartController.updateCartItem );

router.delete( "/items/:productId", authMiddleware,  validateProductIdParam, cartController.removeFromCart );

router.delete( "/", authMiddleware, cartController.clearCart);

module.exports = router;