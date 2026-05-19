/**
 * inquiryQueries.js — SQL Query Functions for the `inquiries` Table
 * ==================================================================
 * Manages customer inquiries / support tickets.
 *
 * Guest users (not logged in) can also submit inquiries, so `user_id`
 * is always optional. The `customer_name` and `customer_email` fields
 * are filled explicitly rather than being looked up from the users table,
 * ensuring inquiries remain complete even if an account is later deleted.
 */

const { pool } = require("../config/db");

/**
 * createInquiry — Submits a new customer inquiry.
 * Works for both registered users and anonymous guests.
 *
 * @param {Object} data
 * @param {string}  data.customerName  — Submitter's name (required)
 * @param {string}  data.customerEmail — Submitter's email for follow-up (required)
 * @param {string}  data.customerPhone — Submitter's phone (optional)
 * @param {string}  data.subject       — Short description of the inquiry
 * @param {string}  data.message       — Full inquiry text
 * @param {number|null} data.userId    — FK to users.id if the user is logged in
 */
const createInquiry = async ({
  customerName,
  customerEmail,
  customerPhone,
  subject,
  message,
  userId,
}) => {
  const sql = `
    INSERT INTO inquiries (
      customer_name, customer_email, customer_phone,
      subject, message, user_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  return pool.query(sql, [
    customerName,
    customerEmail,
    customerPhone || null,
    subject,
    message,
    userId || null,
  ]);
};

/**
 * getAllInquiries — Retrieves all inquiries (admin/staff view).
 * Includes the name of the assigned staff member if one exists.
 * Results are ordered by creation date, newest first.
 *
 * @param {string} statusFilter — Optional: filter to a specific status
 */
const getAllInquiries = async (statusFilter) => {
  // Build the WHERE clause conditionally
  const conditions = [];
  const values = [];

  if (statusFilter) {
    conditions.push(`i.status = $${values.length + 1}`);
    values.push(statusFilter);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(" AND ")}`
    : ""; // No filter = return everything

  const sql = `
    SELECT
      i.*,
      u.full_name AS assigned_staff_name  -- Show who is handling this inquiry
    FROM   inquiries i
    LEFT JOIN users u ON i.assigned_to = u.id
    ${whereClause}
    ORDER BY i.created_at DESC;
  `;
  return pool.query(sql, values);
};

/**
 * getInquiryById — Fetches a single inquiry by its primary key.
 *
 * @param {number} inquiryId — The inquiries.id to fetch
 */
const getInquiryById = async (inquiryId) => {
  const sql = `
    SELECT i.*, u.full_name AS assigned_staff_name
    FROM   inquiries i
    LEFT JOIN users u ON i.assigned_to = u.id
    WHERE  i.id = $1
    LIMIT  1;
  `;
  return pool.query(sql, [inquiryId]);
};

/**
 * getInquiriesByUser — Fetches all inquiries submitted by a registered user.
 * Allows customers to track their own inquiry history.
 *
 * @param {number} userId — The users.id of the inquiry submitter
 */
const getInquiriesByUser = async (userId) => {
  const sql = `
    SELECT id, customer_name, subject, status, response, created_at, updated_at
    FROM   inquiries
    WHERE  user_id = $1
    ORDER BY created_at DESC;
  `;
  return pool.query(sql, [userId]);
};

/**
 * updateInquiry — Updates an inquiry's status, assignment, and/or response.
 * Staff use this to assign themselves, update progress, and record replies.
 * COALESCE ensures only the provided fields are changed.
 *
 * @param {number} inquiryId  — The inquiry to update
 * @param {Object} data
 * @param {string}  data.status      — New status value
 * @param {number}  data.assignedTo  — FK to users.id of the handling staff member
 * @param {string}  data.response    — Staff's reply text
 */
const updateInquiry = async (inquiryId, { status, assignedTo, response }) => {
  const sql = `
    UPDATE inquiries
    SET
      status      = COALESCE($2, status),
      assigned_to = COALESCE($3, assigned_to),
      response    = COALESCE($4, response),
      updated_at  = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  return pool.query(sql, [
    inquiryId,
    status     || null,
    assignedTo || null,
    response   || null,
  ]);
};

module.exports = {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  getInquiriesByUser,
  updateInquiry,
};
