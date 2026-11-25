// backend/src/models/ProductTemplate.js
const mongoose = require("mongoose");

const ALLOWED_CATEGORIES = [
  "Party Invitations",
  "Party Decorations",
  "Party Games & Activities",
  "Party Favor Products",
  "Party Planning Kits",
  "Party Table Printables",
  "Party Photo Booth Kits",
];

const productTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    group: { type: String, default: "General", index: true },

    prefill: {
      category: { type: String, required: true, enum: ALLOWED_CATEGORIES }, // 👈 locked
      productType: { type: String, required: true },
      designStyle: { type: String, default: "Cute" },
      colorIndex: { type: Number, default: 0 },
      formData: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

productTemplateSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

const ProductTemplate =
  mongoose.models.ProductTemplate ||
  mongoose.model("ProductTemplate", productTemplateSchema);

module.exports = ProductTemplate;
module.exports.ALLOWED_CATEGORIES = ALLOWED_CATEGORIES;