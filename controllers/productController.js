const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  // Images
  let imageArray = [];
  if (!req.files) {
    return next(new CustomError("Images are required", 401));
  }
  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      let photo = req.files.photos[i];
      let result = await cloudinary.v2.uploader.upload(photo.tempFilePath, {
        folder: process.env.CLOUDINARY_FOLDER_PRODUCTS,
      });
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalProductCount = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find({}), req.query)
    .search()
    .filter();

  let products = await productsObj.base;

  const totalFilteredProductCount = await products.length;

  // products.limit().skip() ---> same as below
  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone(); // USE: clone() to prevent error --> Query was already executed

  res.status(200).json({
    success: true,
    products,
    totalFilteredProductCount,
    totalProductCount,
  });
});

exports.getSingleProduct = BigPromise(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) {
    return next(new CustomError("No product found", 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.addAReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const id = req.params.id;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const alreadyReviewed = product.reviews.find(
    (prevReview) => prevReview.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((eachReview) => {
      if (eachReview.user.toString() === req.user._id.toString()) {
        eachReview.rating = rating;
        eachReview.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // Adjust the average Ratings
  product.ratings =
    product.reviews.reduce((acc, review) => review.rating + acc, 0) /
    product.reviews.length;

  // SAVE
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviewsfilter(
    (eachItem) => eachItem.user.toString() === req.user._id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, review) => review.rating + acc, 0) /
    product.reviews.length;

  // Update The Product
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getReviewsForSingleProduct = BigPromise(async (req, res, next) => {
  const { id } = req.query;
  const product = await Product.findById(productId);

  if (!products) {
    return next(new CustomError("Product not found", 401));
  }

  res.status(200),
    json({
      success: true,
      reviews: product.reviews,
    });
});

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateSingleProduct = BigPromise(async (req, res, next) => {
  const id = req.params.id;
  let product = await Product.findById(id);

  if (!product) {
    return next(new CustomError("No product found", 401));
  }

  let imagesArray = [];
  if (req.files) {
    // destroy existing images
    for (let i = 0; i < product.photos.length; i++) {
      let res = await cloudinary.v2.uploader.destroy(product.photos[i].id);
    }
    // upload new images
    for (let i = 0; i < req.files.photos.length; i++) {
      let photo = req.files.photos[i];
      let res = await cloudinary.v2.uploader.upload(photo.tempFilePath, {
        folder: process.env.CLOUDINARY_FOLDER_PRODUCTS,
      });
      imagesArray.push({
        id: res.public_id,
        secure_url: res.secure_url,
      });
    }
  }

  req.body.photos = imagesArray;

  product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteSingleProduct = BigPromise(async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findById(id);

  if (!product) {
    return next(new CustomError("Product not found", 401));
  }
  for (let i = 0; i < product.photos.length; i++) {
    await cloudinary.v2.uploader.destroy(product.photos[i].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product was deleted!",
  });
});
