const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    subtitle: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    monthlyPrice: {
      type: Number,
      default: null,
      min: 0
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    reviewsCount: {
      type: Number,
      default: 0,
      min: 0
    },

    images: {
      type: [String],
      default: []
    },

    colors: {
      type: [String],
      default: []
    },

    stock: {
      type: Number,
      required: true,
      min: 0
    },

    isDiscounted: {
      type: Boolean,
      default: false
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model("Product", productSchema);