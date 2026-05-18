/**
 * db.js — MongoDB Connection Configuration
 * -----------------------------------------
 * Establishes and manages the MongoDB connection using Mongoose.
 * Logs success or exits the process on failure.
 */

const mongoose = require("mongoose");

/**
 * connectDB — Connects to the MongoDB database.
 * Uses the MONGO_URI environment variable set in .env.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB with the URI from environment variables
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `✅ MongoDB connected successfully: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    // If connection fails, log the error and terminate the server process
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
