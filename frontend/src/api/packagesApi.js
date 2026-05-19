/**
 * packagesApi.js — Travel Packages API Client
 * =============================================
 * All HTTP requests for travel packages go through this file.
 * Uses the shared axiosInstance which automatically attaches the
 * JWT Authorization header on protected routes.
 *
 * Endpoint mapping:
 *   GET    /api/packages          → getAllPackages (public, with filters)
 *   GET    /api/packages/all      → getAllPackagesAdmin (staff/admin only)
 *   GET    /api/packages/:id      → getPackageById (public)
 *   POST   /api/packages          → createPackage (staff/admin only)
 *   PATCH  /api/packages/:id      → updatePackage (staff/admin only)
 *   DELETE /api/packages/:id      → deletePackage (admin only)
 */

import axiosInstance from "./axiosInstance";

// Base path for all package endpoints
const PACKAGES_URL = "/packages";

/**
 * getAllPackages — Fetches active packages with optional filters.
 * Supports: ?search=  ?difficulty=  ?maxPrice=
 *
 * @param {Object} params — Optional query parameter object
 */
export const getAllPackages = (params = {}) =>
  axiosInstance.get(PACKAGES_URL, { params });

/**
 * getAllPackagesAdmin — Fetches ALL packages including inactive.
 * Requires Staff or Admin JWT token.
 */
export const getAllPackagesAdmin = () =>
  axiosInstance.get(`${PACKAGES_URL}/all`);

/**
 * getPackageById — Fetches a single package by its integer ID.
 *
 * @param {number} id — The PostgreSQL integer primary key
 */
export const getPackageById = (id) =>
  axiosInstance.get(`${PACKAGES_URL}/${id}`);

/**
 * createPackage — Creates a new travel package.
 * Requires Staff or Admin JWT token.
 *
 * @param {Object} packageData — Package fields matching the backend schema
 */
export const createPackage = (packageData) =>
  axiosInstance.post(PACKAGES_URL, packageData);

/**
 * updatePackage — Updates fields of an existing package.
 * Requires Staff or Admin JWT token.
 *
 * @param {number} id          — Package ID to update
 * @param {Object} updateData  — Partial package fields to update
 */
export const updatePackage = (id, updateData) =>
  axiosInstance.patch(`${PACKAGES_URL}/${id}`, updateData);

/**
 * deletePackage — Soft-deletes a package (sets is_active = false).
 * Requires Admin JWT token.
 *
 * @param {number} id — Package ID to deactivate
 */
export const deletePackage = (id) =>
  axiosInstance.delete(`${PACKAGES_URL}/${id}`);
