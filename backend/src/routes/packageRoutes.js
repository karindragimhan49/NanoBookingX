/**
 * packageRoutes.js — Travel Package Routes
 * ==========================================
 * Defines all API endpoints for managing GlobeTrek travel packages.
 *
 * Access Control Matrix:
 * ┌──────────────────────────────┬─────────┬───────┬───────┐
 * │ Route                        │Customer │ Staff │ Admin │
 * ├──────────────────────────────┼─────────┼───────┼───────┤
 * │ GET /api/packages            │   ✅    │  ✅   │  ✅   │ (active only)
 * │ GET /api/packages/all        │   ❌    │  ✅   │  ✅   │ (incl. inactive)
 * │ GET /api/packages/:id        │   ✅    │  ✅   │  ✅   │
 * │ POST /api/packages           │   ❌    │  ✅   │  ✅   │
 * │ PATCH /api/packages/:id      │   ❌    │  ✅   │  ✅   │
 * │ DELETE /api/packages/:id     │   ❌    │  ❌   │  ✅   │
 * └──────────────────────────────┴─────────┴───────┴───────┘
 *
 * IMPORTANT: The /all route must be declared BEFORE /:id to prevent
 * Express from treating "all" as an ID parameter.
 */

const express = require("express");
const router = express.Router();

const {
  listActivePackages,
  listAllPackagesAdmin,
  getOnePackage,
  createNewPackage,
  updateExistingPackage,
  deletePackage,
} = require("../controllers/packageController");

const { protect, optionalAuth, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/packages — Public listing (active packages, optional filters)
// optionalAuth is used so logged-in staff/admin can see inactive packages in getOnePackage
router.get("/", listActivePackages);

// GET /api/packages/all — Full catalog including inactive (Staff + Admin only)
// ⚠️ Must come before /:id to avoid "all" being parsed as an ID
router.get(
  "/all",
  protect,
  authorizeRoles("staff", "admin"),
  listAllPackagesAdmin
);

// POST /api/packages — Create a new package (Staff + Admin only)
router.post(
  "/",
  protect,
  authorizeRoles("staff", "admin"),
  createNewPackage
);

// GET /api/packages/:id — Get single package detail
// optionalAuth: populates req.user if logged in, so the controller
// can decide whether to show inactive packages to staff
router.get("/:id", optionalAuth, getOnePackage);

// PATCH /api/packages/:id — Update a package (Staff + Admin only)
router.patch(
  "/:id",
  protect,
  authorizeRoles("staff", "admin"),
  updateExistingPackage
);

// DELETE /api/packages/:id — Soft-delete a package (Admin only)
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deletePackage
);

module.exports = router;
