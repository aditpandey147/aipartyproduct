// backend/src/controllers/productTemplateController.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const ProductTemplate = require("../models/ProductTemplate");

// Public templates folder
const TEMPLATES_DIR = path.join(__dirname, "..", "public", "templates");
if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

// -------- multer for image upload --------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TEMPLATES_DIR),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safe);
  },
});
exports.upload = multer({ storage });

// ================================================================
// GET /api/product-templates  →  public list
// ================================================================
exports.listPublic = async (req, res) => {
  try {
    const items = await ProductTemplate.find({ isActive: true })
      .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// GET /api/product-templates/:id
// ================================================================
exports.getOne = async (req, res) => {
  try {
    const item = await ProductTemplate.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// POST /api/product-templates
// ================================================================
exports.create = async (req, res) => {
  try {
    const doc = await ProductTemplate.create({
      ...req.body,
      createdBy: req.user?.id,
    });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ================================================================
// PUT /api/product-templates/:id
// ================================================================
exports.update = async (req, res) => {
  try {
    const doc = await ProductTemplate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ================================================================
// DELETE /api/product-templates/:id
// ================================================================
exports.remove = async (req, res) => {
  try {
    const deleted = await ProductTemplate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// POST /api/product-templates/:id/image
// ================================================================
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file" });
    const imageUrl = `/templates/${req.file.filename}`;

    const doc = await ProductTemplate.findByIdAndUpdate(
      req.params.id,
      { $set: { imageUrl } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};