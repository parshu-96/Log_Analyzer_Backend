const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGODB_URI, {
      // Connect to MongoDB using the URI from environment variables
    })
    .then(() => console.log("MongoDB connected...")) // Log success message on connection
    .catch((err) => console.error("MongoDB connection error:", err)); // Log error message on failure
}

module.exports = connectDB; // Export the connectDB function for use in other files
