const express = require('express');
const router = express.Router();
const controller = require('../controllers/logFile.controller');

// Existing routes
router.post('/', controller.addLogFileType);
router.get('/', controller.getLogFileTypes);
router.post('/patterns', controller.addLogPatterns);

// 👇 Add this new GET route
router.get('/patterns/:logFileType', controller.getPatternsByLogFileType);
router.put('/patterns/:id', controller.updateLogPattern);

router.delete('/patterns/:id', controller.deleteLogPattern);
router.delete('/:logFileType', controller.deleteLogFileType);

// New route to get just filenames
router.get('/filenames', controller.getLogFileTypeNames);


module.exports = router;
