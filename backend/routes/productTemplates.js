// backend/src/routes/productTemplates.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/productTemplateController");

// Try to use auth if you have it; otherwise leave it out
let auth = (req, res, next) => next();
try {
  auth = require("../middleware/auth");
} catch (e) {
  console.warn("⚠️ no auth middleware found — routes are unprotected");
}

// Public
router.get("/", ctrl.listPublic);
router.get("/:id", ctrl.getOne);

// Admin (protected)
router.post("/", auth, ctrl.create);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);
router.post("/:id/image", auth, ctrl.upload.single("image"), ctrl.uploadImage);

module.exports = router;