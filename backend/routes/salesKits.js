const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/salesKitController");

router.post("/generate-listing", auth, ctrl.generateListing);
router.post("/export", auth, ctrl.exportSalesKit);

module.exports = router;