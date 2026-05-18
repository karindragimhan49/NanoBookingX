/**
 * bookingRoutes.js — Booking Routes
 * ------------------------------------
 * Maps HTTP methods and URL patterns to booking controller functions.
 * All routes are protected — users must be authenticated.
 */

const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// POST /api/bookings — Create a new booking (any logged-in user)
router.post("/", protect, createBooking);

// GET /api/bookings/my-bookings — Get the current user's own bookings
router.get("/my-bookings", protect, getMyBookings);

// GET /api/bookings — Get ALL bookings (admin only — full system overview)
router.get("/", protect, authorizeRoles("admin"), getAllBookings);

// PATCH /api/bookings/:id/status — Update booking status (admin only)
router.patch("/:id/status", protect, authorizeRoles("admin"), updateBookingStatus);

module.exports = router;
