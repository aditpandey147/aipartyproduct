const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/partyKitController");

router.post("/generate", auth, ctrl.generate);

module.exports = router;