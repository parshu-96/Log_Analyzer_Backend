const LogPattern = require('../models/logPattern.model');
const LogFileType = require('../models/logFileType.model');

// Add a new log file type
exports.addLogFileType = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Log file type name is required.' });
  }

  try {
    const existing = await LogFileType.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Log file type already exists.' });
    }

    const newFileType = new LogFileType({ name });
    await newFileType.save();

    return res.status(201).json({ message: 'Log file type added successfully.', fileType: newFileType });
  } catch (error) {
    console.error('Error adding log file type:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all log file types
exports.getLogFileTypes = async (req, res) => {
  try {
    const fileTypes = await LogFileType.find().sort({ name: 1 });
    return res.status(200).json(fileTypes);
  } catch (error) {
    console.error('Error fetching log file types:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add log patterns with auto logFileType insert
exports.addLogPatterns = async (req, res) => {
  const { logFileType, entries } = req.body;

  if (!logFileType || !Array.isArray(entries)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    // Check if logFileType exists; create if not
    let fileTypeDoc = await LogFileType.findOne({ name: logFileType });
    if (!fileTypeDoc) {
      fileTypeDoc = await LogFileType.create({ name: logFileType });
      console.log(`Log file type '${logFileType}' created.`);
    }

    const formattedEntries = entries.map(entry => ({
      logFileType: logFileType,
      matchLine: entry.matchLine,
      resolutionSteps: entry.resolutionSteps,
      matchCount: 0
    }));

    const result = await LogPattern.insertMany(formattedEntries, { ordered: false });

    return res.status(201).json({
      message: `${result.length} log pattern(s) added successfully.`,
      logFileType: fileTypeDoc.name
    });

  } catch (error) {
    console.error('Error inserting log patterns:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch all patterns for a given logFileType
exports.getPatternsByLogFileType = async (req, res) => {
  const { logFileType } = req.params;

  if (!logFileType) {
    return res.status(400).json({ message: 'logFileType is required in URL.' });
  }

  try {
    const patterns = await LogPattern.find({ logFileType }).select('-__v').sort({ matchLine: 1 });

    if (patterns.length === 0) {
      return res.status(404).json({ message: `No patterns found for ${logFileType}` });
    }

    return res.status(200).json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateLogPattern = async (req, res) => {
  const { id } = req.params;
  const { matchLine, resolutionSteps } = req.body;

  if (!matchLine || !resolutionSteps) {
    return res.status(400).json({ message: 'Both matchLine and resolutionSteps are required.' });
  }

  try {
    const updated = await LogPattern.findByIdAndUpdate(
      id,
      { matchLine, resolutionSteps },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Log pattern not found' });
    }

    return res.status(200).json({ message: 'Log pattern updated successfully.', data: updated });
  } catch (error) {
    console.error('Error updating log pattern:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteLogPattern = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await LogPattern.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Log pattern not found' });
    }

    return res.status(200).json({ message: 'Log pattern deleted successfully.' });
  } catch (error) {
    console.error('Error deleting log pattern:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteLogFileType = async (req, res) => {
  const { logFileType } = req.params;

  try {
    const fileTypeDeleted = await LogFileType.findOneAndDelete({ name: logFileType });
    const patternsDeleted = await LogPattern.deleteMany({ logFileType });

    if (!fileTypeDeleted && patternsDeleted.deletedCount === 0) {
      return res.status(404).json({ message: 'Log file type not found.' });
    }

    return res.status(200).json({
      message: `Deleted log file type "${logFileType}" and ${patternsDeleted.deletedCount} pattern(s).`
    });
  } catch (error) {
    console.error('Error deleting log file type and patterns:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};