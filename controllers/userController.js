const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");

exports.signUp = BigPromise(async (req, res, next) => {
    if (!req.files) {
        return next(new CustomError("Photo is required for signup", 400));
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(
            new CustomError("Name, Email and Password are required", 400)
        );
    }

    let file = req.files.photo;

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale",
    });

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result?.public_id,
            secure_url: result?.secure_url,
        },
    });

    cookieToken(user, res);
});

exports.logIn = BigPromise(async (req, res, next) => {
    const { email, password } = req.body;

    // Check the presenec of email and password
    if (!(email && password)) {
        return next(new CustomError("Email and password are required!", 400));
    }

    // get the user from DB
    const user = await User.findOne({ email: email }).select("+password");
    // if user is exist or not
    if (!user) {
        return next(new CustomError("Email or Password not matched!", 400));
    }

    // check the password is correct or not
    const isCorrectPassword = await user.isPasswordValidated(password);
    // if password not matched
    if (!isCorrectPassword) {
        return next(new CustomError("Email or Password not matched!", 400));
    }

    // send the token to frontend as resp
    cookieToken(user, res);
});

exports.logOut = BigPromise(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "Successfully logged out!",
    });
});
