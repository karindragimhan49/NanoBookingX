/**
 * tourRoutes.js — Tour Package Routes
 * ---------------------------------------
 * Maps HTTP methods and URL patterns to tour controller functions.
 * Public routes are open to everyone; write routes require admin access.
 */

const express = require("express");
const router = express.Router();

const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} = require("../controllers/tourController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// GET  /api/tours       — List all active tours (public)
// POST /api/tours       — Create a new tour (admin only)
router
  .route("/")
  .get(getAllTours)
  .post(protect, authorizeRoles("admin"), createTour);

// GET    /api/tours/:id — Get single tour details (public)
// PATCH  /api/tours/:id — Update a tour (admin only)
// DELETE /api/tours/:id — Soft-delete a tour (admin only)
router
  .route("/:id")
  .get(getTourById)
  .patch(protect, authorizeRoles("admin"), updateTour)
  .delete(protect, authorizeRoles("admin"), deleteTour);

module.exports = router;
