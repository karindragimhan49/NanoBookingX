/**
 * server.js — GlobeTrek Adventures Express Server Entry Point
 * ============================================================
 * This file bootstraps the Express application:
 *  1. Loads environment variables from .env
 *  2. Connects to the MongoDB database
 *  3. Registers global middleware (CORS, JSON parsing, logging)
 *  4. Mounts all API route modules
 *  5. Registers the global error handler
 *  6. Starts listening on the configured port
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables from the .env file BEFORE importing anything
// that depends on them (like the database connection)
dotenv.config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const tourRoutes = require("./src/routes/tourRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const { notFound, globalErrorHandler } = require("./src/middleware/errorMiddleware");

// ---- Initialize the Express Application ----
const app = express();

// ---- Connect to MongoDB ----
// This is called immediately; the server will start even if the DB
// is still connecting, but requests will fail until connected.
connectDB();

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// Enable Cross-Origin Resource Sharing for the React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies and Authorization headers
  })
);

// Parse incoming JSON request bodies (e.g., POST/PATCH payloads)
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded form data (for form submissions)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logger — uses "dev" format in development, "combined" in production
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Compact, colorful output for development
} else {
  app.use(morgan("combined")); // Apache-style combined log format for production
}

// ============================================================
// HEALTH CHECK ROUTE
// ============================================================
// Quick endpoint to verify the server is running (used by load balancers, etc.)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🌍 GlobeTrek Adventures API is live and running!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// API ROUTE MODULES
// ============================================================
// All routes are prefixed with /api for clear API versioning

app.use("/api/auth", authRoutes);       // Authentication: register, login, profile
app.use("/api/tours", tourRoutes);      // Tour packages: list, detail, CRUD
app.use("/api/bookings", bookingRoutes); // Bookings: create, view, manage

// ============================================================
// ERROR HANDLING (must be registered AFTER all routes)
// ============================================================

// Handle requests to undefined routes (returns 404)
app.use(notFound);

// Global error handler — catches all errors forwarded via next(error)
app.use(globalErrorHandler);

// ============================================================
// START THE SERVER
// ============================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 GlobeTrek Adventures server running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   API Base URL: http://localhost:${PORT}/api`);
});
