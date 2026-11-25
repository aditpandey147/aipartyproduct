// backend/routes/studio.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const studioController = require("../controllers/studioController");

// controller exports `run` — route must call `run`
router.post("/", auth, studioController.run);

module.exports = router;