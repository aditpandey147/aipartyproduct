// backend/src/routes/partyProductRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const partyProductController = require("../controllers/partyProductController");

// ============================================================
// ⚠️ STATIC ROUTES FIRST — before /:id
// ============================================================
router.get("/stats", auth, partyProductController.getStats);
router.post("/generate", auth, partyProductController.generate);

// ============================================================
// CRUD ROUTES
// ============================================================
router.get("/", auth, partyProductController.listMine);
router.get("/:id", auth, partyProductController.getOne);
router.delete("/:id", auth, partyProductController.remove);

module.exports = router;
