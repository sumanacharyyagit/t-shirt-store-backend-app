const express = require("express");
const {
    addProduct,
    getAllProducts,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");

const router = express.Router();

// User Routes
router.route("/products").get(getAllProducts);

// Admin Routes
router
    .route("/admin/product/add")
    .post(isLoggedIn, customRole("admin"), addProduct);

module.exports = router;
