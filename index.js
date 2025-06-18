const dotenv = require("dotenv"); // Import dotenv to load environment variables
dotenv.config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const analyzerRoutes = require('./routes/analyzerRoutes');
const connectDB = require("./db/db");
connectDB(); // Call the function to connect to the database
const app = express();

// Allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Use routes
app.use('/api/analyze', analyzerRoutes);

// Use PORT from env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
