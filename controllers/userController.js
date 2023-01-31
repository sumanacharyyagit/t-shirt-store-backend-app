const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
const emailHandler = require("../utils/emailHelper");
const crypto = require("crypto");

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

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Check the user if exist or not
    if (!user) {
        return next(new CustomError("Email is not registered...!", 400));
    }

    // generate the tokenData for reset password params
    const forgotToken = user.getForgotPasswordToken();

    // Save the user data
    await user.save({ validateBeforeSave: false }); // Without validating the data before save in DB

    // crafting the complete email message body
    const myUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/password/reset/${forgotToken}`;
    const message = `Hello ${user.name}, \n \n \n Copy and paste this link in your browser to reset password and hit enter \n \n ${myUrl}`;

    try {
        // sending the Email payload
        await emailHandler({
            to: user.email,
            subject: `T-Shirt Store Password Reset`,
            text: message,
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (err) {
        // Clear the token and Expiry
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false }); // Without validating the data before save in DB
        return next(new CustomError(err.message, 500));
    }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
    const token = req.params.token;

    const encrypToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: encrypToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return next(new CustomError("Token is invalid or expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new CustomError(
                "Password and confirm password are not matched!",
                400
            )
        );
    }

    user.password = req.body.password;

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    // Send a JSON Response or Send Token User Data
    cookieToken(user, res);
});

exports.getLoggedinUserDetails = BigPromise(async (req, res, next) => {
    const { _id } = req.user;
    const user = await User.findById(_id);
    res.status(200).json({
        success: true,
        user,
    });
});

exports.changePasswordHandler = BigPromise(async (req, res, next) => {
    const { _id } = req.user;
    const user = await User.findById(_id).select("+password");

    const isValidOldPassword = await user.isPasswordValidated(
        req.body.oldPassword
    );
    if (!isValidOldPassword) {
        return next(new CustomError("Old Password is Incorrect!", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new CustomError("Password and Confirm Password not matched!", 400)
        );
    }

    user.password = req.body.password;
    await user.save();

    cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    // Check for email and name in requestBody
    if (!(req.body.name && req.body.email)) {
        return next(
            new CustomError("Email and Name is required to update", 400)
        );
    }

    const { _id } = req.user;

    let newData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req?.files?.photo) {
        const user = await User.findById(_id);

        const photoId = user.photo.id;
        const resp = cloudinary.v2.uploader.destroy(photoId);

        const file = req.files.photo;

        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale",
        });
        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(_id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find({});

    res.status(200).json({
        success: true,
        users,
    });
});

exports.adminGetSingleUsers = BigPromise(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
        next(new CustomError("User not found", 400));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

exports.adminUpdateSingleUserDetails = BigPromise(async (req, res, next) => {
    // Check for email and name in requestBody
    console.log(req.body);
    if (!(req.body.name && req.body.email && req.body.role)) {
        return next(
            new CustomError("Email, Name and Role is required to update", 400)
        );
    }

    const id = req.params.id;

    let newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    // if (req?.files?.photo) {
    //     const user = await User.findById(_id);

    //     const photoId = user.photo.id;
    //     const resp = cloudinary.v2.uploader.destroy(photoId);

    //     const file = req.files.photo;

    //     const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    //         folder: "users",
    //         width: 150,
    //         crop: "scale",
    //     });
    //     newData.photo = {
    //         id: result.public_id,
    //         secure_url: result.secure_url,
    //     };
    // }

    const user = await User.findByIdAndUpdate(id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

exports.adminDeleteSingleUserDetails = BigPromise(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
        return next(new CustomError("User not found", 401));
    }

    console.log(user);

    const photoId = user.photo.id;
    await cloudinary.v2.uploader.destroy(photoId);

    await user.remove();

    res.status(200).json({
        success: true,
    });
});

exports.managerAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find({ role: "user" });

    res.status(200).json({
        success: true,
        users,
    });
});
