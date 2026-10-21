const mongoose = require("mongoose");

const clothesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },

    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price cannot be negative"],
    },

    size: {
      type: [String],
      required: [true, "size is required"],
    },

    color: {
      type: String,
      required: [true, "color is required"],
      trim: true,
    },

    brand: {
      type: String,
      required: [true, "brand is required"],
      trim: true,
    },

    stock: {
      type: Number,
      required: [true, "stock is required"],
      min: [0, "stock cannot be negative"],
      default: 0,
    },

    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },

    image: {
      type: String,
      required: [true, "image is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Clothes = mongoose.model("Clothes", clothesSchema);

module.exports = Clothes;