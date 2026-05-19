/**
 * inquiryRoutes.js — Customer Inquiry Routes
 * ============================================
 * Maps all inquiry-related endpoints to their controller functions.
 *
 * Access Control Matrix:
 * ┌──────────────────────────────────┬───────┬─────────┬───────┬───────┐
 * │ Route                            │ Guest │Customer │ Staff │ Admin │
 * ├──────────────────────────────────┼───────┼─────────┼───────┼───────┤
 * │ POST /api/inquiries              │  ✅   │   ✅    │  ✅   │  ✅   │
 * │ GET  /api/inquiries/my-inquiries │  ❌   │   ✅    │  ❌   │  ✅   │
 * │ GET  /api/inquiries              │  ❌   │   ❌    │  ✅   │  ✅   │
 * │ GET  /api/inquiries/:id          │  ❌   │ own ✅  │  ✅   │  ✅   │
 * │ PATCH /api/inquiries/:id         │  ❌   │   ❌    │  ✅   │  ✅   │
 * └──────────────────────────────────┴───────┴─────────┴───────┴───────┘
 *
 * Route ordering note: /my-inquiries must be declared BEFORE /:id.
 */

const express = require("express");
const router = express.Router();

const {
  submitInquiry,
  listAllInquiries,
  getMyInquiries,
  getOneInquiry,
  respondToInquiry,
} = require("../controllers/inquiryController");

const { protect, optionalAuth, authorizeRoles } = require("../middleware/authMiddleware");

// POST /api/inquiries — Anyone can submit (optionalAuth links to user account if logged in)
router.post("/", optionalAuth, submitInquiry);

// GET /api/inquiries/my-inquiries — Logged-in user sees their own submitted inquiries
// ⚠️ Must come before /:id
router.get("/my-inquiries", protect, getMyInquiries);

// GET /api/inquiries — Staff/Admin sees the full inquiry list (with optional ?status= filter)
router.get("/", protect, authorizeRoles("staff", "admin"), listAllInquiries);

// GET /api/inquiries/:id — Single inquiry detail (owner or staff/admin — enforced in controller)
router.get("/:id", protect, getOneInquiry);

// PATCH /api/inquiries/:id — Staff/Admin assigns, responds to, or updates inquiry status
router.patch("/:id", protect, authorizeRoles("staff", "admin"), respondToInquiry);

module.exports = router;
