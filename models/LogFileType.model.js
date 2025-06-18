const mongoose = require('mongoose');

const logFileTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

const LogFileType = mongoose.model('LogFileType', logFileTypeSchema);

module.exports = LogFileType;
