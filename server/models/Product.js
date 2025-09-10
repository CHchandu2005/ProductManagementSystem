const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"]
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    trim: true
  },
  image: {
    type: String,
    required: [true, "Product image URL is required"],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);
