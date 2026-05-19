/**
 * authRoutes.js — Authentication Routes
 * ========================================
 * Maps HTTP methods and paths to the authentication controller functions.
 *
 * Routes:
 *   POST /api/auth/register  → Register a new customer account (public)
 *   POST /api/auth/login     → Log in and receive a JWT (public)
 *   GET  /api/auth/me        → Get own profile (protected — any role)
 */

const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMyProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes — no authentication needed
router.post("/register", registerUser);
router.post("/login",    loginUser);

// Protected route — requires a valid JWT in the Authorization header
router.get("/me", protect, getMyProfile);

module.exports = router;
