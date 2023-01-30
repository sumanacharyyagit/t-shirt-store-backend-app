const CustomPromise = require("../middlewares/bigPromise");

exports.testProduct = CustomPromise((req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to test Product Dummy API!",
    });
});
