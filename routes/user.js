const express = require("express");
const { signUp, logIn, logOut } = require("../controllers/userController");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(logIn);
router.route("/logout").get(logOut);

module.exports = router;
