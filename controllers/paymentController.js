const BigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const crypto = require("crypto");

exports.sendStripeKey = BigPromise((req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.checkout.sessions.create({
    amount: req.body.amount,
    currency: "inr",

    // Optional
    metadata: {
      integration_check: "accept_a_payment",
    },
  });

  res.status(200).json({
    success: true,
    paymentId: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
    paymentObject: paymentIntent.object,
    paymentAmount: paymentIntent.amount,
    paymentStatus: paymentIntent.status,
  });
});

exports.sendRazorPayKey = BigPromise((req, res, next) => {
  res.status(200).json({
    razorPayKey: process.env.RAZORPAY_KEY_ID,
  });
});

exports.captureRazorPayPayment = BigPromise(async (req, res, next) => {
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const oprions = {
    amount: req.body.amount * 100,
    currency: "INR",
    receipt: crypto.randomBytes(20).toString("hex"),
  };

  const myOrder = await instance.orders.create(oprions);

  res.status(200).json({
    success: true,
    myOrder,
  });
});
