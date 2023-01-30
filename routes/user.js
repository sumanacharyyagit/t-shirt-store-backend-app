const express = require("express");
const {
    signUp,
    logIn,
    logOut,
    forgotPassword,
    resetPassword,
    getLoggedinUserDetails,
    changePasswordHandler,
    updateUserDetails,
    adminAllUsers,
    managerAllUsers,
    adminGetSingleUsers,
    adminUpdateSingleUserDetails,
    adminDeleteSingleUserDetails,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(logIn);
router.route("/logout").get(logOut);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedinUserDetails);
router.route("/password/update").post(isLoggedIn, changePasswordHandler);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// Admin Routes Only
router
    .route("/admin/users")
    .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
    .route("/admin/user/:id")
    .get(isLoggedIn, customRole("admin"), adminGetSingleUsers)
    .put(isLoggedIn, customRole("admin"), adminUpdateSingleUserDetails)
    .delete(isLoggedIn, customRole("admin"), adminDeleteSingleUserDetails);

// manager Routes Only
router
    .route("/manager/users")
    .get(isLoggedIn, customRole("manager"), managerAllUsers);

module.exports = router;
