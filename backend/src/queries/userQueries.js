/**
 * userQueries.js — SQL Query Functions for the `users` Table
 * ============================================================
 * All database interactions for user accounts are centralized here.
 * Controllers import these functions instead of writing raw SQL themselves.
 *
 * Each function accepts plain values and returns the raw pg result object.
 * The calling controller decides what to do with the result rows.
 *
 * Parameterized queries ($1, $2, ...) are used throughout to prevent
 * SQL injection attacks — the pg driver handles escaping automatically.
 */

const { pool } = require("../config/db");

/**
 * findUserByEmail — Searches for a user by their email address.
 * Used during login to locate the account before verifying the password.
 * The `password_hash` column is included here because we need it to compare.
 *
 * @param {string} email — The email address to search for (case-insensitive)
 * @returns {pg.QueryResult} — rows[0] will be the user if found, undefined if not
 */
const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, full_name, email, password_hash, role, phone_number,
           profile_picture_url, is_active, created_at
    FROM   users
    WHERE  LOWER(email) = LOWER($1)
    LIMIT  1;
  `;
  return pool.query(sql, [email]);
};

/**
 * findUserById — Fetches a user by their primary key ID.
 * Used by the auth middleware to populate req.user after JWT verification.
 * Does NOT select password_hash — we never expose it after auth.
 *
 * @param {number} id — The user's integer primary key
 */
const findUserById = async (id) => {
  const sql = `
    SELECT id, full_name, email, role, phone_number,
           profile_picture_url, is_active, created_at
    FROM   users
    WHERE  id = $1
    LIMIT  1;
  `;
  return pool.query(sql, [id]);
};

/**
 * createUser — Inserts a new user account into the database.
 * The password must already be hashed before calling this function.
 * Returns the newly created user row (without the password hash).
 *
 * @param {string} fullName     — User's display name
 * @param {string} email        — Login email (must be unique)
 * @param {string} passwordHash — bcrypt hash of the plain-text password
 * @param {string} role         — 'customer' | 'staff' | 'admin'
 * @param {string} phoneNumber  — Optional contact number
 */
const createUser = async (fullName, email, passwordHash, role, phoneNumber) => {
  const sql = `
    INSERT INTO users (full_name, email, password_hash, role, phone_number)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, full_name, email, role, phone_number, created_at;
  `;
  return pool.query(sql, [fullName, email, passwordHash, role, phoneNumber || null]);
};

/**
 * getAllUsers — Retrieves all user accounts (admin dashboard use only).
 * Results are sorted by creation date descending (newest first).
 * Never returns password hashes.
 */
const getAllUsers = async () => {
  const sql = `
    SELECT id, full_name, email, role, phone_number,
           profile_picture_url, is_active, created_at
    FROM   users
    ORDER BY created_at DESC;
  `;
  return pool.query(sql);
};

/**
 * updateUserProfile — Updates a user's non-sensitive profile fields.
 * Uses COALESCE so only provided fields are changed; others keep their
 * existing values. The updated_at timestamp is refreshed automatically.
 *
 * @param {number} id           — The user's ID
 * @param {string} fullName     — New display name (or existing)
 * @param {string} phoneNumber  — New phone number (or existing)
 * @param {string} pictureUrl   — New profile picture URL (or existing)
 */
const updateUserProfile = async (id, fullName, phoneNumber, pictureUrl) => {
  const sql = `
    UPDATE users
    SET
      full_name           = COALESCE($2, full_name),
      phone_number        = COALESCE($3, phone_number),
      profile_picture_url = COALESCE($4, profile_picture_url),
      updated_at          = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, role, phone_number, profile_picture_url, updated_at;
  `;
  return pool.query(sql, [id, fullName, phoneNumber, pictureUrl]);
};

/**
 * deactivateUser — Soft-deletes a user by setting is_active = false.
 * Preserves all booking and inquiry history that references this user.
 * Admin-only operation.
 *
 * @param {number} id — The user's ID to deactivate
 */
const deactivateUser = async (id) => {
  const sql = `
    UPDATE users
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, is_active;
  `;
  return pool.query(sql, [id]);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  updateUserProfile,
  deactivateUser,
};
