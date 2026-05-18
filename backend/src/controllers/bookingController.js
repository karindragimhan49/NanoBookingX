/**
 * bookingController.js — Booking Controller
 * ------------------------------------------
 * Handles creating bookings, retrieving user-specific bookings,
 * and admin-level booking management.
 */

const Booking = require("../models/Booking");
const Tour = require("../models/Tour");

// ============================================================
// @route   POST /api/bookings
// @desc    Create a new tour booking for the logged-in user
// @access  Private — Customer
// ============================================================
const createBooking = async (req, res) => {
  try {
    const { tourId, numberOfParticipants, tourStartDate, specialRequests } = req.body;

    // Fetch the tour to validate it exists and to capture the current price
    const tour = await Tour.findById(tourId);
    if (!tour || !tour.isActive) {
      return res.status(404).json({
        success: false,
        message: "Tour not found or is currently unavailable.",
      });
    }

    // Validate group size doesn't exceed the tour's limit
    if (numberOfParticipants > tour.maxGroupSize) {
      return res.status(400).json({
        success: false,
        message: `Maximum group size for this tour is ${tour.maxGroupSize}.`,
      });
    }

    // Calculate the total price (use discounted price if available)
    const effectivePrice = tour.discountedPrice || tour.pricePerPerson;
    const totalPrice = effectivePrice * numberOfParticipants;

    // Create the booking — `req.user._id` comes from the `protect` middleware
    const newBooking = await Booking.create({
      tour: tourId,
      user: req.user._id,
      pricePaid: totalPrice,
      numberOfParticipants,
      tourStartDate,
      specialRequests,
    });

    // Populate tour and user details for a richer response
    const populatedBooking = await newBooking.populate([
      { path: "tour", select: "name coverImage duration" },
      { path: "user", select: "fullName email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Booking created successfully! We look forward to adventuring with you.",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for the currently logged-in user
// @access  Private — Customer
// ============================================================
const getMyBookings = async (req, res) => {
  try {
    // Find all bookings where the `user` field matches the logged-in user's ID
    const myBookings = await Booking.find({ user: req.user._id })
      .populate("tour", "name coverImage duration difficulty pricePerPerson")
      .sort({ createdAt: -1 }); // Newest bookings first

    res.status(200).json({
      success: true,
      count: myBookings.length,
      bookings: myBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   GET /api/bookings
// @desc    Get all bookings across all users (admin view)
// @access  Private — Admin only
// ============================================================
const getAllBookings = async (req, res) => {
  try {
    const allBookings = await Booking.find()
      .populate("tour", "name duration")
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: allBookings.length,
      bookings: allBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @route   PATCH /api/bookings/:id/status
// @desc    Update the status of a booking (e.g., confirm, cancel)
// @access  Private — Admin only
// ============================================================
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'.`,
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
