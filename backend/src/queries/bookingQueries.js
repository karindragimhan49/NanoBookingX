/**
 * bookingQueries.js — SQL Query Functions for the `bookings` Table
 * =================================================================
 * Manages all database operations related to customer bookings.
 *
 * Important business rules encoded here:
 *  - price_paid is stored at booking time (snapshot) to prevent
 *    retroactive pricing changes from affecting existing bookings.
 *  - Bookings JOIN to packages and users so controllers get all
 *    the display data they need in a single round-trip to the DB.
 */

const { pool } = require("../config/db");

/**
 * createBooking — Inserts a new booking record.
 * The controller must calculate price_paid before calling this.
 *
 * @param {Object} data — Booking fields
 * @param {number} data.packageId            — FK to travel_packages.id
 * @param {number} data.customerId           — FK to users.id (the customer)
 * @param {number} data.numberOfParticipants — Number of seats reserved
 * @param {number} data.pricePaid            — Total price at booking time
 * @param {string} data.tourStartDate        — ISO date string (YYYY-MM-DD)
 * @param {string} data.customizations       — Special requests / plan customizations
 */
const createBooking = async ({
  packageId,
  customerId,
  numberOfParticipants,
  pricePaid,
  tourStartDate,
  customizations,
}) => {
  const sql = `
    INSERT INTO bookings (
      package_id, customer_id, number_of_participants,
      price_paid, tour_start_date, customizations
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  return pool.query(sql, [
    packageId,
    customerId,
    numberOfParticipants,
    pricePaid,
    tourStartDate,
    customizations || null,
  ]);
};

/**
 * getBookingsByCustomer — Retrieves all bookings for a specific customer.
 * JOINs to travel_packages to include package details without a second query.
 * Results are ordered newest first.
 *
 * @param {number} customerId — The customer's users.id
 */
const getBookingsByCustomer = async (customerId) => {
  const sql = `
    SELECT
      b.*,
      tp.name            AS package_name,
      tp.destination     AS package_destination,
      tp.cover_image_url AS package_cover_image,
      tp.duration_days   AS package_duration_days,
      tp.difficulty      AS package_difficulty
    FROM   bookings b
    JOIN   travel_packages tp ON b.package_id = tp.id
    WHERE  b.customer_id = $1
    ORDER BY b.created_at DESC;
  `;
  return pool.query(sql, [customerId]);
};

/**
 * getAllBookings — Retrieves every booking in the system (admin/staff view).
 * Includes customer name and email alongside package details.
 * Ordered by creation date, newest first.
 */
const getAllBookings = async () => {
  const sql = `
    SELECT
      b.*,
      u.full_name        AS customer_name,
      u.email            AS customer_email,
      u.phone_number     AS customer_phone,
      tp.name            AS package_name,
      tp.destination     AS package_destination,
      tp.duration_days   AS package_duration_days
    FROM   bookings b
    JOIN   users u            ON b.customer_id = u.id
    JOIN   travel_packages tp ON b.package_id  = tp.id
    ORDER BY b.created_at DESC;
  `;
  return pool.query(sql);
};

/**
 * getBookingById — Fetches a single booking with full JOIN details.
 * Used to verify ownership before updates and to serve booking detail views.
 *
 * @param {number} bookingId — The bookings.id to look up
 */
const getBookingById = async (bookingId) => {
  const sql = `
    SELECT
      b.*,
      u.full_name        AS customer_name,
      u.email            AS customer_email,
      tp.name            AS package_name,
      tp.destination     AS package_destination,
      tp.max_group_size  AS package_max_group_size
    FROM   bookings b
    JOIN   users u            ON b.customer_id = u.id
    JOIN   travel_packages tp ON b.package_id  = tp.id
    WHERE  b.id = $1
    LIMIT  1;
  `;
  return pool.query(sql, [bookingId]);
};

/**
 * updateBookingStatus — Updates the booking lifecycle status.
 * Staff/Admin use this to confirm, cancel, or mark bookings as completed.
 *
 * @param {number} bookingId    — The bookings.id to update
 * @param {string} status       — New status value
 * @param {string} paymentStatus — Optional: update payment status alongside
 */
const updateBookingStatus = async (bookingId, status, paymentStatus) => {
  const sql = `
    UPDATE bookings
    SET
      status         = $2,
      payment_status = COALESCE($3, payment_status),
      updated_at     = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  return pool.query(sql, [bookingId, status, paymentStatus || null]);
};

/**
 * cancelBookingByCustomer — Allows a customer to cancel their own booking.
 * This is separate from updateBookingStatus to enforce that customers
 * can ONLY set status to 'cancelled' and only on their own bookings.
 *
 * @param {number} bookingId  — The bookings.id to cancel
 * @param {number} customerId — The customer's ID (prevents cancelling others' bookings)
 */
const cancelBookingByCustomer = async (bookingId, customerId) => {
  const sql = `
    UPDATE bookings
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = $1
      AND customer_id = $2
      AND status NOT IN ('completed', 'cancelled')
    RETURNING *;
  `;
  return pool.query(sql, [bookingId, customerId]);
};

module.exports = {
  createBooking,
  getBookingsByCustomer,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBookingByCustomer,
};
