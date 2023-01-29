const express = require("express");
const {
    signUp,
    logIn,
    logOut,
    forgotPassword,
    resetPassword,
    getLoggedinUserDetails,
} = require("../controllers/userController");
const { isLoggedIn } = require("../middlewares/user");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(logIn);
router.route("/logout").get(logOut);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedinUserDetails);

module.exports = router;
