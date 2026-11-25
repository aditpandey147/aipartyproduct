// backend/src/routes/trafficMachine.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/trafficMachineController");

router.post("/generate", auth, ctrl.generate);

module.exports = router;