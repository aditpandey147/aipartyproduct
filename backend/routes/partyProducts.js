// backend/src/routes/partyProducts.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // your existing JWT middleware
const ctrl = require("../controllers/partyProductController");

router.post("/generate", auth, ctrl.generate);
router.get("/", auth, ctrl.listMine);
router.get("/:id", auth, ctrl.getOne);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;