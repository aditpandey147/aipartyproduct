// backend/models/PartyProduct.js
const mongoose = require("mongoose");

const partyProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: { type: String, required: true, index: true },
    productType: { type: String, required: true, index: true },
    designStyle: { type: String },
    aspectRatio: { type: String },

    // "PDF" or "Image"
    outputFormat: {
      type: String,
      enum: ["PDF", "Image"],
      default: "Image",
      index: true,
    },

    formData: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiPrompt: { type: String },

    // Main file — .pdf for PDF products, .png for image products
    imageUrl: { type: String },
    imageMimeType: { type: String },
    imageSizeBytes: { type: Number },

    // Thumbnail — always an image (.png), used by UI cards
    thumbnailUrl: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    errorMessage: { type: String },

    pdfPromptSnapshot: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, collection: "party_products" }
);

partyProductSchema.index({ userId: 1, createdAt: -1 });
partyProductSchema.index({ userId: 1, category: 1 });
partyProductSchema.index({ userId: 1, productType: 1 });

module.exports = mongoose.model("PartyProduct", partyProductSchema);