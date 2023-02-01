const express = require("express");
const {
    addProduct,
    getAllProducts,
    adminGetAllProducts,
    getSingleProduct,
    adminUpdateSingleProduct,
    adminDeleteSingleProduct,
    addAReview,
    getReviewsForSingleProduct,
    deleteReview,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");

const router = express.Router();

// User Routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getSingleProduct);
router
    .route("/review")
    .put(isLoggedIn, addAReview)
    .delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getReviewsForSingleProduct);

// Admin Routes
router
    .route("/admin/products")
    .get(isLoggedIn, customRole("admin"), adminGetAllProducts);
router
    .route("/admin/product/add")
    .post(isLoggedIn, customRole("admin"), addProduct);
router
    .route("/admin/product/:id")
    .put(isLoggedIn, customRole("admin"), adminUpdateSingleProduct)
    .delete(isLoggedIn, customRole("admin"), adminDeleteSingleProduct);

module.exports = router;
