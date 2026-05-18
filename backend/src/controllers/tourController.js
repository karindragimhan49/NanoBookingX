/**
 * tourController.js — Tour Package Controller
 * --------------------------------------------
 * Handles CRUD operations for GlobeTrek tour packages.
 * Admin-only write operations, public read operations.
 */

const Tour = require("../models/Tour");

// ============================================================
// @route   GET /api/tours
// @desc    Get all active tour packages (with optional filtering)
// @access  Public
// ============================================================
const getAllTours = async (req, res) => {
  try {
    // Build a query object — only return tours that are currently active
    const queryFilter = { isActive: true };

    // Optional filtering: difficulty (e.g., ?difficulty=easy)
    if (req.query.difficulty) {
      queryFilter.difficulty = req.query.difficulty;
    }

    // Optional filtering: max price (e.g., ?maxPrice=200)
    if (req.query.maxPrice) {
      queryFilter.pricePerPerson = { $lte: Number(req.query.maxPrice) };
    }

    // Fetch tours and populate guide name/email for display
    const tours = await Tour.find(queryFilter)
      .populate("guides", "fullName email profilePicture")
      .sort({ averageRating: -1 }); // Sort by highest rated first

    res.status(200).json({
      success: true,
      count: tours.length,
      tours,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   GET /api/tours/:id
// @desc    Get a single tour by its MongoDB ID
// @access  Public
// ============================================================
const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate("guides", "fullName email profilePicture")
      .populate("reviews"); // Virtual populate from Review model

    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found." });
    }

    res.status(200).json({ success: true, tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   POST /api/tours
// @desc    Create a new tour package
// @access  Private — Admin only
// ============================================================
const createTour = async (req, res) => {
  try {
    // Create the tour using the request body data
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tour package created successfully.",
      tour: newTour,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   PATCH /api/tours/:id
// @desc    Update specific fields of a tour package
// @access  Private — Admin only
// ============================================================
const updateTour = async (req, res) => {
  try {
    // { new: true } returns the updated document instead of the old one
    // { runValidators: true } ensures schema validation runs on update
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTour) {
      return res.status(404).json({ success: false, message: "Tour not found." });
    }

    res.status(200).json({
      success: true,
      message: "Tour updated successfully.",
      tour: updatedTour,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   DELETE /api/tours/:id
// @desc    Soft-delete a tour (set isActive to false)
// @access  Private — Admin only
// ============================================================
const deleteTour = async (req, res) => {
  try {
    // Soft delete: mark as inactive instead of removing from the database
    // This preserves historical booking data integrity
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found." });
    }

    res.status(200).json({
      success: true,
      message: "Tour has been deactivated successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllTours, getTourById, createTour, updateTour, deleteTour };
