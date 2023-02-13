const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxLength: [40, "Name should under 40 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      // validate: [validator.isEmail, "Please enter a valid email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      default: "user",
    },
    photo: {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    // craetedAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    timestamps: true,
  }
);

// Excrypt the password before Save --- Hooks
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Validate the password with passed on user password
userSchema.methods.isPasswordValidated = async function (sentUserPassword) {
  return await bcrypt.compare(sentUserPassword, this.password);
};

// Create and Return JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// Generate Forgot Password Token
userSchema.methods.getForgotPasswordToken = function () {
  // Generate a random long string value
  const forgotPwdToken = crypto.randomBytes(20).toString("hex");

  // Getting Hash for forgotPwdToken into DB - ** TODO: Make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotPwdToken)
    .digest("hex");

  // Time for exoiration of token
  this.forgotPasswordExpiry =
    Date.now() + process.env.FORGOT_PASSWORD_EXPIRY * 60 * 1000;

  return forgotPwdToken;
};

module.exports = mongoose.model("User", userSchema);
