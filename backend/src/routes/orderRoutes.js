const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const { orderValidator,validateOrderIdParam} = require("../validators/orderValidator");

const router = express.Router();


router.post( "/", authMiddleware, orderValidator, orderController.createOrder);

router.get( "/", authMiddleware, orderController.getUserOrders);

router.get( "/:id", authMiddleware, validateOrderIdParam, orderController.getOrderById );


module.exports = router;