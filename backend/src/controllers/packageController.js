/**
 * packageController.js — Travel Package Controller
 * ===================================================
 * Handles all CRUD operations for GlobeTrek travel packages.
 *
 * Access Control Summary:
 *   GET    /api/packages       → Public (active packages only, with optional filters)
 *   GET    /api/packages/all   → Staff + Admin (includes inactive packages)
 *   GET    /api/packages/:id   → Public
 *   POST   /api/packages       → Staff + Admin only
 *   PATCH  /api/packages/:id   → Staff + Admin only
 *   DELETE /api/packages/:id   → Admin only (soft-delete)
 *
 * The controller validates input, calls the appropriate query function,
 * and returns a consistent JSON envelope: { success, message, data }.
 */

const {
  getAllActivePackages,
  getAllPackagesAdmin,
  getPackageById,
  createPackage,
  updatePackage,
  deactivatePackage,
} = require("../queries/packageQueries");

// ============================================================
// @route   GET /api/packages
// @desc    Get all active packages (public, with optional query filters)
// @access  Public
// @query   ?search=Kandy  ?difficulty=easy  ?maxPrice=200
// ============================================================
const listActivePackages = async (req, res, next) => {
  try {
    // Extract and sanitize query parameters for the dynamic filter
    const { search, difficulty, maxPrice } = req.query;

    const result = await getAllActivePackages({ search, difficulty, maxPrice });

    res.status(200).json({
      success: true,
      count: result.rows.length,
      packages: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/packages/all
// @desc    Get ALL packages including inactive ones (Staff/Admin dashboard)
// @access  Private — Staff or Admin
// ============================================================
const listAllPackagesAdmin = async (req, res, next) => {
  try {
    const result = await getAllPackagesAdmin();

    res.status(200).json({
      success: true,
      count: result.rows.length,
      packages: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/packages/:id
// @desc    Get a single package by ID
// @access  Public
// ============================================================
const getOnePackage = async (req, res, next) => {
  try {
    const packageId = parseInt(req.params.id, 10);

    // Validate the ID is a proper integer before hitting the DB
    if (isNaN(packageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID. Must be a number.",
      });
    }

    const result = await getPackageById(packageId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Travel package not found.",
      });
    }

    const pkg = result.rows[0];

    // Customers can only view active packages; Staff/Admin can see all
    const isStaffOrAdmin = req.user && ["staff", "admin"].includes(req.user.role);
    if (!pkg.is_active && !isStaffOrAdmin) {
      return res.status(404).json({
        success: false,
        message: "Travel package not found.",
      });
    }

    res.status(200).json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   POST /api/packages
// @desc    Create a new travel package
// @access  Private — Staff or Admin
// ============================================================
const createNewPackage = async (req, res, next) => {
  try {
    const {
      name, destination, description, activities,
      pricePerPerson, discountedPrice, coverImageUrl,
      images, durationDays, maxGroupSize, difficulty,
    } = req.body;

    // --- Required field validation ---
    if (!name || !destination || !description || !pricePerPerson || !durationDays || !maxGroupSize) {
      return res.status(400).json({
        success: false,
        message: "Name, destination, description, pricePerPerson, durationDays, and maxGroupSize are required.",
      });
    }

    if (Number(pricePerPerson) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price per person must be greater than zero.",
      });
    }

    // req.user is set by the `protect` middleware; record who created this package
    const result = await createPackage({
      name, destination, description,
      activities: Array.isArray(activities) ? activities : [],
      pricePerPerson: Number(pricePerPerson),
      discountedPrice: discountedPrice ? Number(discountedPrice) : null,
      coverImageUrl: coverImageUrl || null,
      images: Array.isArray(images) ? images : [],
      durationDays: Number(durationDays),
      maxGroupSize: Number(maxGroupSize),
      difficulty: difficulty || "easy",
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Travel package created successfully.",
      package: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   PATCH /api/packages/:id
// @desc    Update an existing travel package (partial update)
// @access  Private — Staff or Admin
// ============================================================
const updateExistingPackage = async (req, res, next) => {
  try {
    const packageId = parseInt(req.params.id, 10);

    if (isNaN(packageId)) {
      return res.status(400).json({ success: false, message: "Invalid package ID." });
    }

    // Verify the package exists before attempting an update
    const existingResult = await getPackageById(packageId);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Travel package not found." });
    }

    // Map camelCase request body to snake_case DB column names
    const updateData = {
      name:            req.body.name,
      destination:     req.body.destination,
      description:     req.body.description,
      activities:      req.body.activities,
      pricePerPerson:  req.body.pricePerPerson ? Number(req.body.pricePerPerson) : undefined,
      discountedPrice: req.body.discountedPrice ? Number(req.body.discountedPrice) : undefined,
      coverImageUrl:   req.body.coverImageUrl,
      images:          req.body.images,
      durationDays:    req.body.durationDays ? Number(req.body.durationDays) : undefined,
      maxGroupSize:    req.body.maxGroupSize ? Number(req.body.maxGroupSize) : undefined,
      difficulty:      req.body.difficulty,
      isActive:        req.body.isActive !== undefined ? Boolean(req.body.isActive) : undefined,
    };

    const result = await updatePackage(packageId, updateData);

    res.status(200).json({
      success: true,
      message: "Travel package updated successfully.",
      package: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   DELETE /api/packages/:id
// @desc    Soft-delete a package (sets is_active = false)
// @access  Private — Admin only
// ============================================================
const deletePackage = async (req, res, next) => {
  try {
    const packageId = parseInt(req.params.id, 10);

    if (isNaN(packageId)) {
      return res.status(400).json({ success: false, message: "Invalid package ID." });
    }

    const result = await deactivatePackage(packageId);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Travel package not found." });
    }

    res.status(200).json({
      success: true,
      message: "Travel package deactivated successfully. All existing bookings are preserved.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listActivePackages,
  listAllPackagesAdmin,
  getOnePackage,
  createNewPackage,
  updateExistingPackage,
  deletePackage,
};
