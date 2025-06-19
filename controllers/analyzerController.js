const multer = require("multer");
const LogPattern = require("../models/logPattern.model");

// Use memory storage (no physical file stored on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Export multer middleware
exports.uploadMiddleware = upload.single("file");

// Global in-memory log file storage
let cachedLogFile = null;

// Controller logic: Analyze full log and cache it
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

    // Cache this file globally for future filters
    cachedLogFile = content;

    const patterns = await LogPattern.find({ logFileType });
    if (!patterns || patterns.length === 0) {
      return res
        .status(404)
        .json({ message: "No patterns found for this log file type." });
    }

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
              matchLine: line,
              matchedPattern: pattern.matchLine,
              resolutionSteps: pattern.resolutionSteps,
              count: 1,
            });
          }
        }
      }
    }

    for (const match of matchResults) {
      await LogPattern.findOneAndUpdate(
        { logFileType, matchLine: match.matchedPattern },
        { $inc: { matchCount: match.count } }
      );
    }

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

// Utility: Extract date from line
function extractDateFromLine(line) {
  const regex1 = /\[\s*Date:(\d{2}-\d{2}-\d{4})/;
  const regex2 = /\[(\d{2}-\d{2}-\d{4})\]/;
  const match1 = line.match(regex1);
  if (match1) return match1[1];
  const match2 = line.match(regex2);
  if (match2) return match2[1];
  return null;
}

// Filter cached log file based on user filters (no DB logic here)
exports.filterCachedLogFile = async (req, res) => {
  try {
    if (!cachedLogFile) {
      return res.status(400).json({ message: "No log file uploaded yet." });
    }

    const { startDate, endDate, logLevel } = req.body;
    function parseDDMMYYYY(dateStr) {
      const [day, month, year] = dateStr.split("-");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Helper: Compare only date portion (strip time)
    function isSameOrAfter(date1, date2) {
      return date1.getTime() >= date2.getTime();
    }
    function isSameOrBefore(date1, date2) {
      return date1.getTime() <= date2.getTime();
    }

    const start = startDate ? parseDDMMYYYY(startDate) : null;
    const end = endDate ? parseDDMMYYYY(endDate) : null;
    const level = logLevel ? logLevel.toLowerCase() : null;

    const lines = cachedLogFile.split("\n");
    const matched = [];

    for (const line of lines) {
      const dateStr = extractDateFromLine(line);
      if (dateStr) {
        const lineDate = parseDDMMYYYY(dateStr);

        if (start && !isSameOrAfter(lineDate, start)) continue;
        if (end && !isSameOrBefore(lineDate, end)) continue;
      }

      if (level && !line.toLowerCase().includes(level)) continue;

      matched.push(line);
    }

    return res.status(200).json({ matchedLines: matched });
  } catch (error) {
    console.error("Error while filtering cached log file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
