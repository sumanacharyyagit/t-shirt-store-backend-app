const Product = require("../models/product");

const updateProductStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
};

module.exports = updateProductStock;
