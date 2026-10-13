const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validateUserIdParam,   validateOrderIdParam, createAdminUserValidator, updateAdminUserValidator, updateUserStatusValidator, updateOrderStatusValidator } = require("../validators/adminValidator");


const router = express.Router();

router.get( "/users",  authMiddleware, roleMiddleware("admin"), adminController.getAllUsers );

router.post( "/users", authMiddleware, roleMiddleware("admin"), createAdminUserValidator, adminController.createUser );

router.put( "/users/:id", authMiddleware, roleMiddleware("admin"),  validateUserIdParam, updateAdminUserValidator,  adminController.updateUser );

router.patch( "/users/:id/status", authMiddleware, roleMiddleware("admin"), validateUserIdParam, updateUserStatusValidator, adminController.updateUserStatus );

router.delete( "/users/:id", authMiddleware, roleMiddleware("admin"), validateUserIdParam, adminController.deleteUser );

router.get( "/orders", authMiddleware, roleMiddleware("admin"), adminController.getAllOrders );

router.patch( "/orders/:id/status", authMiddleware, roleMiddleware("admin"), validateOrderIdParam, updateOrderStatusValidator, adminController.updateOrderStatus );
 
module.exports = router;