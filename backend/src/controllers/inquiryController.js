/**
 * inquiryController.js — Customer Inquiry Controller
 * =====================================================
 * Manages the lifecycle of customer inquiries / support tickets.
 *
 * Access Control Summary:
 *   POST /api/inquiries              → Public (guests and logged-in users)
 *   GET  /api/inquiries              → Staff + Admin (all inquiries with filter)
 *   GET  /api/inquiries/my-inquiries → Customer (own inquiries only)
 *   GET  /api/inquiries/:id          → Staff/Admin or inquiry owner
 *   PATCH /api/inquiries/:id         → Staff + Admin (assign, respond, change status)
 *
 * When a logged-in user submits an inquiry, their user_id is captured
 * automatically from the JWT — they don't need to type their details again
 * (though name/email fields are still required for display purposes).
 */

const {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  getInquiriesByUser,
  updateInquiry,
} = require("../queries/inquiryQueries");

// ============================================================
// @route   POST /api/inquiries
// @desc    Submit a new inquiry (public — guests and logged-in users)
// @access  Public
// ============================================================
const submitInquiry = async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, subject, message } = req.body;

    // --- Required field validation ---
    if (!customerName || !customerEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "customerName, customerEmail, subject, and message are all required.",
      });
    }

    // Basic email format check
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // If the user is logged in (token was provided), link the inquiry to their account.
    // `req.user` is populated by the optional auth middleware; null for guests.
    const userId = req.user ? req.user.id : null;

    const result = await createInquiry({
      customerName,
      customerEmail,
      customerPhone,
      subject,
      message,
      userId,
    });

    res.status(201).json({
      success: true,
      message:
        "Your inquiry has been submitted successfully. Our team will get back to you within 24 hours.",
      inquiry: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/inquiries
// @desc    Get all inquiries (admin/staff management view)
// @access  Private — Staff or Admin
// @query   ?status=new  ?status=in_progress  ?status=resolved
// ============================================================
const listAllInquiries = async (req, res, next) => {
  try {
    // Allow filtering by status to focus on specific workflow states
    const { status } = req.query;

    // Validate the status filter if provided to prevent bad DB queries
    const allowedStatuses = ["new", "in_progress", "resolved", "closed"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status filter must be one of: ${allowedStatuses.join(", ")}.`,
      });
    }

    const result = await getAllInquiries(status || null);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      inquiries: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/inquiries/my-inquiries
// @desc    Get all inquiries submitted by the logged-in user
// @access  Private — any logged-in user
// ============================================================
const getMyInquiries = async (req, res, next) => {
  try {
    const result = await getInquiriesByUser(req.user.id);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      inquiries: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   GET /api/inquiries/:id
// @desc    Get details of a specific inquiry
// @access  Private — Staff/Admin, or the inquiry's submitting user
// ============================================================
const getOneInquiry = async (req, res, next) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    if (isNaN(inquiryId)) {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID." });
    }

    const result = await getInquiryById(inquiryId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }

    const inquiry = result.rows[0];
    const isStaffOrAdmin = ["staff", "admin"].includes(req.user.role);
    const isOwner = inquiry.user_id === req.user.id;

    // Customers can only view inquiries they submitted themselves
    if (!isStaffOrAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this inquiry.",
      });
    }

    res.status(200).json({ success: true, inquiry });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @route   PATCH /api/inquiries/:id
// @desc    Update an inquiry: assign staff, change status, add response
// @access  Private — Staff or Admin
// ============================================================
const respondToInquiry = async (req, res, next) => {
  try {
    const inquiryId = parseInt(req.params.id, 10);
    if (isNaN(inquiryId)) {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID." });
    }

    const { status, assignedTo, response } = req.body;

    // Validate status if provided
    const allowedStatuses = ["new", "in_progress", "resolved", "closed"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}.`,
      });
    }

    // At least one field must be provided for the update to make sense
    if (!status && !assignedTo && !response) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update: status, assignedTo, or response.",
      });
    }

    const result = await updateInquiry(inquiryId, {
      status,
      assignedTo: assignedTo ? parseInt(assignedTo, 10) : undefined,
      response,
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry updated successfully.",
      inquiry: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitInquiry,
  listAllInquiries,
  getMyInquiries,
  getOneInquiry,
  respondToInquiry,
};
