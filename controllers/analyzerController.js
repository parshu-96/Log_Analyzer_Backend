const multer = require('multer');

// Use memory storage (no physical file stored on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Export multer middleware
exports.uploadMiddleware = upload.single('file');

// Controller logic
exports.analyzeLogFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    console.log("Received file:", file.originalname);

    // File content is in memory buffer
    const content = file.buffer.toString('utf-8');
    //console.log(content);
    //console.log("First 100 characters of file:", content.substring(0, 100));

    // Return success response
    res.status(200).json({
      message: "File received and processed successfully",
      fileName: file.originalname,
      fileSize: file.size
    });

  } catch (error) {
    console.error("Error while processing file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
