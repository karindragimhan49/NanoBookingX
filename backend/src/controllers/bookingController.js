/**
 * bookingController.js — Booking Management Controller
 * ======================================================
 * Handles creating bookings, viewing booking history, and
 * updating booking statuses.
 *
 * Business Rules Enforced:
 *   - Only logged-in customers can create bookings.
 *   - Customers can view only their OWN bookings.
 *   - Customers can cancel their own bookings (if not yet completed/cancelled).
 *   - Staff and Admins can view ALL bookings and update any booking's status.
 *   - The price is always calculated server-side from the DB price — never
 *     trusted from the client — to prevent tampering.
 *   - Group size is validated against the package's max_group_size.
 */

const {
  createBooking,
  getBookingsByCustomer,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBookingByCustomer,
} = require("../queries/bookingQueries");
const { getPackageById } = require("../queries/packageQueries");

// ============================================================
// @route   POST /api/bookings
// @desc    Create a new booking for the logged-in customer
// @access  Private — Customer only
// ============================================================
const createNewBooking = async (req, res, next) => {
  try {
    const { packageId, numberOfParticipants, tourStartDate, customizations } = req.body;

    // --- Required field validation ---
    if (!packageId || !numberOfParticipants || !tourStartDate) {
      return res.status(400).json({
        success: false,
        message: "packageId, numberOfParticipants, and tourStartDate are required.",
      });
    }

    const parsedPackageId = parseInt(packageId, 10);
    const parsedParticipants = parseInt(numberOfParticipants, 10);

    if (isNaN(parsedPackageId) || isNaN(parsedParticipants) || parsedParticipants < 1) {
      return res.status(400).json({
        success: false,
        message: "packageId must be a valid number and numberOfParticipants must be at least 1.",
      });
    }

    // --- Validate the tour start date is in the future ---
    const startDate = new Date(tourStartDate);
    if (isNaN(startDate.getTime()) || startDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "tourStartDate must be a valid future date.",
      });
    }

    // --- Fetch the package to validate availability and get the price ---
    const packageResult = await getPackageById(parsedPackageId);
    if (packageResult.rows.length === 0 || !packageResult.rows[0].is_active) {
      return res.status(404).json({
        success: false,
        message: "The selected travel package is not available.",
      });
    }
    const travelPackage = packageResult.rows[0];

    // --- Enforce the max group size limit ---
    if (parsedParticipants > travelPackage.max_group_size) {
      return res.status(400).json({
        success: false,
        message: `This package allows a maximum of ${travelPackage.max_group_size} participants.`,
      });
    }

    // --- Calculate total price server-side (never trust the client's price) ---
    // Use the discounted price if available, otherwise use the standard price
    const pricePerPerson = parseFloat(
      travelPackage.discounted_price ?? travelPackage.price_per_person
    );
    const totalPricePaid = +(pricePerPerson * parsedParticipants).toFixed(2);

    // --- Create the booking record ---
    const bookingResult = await createBooking({
      packageId: parsedPackageId,
      customerId: req.user.id,  // Set from JWT via the `protect` middleware
      numberOfParticipants: parsedParticipants,
      pricePaid: totalPricePaid,
      tourStartDate,
      customizations,
    });

    res.status(201).json({
      success: true,
      message: `Booking confirmed! Your adventure to ${travelPackage.destination} awaits.`,
      booking: bookingResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings belonging to the logged-in customer
// @access  Private — Customer (own bookings only)
// ============================================================
const getMyBookings = async (req, res, next) => {
  try {
    const result = await getBookingsByCustomer(req.user.id);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      bookings: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/bookings
// @desc    Get all bookings in the system (Admin/Staff dashboard)
// @access  Private — Staff or Admin
// ============================================================
const getAllBookingsList = async (req, res, next) => {
  try {
    const result = await getAllBookings();

    res.status(200).json({
      success: true,
      count: result.rows.length,
      bookings: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/bookings/:id
// @desc    Get details of a single booking
// @access  Private — Owner (customer) or Staff/Admin
// ============================================================
const getOneBooking = async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    const result = await getBookingById(bookingId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const booking = result.rows[0];
    const isStaffOrAdmin = ["staff", "admin"].includes(req.user.role);

    // Customers can only view their own bookings
    if (!isStaffOrAdmin && booking.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking.",
      });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   PATCH /api/bookings/:id/status
// @desc    Update the status of a booking (confirm, cancel, complete)
// @access  Private — Staff or Admin
// ============================================================
const updateStatus = async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    const { status, paymentStatus } = req.body;

    // Validate that the provided status is one of the allowed values
    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}.`,
      });
    }

    // Validate payment status if provided
    const allowedPaymentStatuses = ["unpaid", "paid", "refunded"];
    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Payment status must be one of: ${allowedPaymentStatuses.join(", ")}.`,
      });
    }

    const result = await updateBookingStatus(bookingId, status, paymentStatus);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'.`,
      booking: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   PATCH /api/bookings/:id/cancel
// @desc    Allow a customer to cancel their own booking
// @access  Private — Customer (own booking only)
// ============================================================
const cancelMyBooking = async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID." });
    }

    // The query function ensures only the customer's OWN non-completed booking is cancelled
    const result = await cancelBookingByCustomer(bookingId, req.user.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found, or it has already been completed or cancelled.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Your booking has been cancelled successfully.",
      booking: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNewBooking,
  getMyBookings,
  getAllBookingsList,
  getOneBooking,
  updateStatus,
  cancelMyBooking,
};
