const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      maxlength: [120, "Product name should not be more than 120 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      maxlength: [5, "Product name should not be more than 5 digits"],
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
    },
    photos: [
      {
        id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [
        true,
        "Please provide product category from --> shortSleeves, longSleeves, sweatShirts and hoodies",
      ],
      enum: {
        values: ["shortSleeves", "longSleeves", "sweatShirts", "hoodies"],
        message:
          "Please provide product category only from --> shortSleeves, longSleeves, sweatShirts and hoodies",
      },
    },
    brand: {
      type: String,
      required: [true, "Please add a brand for clothing"],
    },
    stock: {
      type: Number,
      required: [true, "Please add atleast quantity number as 1"],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
