// models/UploadSession.model.js

const mongoose = require('mongoose');

const uploadSessionSchema = new mongoose.Schema({
  userId: { type: String },                                // Optional: if user authentication is added
  logFileType: { type: String, required: true },           // File type (ex: UacLog.log)
  matchedLogs: [
    {
      matchLine: String,
      resolutionSteps: String,
      matchCountInFile: Number                             // e.g., 3 times this line appeared in uploaded file
    }
  ],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UploadSession', uploadSessionSchema);
