/**
 * server.js — GlobeTrek Adventures Express Server Entry Point
 * ============================================================
 * Bootstraps the entire backend application in this order:
 *
 *  1. Load environment variables from .env (must be first)
 *  2. Connect to Neon PostgreSQL and run schema initialization
 *  3. Register global middleware (CORS, JSON parsing, request logging)
 *  4. Mount all API route modules under /api/*
 *  5. Register the global error handler (must be last)
 *  6. Start listening for incoming HTTP connections
 *
 * Changed from previous version:
 *  - Replaced Mongoose/MongoDB with `pg` (node-postgres) for Neon PostgreSQL
 *  - `initializeDatabase()` now creates all tables on startup if they don't exist
 *  - Removed the old `/api/tours` route; replaced with `/api/packages`
 *  - Added `/api/inquiries` route for customer support tickets
 */

// Step 1: Load .env variables FIRST — all subsequent imports may depend on them
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Database setup
const { testConnection } = require("./src/config/db");
const initializeDatabase = require("./src/config/initDb");

// Route modules
const authRoutes    = require("./src/routes/authRoutes");
const packageRoutes = require("./src/routes/packageRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const inquiryRoutes = require("./src/routes/inquiryRoutes");

// Error handling middleware
const { notFound, globalErrorHandler } = require("./src/middleware/errorMiddleware");

// ---- Create the Express Application ----
const app = express();

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// CORS — Allow requests from the React frontend (Vite dev server)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow Authorization headers and cookies
  })
);

// Parse incoming JSON request bodies (limits to 10mb to prevent payload abuse)
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded form data (for HTML form submissions)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging:
//  - "dev" mode: colorful, compact output for development
//  - "combined" mode: Apache-style detailed logs for production
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// ============================================================
// HEALTH CHECK ROUTE
// ============================================================
// Used by load balancers, uptime monitors, and CI pipelines to
// verify the server is running without hitting the database.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🌍 GlobeTrek Adventures API is healthy and running!",
    environment: process.env.NODE_ENV,
    database: "Neon PostgreSQL",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// API ROUTE MODULES
// ============================================================
// Each module is mounted with a base path. All API routes are
// prefixed with /api for clear separation from the frontend.

app.use("/api/auth",     authRoutes);    // Authentication: /register, /login, /me
app.use("/api/packages", packageRoutes); // Travel packages: CRUD with role-based access
app.use("/api/bookings", bookingRoutes); // Bookings: create, view, update status
app.use("/api/inquiries", inquiryRoutes); // Customer inquiries / support tickets

// ============================================================
// ERROR HANDLING
// ============================================================
// These MUST be registered after all routes.
// Express identifies error handlers by their 4-argument signature.

app.use(notFound);           // Catches requests to undefined routes → 404
app.use(globalErrorHandler); // Handles all errors passed via next(error)

// ============================================================
// SERVER STARTUP
// ============================================================
const PORT = parseInt(process.env.PORT || "5000", 10);

/**
 * startServer — Initializes the database, then starts listening.
 * Using an async function allows us to `await` the DB setup before
 * accepting traffic, preventing requests from hitting uninitialized tables.
 */
const startServer = async () => {
  try {
    // Step 2: Verify the database connection is reachable
    await testConnection();

    // Step 3: Create tables and indexes if they don't already exist
    await initializeDatabase();

    // Step 4: Start accepting HTTP requests
    app.listen(PORT, () => {
      console.log("═══════════════════════════════════════════════");
      console.log("  🚀 GlobeTrek Adventures API — Server Started");
      console.log("═══════════════════════════════════════════════");
      console.log(`  Environment : ${process.env.NODE_ENV}`);
      console.log(`  Port        : ${PORT}`);
      console.log(`  API Base    : http://localhost:${PORT}/api`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log("═══════════════════════════════════════════════");
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1); // Exit with error code so PM2 / Docker can restart the container
  }
};

startServer();
