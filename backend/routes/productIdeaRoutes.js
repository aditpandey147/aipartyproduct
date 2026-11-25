// backend/src/routes/productIdeaRoutes.js

const express = require("express");
const router = express.Router();

const productIdeaController = require(
  "../controllers/productIdeaController"
);

// Add your auth middleware here if your other protected routes use one.
// Example:
// const auth = require("../middleware/auth");
// router.post("/generate", auth, productIdeaController.generateIdeas);

router.post(
  "/generate",
  productIdeaController.generateIdeas
);

module.exports = router;