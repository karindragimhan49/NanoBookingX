/**
 * bookingRoutes.js — Booking Routes
 * ====================================
 * Maps all booking-related HTTP requests to their controller functions.
 *
 * Access Control Matrix:
 * ┌────────────────────────────────────┬─────────┬───────┬───────┐
 * │ Route                              │Customer │ Staff │ Admin │
 * ├────────────────────────────────────┼─────────┼───────┼───────┤
 * │ POST /api/bookings                 │   ✅    │  ❌   │  ❌   │
 * │ GET  /api/bookings/my-bookings     │   ✅    │  ❌   │  ❌   │
 * │ PATCH /api/bookings/:id/cancel     │   ✅    │  ❌   │  ❌   │
 * │ GET  /api/bookings                 │   ❌    │  ✅   │  ✅   │
 * │ GET  /api/bookings/:id             │ own ✅  │  ✅   │  ✅   │
 * │ PATCH /api/bookings/:id/status     │   ❌    │  ✅   │  ✅   │
 * └────────────────────────────────────┴─────────┴───────┴───────┘
 *
 * Route ordering note: /my-bookings must be declared BEFORE /:id
 * to prevent Express matching "my-bookings" as an ID parameter.
 */

const express = require("express");
const router = express.Router();

const {
  createNewBooking,
  getMyBookings,
  getAllBookingsList,
  getOneBooking,
  updateStatus,
  cancelMyBooking,
} = require("../controllers/bookingController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// All booking routes require authentication at minimum
// (no public access to booking data)

// POST /api/bookings — Customer creates a booking
router.post("/", protect, authorizeRoles("customer"), createNewBooking);

// GET /api/bookings/my-bookings — Customer views their own bookings
// ⚠️ Must come before /:id
router.get("/my-bookings", protect, authorizeRoles("customer"), getMyBookings);

// GET /api/bookings — Staff/Admin sees all bookings
router.get("/", protect, authorizeRoles("staff", "admin"), getAllBookingsList);

// GET /api/bookings/:id — Single booking detail (owner or staff/admin)
router.get("/:id", protect, getOneBooking);

// PATCH /api/bookings/:id/status — Staff/Admin updates booking status
router.patch("/:id/status", protect, authorizeRoles("staff", "admin"), updateStatus);

// PATCH /api/bookings/:id/cancel — Customer cancels their own booking
router.patch("/:id/cancel", protect, authorizeRoles("customer"), cancelMyBooking);

module.exports = router;
