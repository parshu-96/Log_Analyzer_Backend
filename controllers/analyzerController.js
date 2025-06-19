const multer = require("multer");

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

    // 🔍 You can now use `logFileType` to match against your DB patterns
    // e.g., find patterns from LogPattern where logFileType == "UacLog.log"

    res.status(200).json({
      message: "File received and processed successfully",
      fileName: file.originalname,
      fileSize: file.size,
      logFileType: logFileType,
    });
  } catch (error) {
    console.error("Error while processing file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
