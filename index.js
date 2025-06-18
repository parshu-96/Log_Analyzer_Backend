const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const analyzerRoutes = require('./routes/analyzerRoutes');
const logFileRoutes = require('./routes/logFile.routes'); // ✅ lowercase recommended
const connectDB = require("./db/db");

connectDB(); // Connect to MongoDB

const app = express();

app.use(cors({
  origin: 'http://localhost:5173' // React frontend URL
}));

app.use(express.json()); // ✅ Required to parse JSON in POST requests

// Mount routes
app.use('/api/analyze', analyzerRoutes);
app.use('/api/logfiles', logFileRoutes); // ✅ Check this name matches your router export

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
