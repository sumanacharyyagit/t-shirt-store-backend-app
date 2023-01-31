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
            let result = await cloudinary.v2.uploader.upload(
                photo.tempFilePath,
                {
                    folder: "products",
                }
            );
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
