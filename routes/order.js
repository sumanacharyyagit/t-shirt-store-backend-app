const express = require("express");
const {
  createOrder,
  getSingleOrder,
  getOrdersForLoginUser,
  adminGetAllOrders,
  adminUpdateAOrder,
  adminDeleetAOrder,
} = require("../controllers/orderController");
const { isLoggedIn, customRole } = require("../middlewares/user");

const router = express.Router();

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getSingleOrder);
router.route("/orders").get(isLoggedIn, getOrdersForLoginUser);

// Admin only routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateAOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleetAOrder);

module.exports = router;
