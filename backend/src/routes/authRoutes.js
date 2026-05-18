/**
 * authRoutes.js — Authentication Routes
 * ----------------------------------------
 * Defines the API endpoints for user registration, login, and profile retrieval.
 */

const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMyProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register — Register a new user (public)
router.post("/register", registerUser);

// POST /api/auth/login — Authenticate user and receive JWT (public)
router.post("/login", loginUser);

// GET /api/auth/me — Get the logged-in user's profile (protected)
router.get("/me", protect, getMyProfile);

module.exports = router;
