const express = require('express');
const cors = require('cors');
const analyzerRoutes = require('./routes/analyzerRoutes');

const app = express();

// Allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:5173'  // vite default port
}));

// Use routes
app.use('/api/analyze', analyzerRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
