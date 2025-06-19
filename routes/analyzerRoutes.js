const express = require("express");
const router = express.Router();
const analyzerController = require("../controllers/analyzerController");

// Route to handle file upload
router.post(
  "/",
  analyzerController.uploadMiddleware,
  analyzerController.analyzeLogFile
);

router.post("/filter", analyzerController.filterCachedLogFile);

module.exports = router;
