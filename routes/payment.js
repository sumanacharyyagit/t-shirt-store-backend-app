const express = require("express");
const {
  sendStripeKey,
  sendRazorPayKey,
  captureRazorPayPayment,
  captureStripePayment,
} = require("../controllers/paymentController");
const { isLoggedIn } = require("../middlewares/user");

const router = express.Router();

router.route("/stripe-key").get(isLoggedIn, sendStripeKey);
router.route("/razorpay-key").get(isLoggedIn, sendRazorPayKey);

router.route("/payment/capturestripe").post(isLoggedIn, captureStripePayment);
router
  .route("/payment/capturerazorpay")
  .post(isLoggedIn, captureRazorPayPayment);

module.exports = router;
