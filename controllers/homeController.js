const CustomPromise = require("../middlewares/bigPromise");

exports.home = CustomPromise((req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome!",
  });
});

exports.homeDummy = CustomPromise((req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Dummy API!",
  });
});
