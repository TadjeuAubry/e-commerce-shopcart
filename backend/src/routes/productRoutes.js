const express = require("express");
const productController = require("../controllers/productController");
const validateProduct = require("../validators/productValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.post("/", authMiddleware, roleMiddleware("admin"), validateProduct, productController.createProduct);

router.put( "/:id", authMiddleware, roleMiddleware("admin"), productController.updateProduct);

router.delete( "/:id", authMiddleware, roleMiddleware("admin"), productController.deleteProduct);

module.exports = router;