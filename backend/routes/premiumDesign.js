// backend/src/routes/premiumDesign.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/premiumDesignController");

router.post("/generate", auth, ctrl.generate);
router.post("/polish", auth, ctrl.polish);

module.exports = router;