/**
 * packageQueries.js — SQL Query Functions for the `travel_packages` Table
 * =========================================================================
 * Centralizes all database access for travel package management.
 *
 * Key PostgreSQL features used here:
 *  - `ANY($n)` operator for searching within TEXT ARRAY columns (activities)
 *  - `ILIKE` for case-insensitive partial text matching (search by name/destination)
 *  - `RETURNING *` to get the full row after INSERT/UPDATE without a second query
 */

const { pool } = require("../config/db");

/**
 * getAllActivePackages — Fetches all packages visible to customers.
 * Only returns packages where is_active = TRUE.
 * Supports optional filtering by destination, difficulty, and max price.
 * Results are ordered by creation date (newest first).
 *
 * @param {Object} filters — Optional query filters
 * @param {string} filters.search       — Partial match on name or destination
 * @param {string} filters.difficulty   — 'easy' | 'moderate' | 'challenging'
 * @param {number} filters.maxPrice     — Maximum price_per_person
 */
const getAllActivePackages = async ({ search, difficulty, maxPrice } = {}) => {
  // Build the WHERE clause dynamically based on which filters were provided
  const conditions = ["p.is_active = TRUE"]; // Always filter to active packages
  const values = [];
  let paramIndex = 1; // PostgreSQL uses $1, $2, ... for parameterized values

  if (search) {
    // ILIKE is case-insensitive LIKE; % wildcards match any surrounding characters
    conditions.push(
      `(p.name ILIKE $${paramIndex} OR p.destination ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (difficulty) {
    conditions.push(`p.difficulty = $${paramIndex}`);
    values.push(difficulty);
    paramIndex++;
  }

  if (maxPrice) {
    conditions.push(`p.price_per_person <= $${paramIndex}`);
    values.push(Number(maxPrice));
    paramIndex++;
  }

  const sql = `
    SELECT
      p.*,
      u.full_name AS created_by_name   -- JOIN to show who created the package
    FROM   travel_packages p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE  ${conditions.join(" AND ")}
    ORDER BY p.created_at DESC;
  `;

  return pool.query(sql, values);
};

/**
 * getAllPackagesAdmin — Fetches ALL packages including inactive ones.
 * Used by Staff and Admins to see the complete package catalog.
 */
const getAllPackagesAdmin = async () => {
  const sql = `
    SELECT p.*, u.full_name AS created_by_name
    FROM   travel_packages p
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.created_at DESC;
  `;
  return pool.query(sql);
};

/**
 * getPackageById — Fetches a single travel package by its primary key.
 * Returns both active and inactive packages (callers filter as needed).
 *
 * @param {number} packageId — The travel_packages.id to look up
 */
const getPackageById = async (packageId) => {
  const sql = `
    SELECT p.*, u.full_name AS created_by_name
    FROM   travel_packages p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE  p.id = $1
    LIMIT  1;
  `;
  return pool.query(sql, [packageId]);
};

/**
 * createPackage — Inserts a new travel package into the database.
 * The `created_by` should be the ID of the logged-in staff/admin user.
 * Arrays (activities, images) are passed directly as JavaScript arrays;
 * the pg driver converts them to PostgreSQL array literals automatically.
 *
 * @param {Object} data — All package fields
 */
const createPackage = async ({
  name,
  destination,
  description,
  activities,
  pricePerPerson,
  discountedPrice,
  coverImageUrl,
  images,
  durationDays,
  maxGroupSize,
  difficulty,
  createdBy,
}) => {
  const sql = `
    INSERT INTO travel_packages (
      name, destination, description, activities,
      price_per_person, discounted_price, cover_image_url, images,
      duration_days, max_group_size, difficulty, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
  return pool.query(sql, [
    name,
    destination,
    description,
    activities || [],
    pricePerPerson,
    discountedPrice || null,
    coverImageUrl || null,
    images || [],
    durationDays,
    maxGroupSize,
    difficulty,
    createdBy,
  ]);
};

/**
 * updatePackage — Updates specific fields of a travel package.
 * COALESCE ensures only provided fields are updated; missing fields
 * retain their current database values.
 *
 * @param {number} packageId — ID of the package to update
 * @param {Object} data      — Fields to update (any subset of package columns)
 */
const updatePackage = async (packageId, data) => {
  const sql = `
    UPDATE travel_packages
    SET
      name             = COALESCE($2,  name),
      destination      = COALESCE($3,  destination),
      description      = COALESCE($4,  description),
      activities       = COALESCE($5,  activities),
      price_per_person = COALESCE($6,  price_per_person),
      discounted_price = COALESCE($7,  discounted_price),
      cover_image_url  = COALESCE($8,  cover_image_url),
      images           = COALESCE($9,  images),
      duration_days    = COALESCE($10, duration_days),
      max_group_size   = COALESCE($11, max_group_size),
      difficulty       = COALESCE($12, difficulty),
      is_active        = COALESCE($13, is_active),
      updated_at       = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  return pool.query(sql, [
    packageId,
    data.name        ?? null,
    data.destination ?? null,
    data.description ?? null,
    data.activities  ?? null,
    data.pricePerPerson  ?? null,
    data.discountedPrice ?? null,
    data.coverImageUrl   ?? null,
    data.images      ?? null,
    data.durationDays    ?? null,
    data.maxGroupSize    ?? null,
    data.difficulty  ?? null,
    data.isActive    ?? null,
  ]);
};

/**
 * deactivatePackage — Soft-deletes a package by setting is_active = FALSE.
 * Preserves all existing bookings that reference this package.
 *
 * @param {number} packageId — ID of the package to deactivate
 */
const deactivatePackage = async (packageId) => {
  const sql = `
    UPDATE travel_packages
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, is_active;
  `;
  return pool.query(sql, [packageId]);
};

module.exports = {
  getAllActivePackages,
  getAllPackagesAdmin,
  getPackageById,
  createPackage,
  updatePackage,
  deactivatePackage,
};
