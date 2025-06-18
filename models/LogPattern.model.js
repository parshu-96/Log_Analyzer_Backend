// models/LogPattern.model.js

const mongoose = require('mongoose');

const logPatternSchema = new mongoose.Schema({
  logFileType: { type: String, required: true },           // Example: UacLog.log
  matchLine: { type: String, required: true },             // Text to match
  resolutionSteps: { type: String, required: true },       // Steps to resolve issue
  matchCount: { type: Number, default: 0 },                // Total times matched
}, {
  timestamps: true
});

// 🔍 Indexes to optimize queries
logPatternSchema.index({ logFileType: 1 });
logPatternSchema.index({ matchLine: 1 });

module.exports = mongoose.model('LogPattern', logPatternSchema);
