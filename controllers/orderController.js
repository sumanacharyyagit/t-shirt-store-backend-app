const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const Order = require("../models/order");
const updateProductStock = require("../utils/updateProductStock");

exports.createOrder = BigPromise(async (req, res, next) => {
  const user = req.user;
  const {
    shippingInfo,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    orderItems,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    orderItems,
    user: user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

exports.getSingleOrder = BigPromise(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findById(orderId).populate(
    "user",
    "name email role"
  );
  if (!order) {
    return next(new CustomError("Order not found", 401));
  }

  res.status(201).json({
    success: true,
    order,
  });
});

exports.getOrdersForLoginUser = BigPromise(async (req, res, next) => {
  const userId = req.user._id;
  const order = await Order.find({ user: userId });
  if (!order) {
    return next(new CustomError("No Order Found", 401));
  } else if (order < 1) {
    return next(new CustomError("Order list is empty", 400));
  }

  res.status(201).json({
    success: true,
    order,
  });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const order = await Order.find().populate("user", "name email role");
  if (!order) {
    return next(new CustomError("No Order Found", 401));
  } else if (order < 1) {
    return next(new CustomError("Order list is empty", 400));
  }

  res.status(201).json({
    success: true,
    order,
  });
});

exports.adminUpdateAOrder = BigPromise(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new CustomError("No Order Found", 401));
  }
  const { orderStatus } = req.body;
  if (order.orderStatus === "delivered") {
    return next(new CustomError("Order already marked as delivered", 401));
  }

  order.orderStatus = orderStatus;

  order.orderItems.forEach(
    async (eachObj) =>
      await updateProductStock(eachObj.product, eachObj.quantity)
  );

  await order.save();

  res.status(201).json({
    success: true,
    order,
  });
});

exports.adminDeleetAOrder = BigPromise(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  await order.remove();
  res.status(201).json({
    success: true,
  });
});
