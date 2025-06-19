const multer = require("multer");
const LogPattern = require("../models/logPattern.model");

// Use memory storage (no physical file stored on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Export multer middleware
exports.uploadMiddleware = upload.single("file");

// Controller logic
exports.analyzeLogFile = async (req, res) => {
  try {
    const file = req.file;
    const logFileType = req.body.logFileType;

    if (!file || !logFileType) {
      return res
        .status(400)
        .json({ message: "File and logFileType are required." });
    }

    console.log("Received file:", file.originalname);
    console.log("Log file type:", logFileType);

    const content = file.buffer.toString("utf-8");
    const lines = content.split("\n");

    // Fetch patterns from DB for this logFileType
    const patterns = await LogPattern.find({ logFileType });
    if (!patterns || patterns.length === 0) {
      return res
        .status(404)
        .json({ message: "No patterns found for this log file type." });
    }

    // Create map to store match counts and the first matching log line
    const matchResults = [];

    for (const line of lines) {
      for (const pattern of patterns) {
        if (line.includes(pattern.matchLine)) {
          let existing = matchResults.find(
            (r) => r.matchedPattern === pattern.matchLine
          );

          if (existing) {
            existing.count++;
          } else {
            matchResults.push({
              matchLine: line, // first actual log line from file
              matchedPattern: pattern.matchLine, // the DB pattern matched
              resolutionSteps: pattern.resolutionSteps,
              count: 1,
            });
          }
        }
      }
    }

    // Update matchCount in DB for each pattern
    for (const match of matchResults) {
      await LogPattern.findOneAndUpdate(
        { logFileType, matchLine: match.matchedPattern },
        { $inc: { matchCount: match.count } }
      );
    }

    // Return only matchLine (actual log line), resolutionSteps, and count
    const simplifiedResults = matchResults.map((r) => ({
      matchLine: r.matchLine,
      resolutionSteps: r.resolutionSteps,
      count: r.count,
    }));

    return res.status(200).json(simplifiedResults);
  } catch (error) {
    console.error("Error while processing file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
