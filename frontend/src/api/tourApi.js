/**
 * tourApi.js — Tour Package API Service
 * ----------------------------------------
 * Functions that communicate with the backend's /tours endpoints.
 */

import axiosInstance from "./axiosInstance";

/**
 * getAllTours — Fetches all active tour packages with optional filters.
 *
 * @param {Object} params - Optional query params (e.g., { difficulty: 'easy', maxPrice: 200 })
 * @returns {Promise} Axios response with array of tour objects
 */
export const getAllTours = (params = {}) =>
  axiosInstance.get("/packages", { params });

/**
 * getTourById — Fetches a single package's full details.
 *
 * @param {string} tourId - MongoDB ObjectId of the package
 * @returns {Promise} Axios response with a single package object
 */
export const getTourById = (tourId) =>
  axiosInstance.get(`/packages/${tourId}`);

/**
 * createTour — Creates a new travel package (staff/admin only).
 *
 * @param {Object} tourData - The package object matching the TravelPackage schema
 * @returns {Promise} Axios response with the newly created package
 */
export const createTour = (tourData) =>
  axiosInstance.post("/packages", tourData);

/**
 * updateTour — Updates specific fields of a travel package (staff/admin only).
 *
 * @param {string} tourId   - MongoDB ObjectId of the package to update
 * @param {Object} tourData - Partial package object with updated fields
 * @returns {Promise} Axios response with the updated package
 */
export const updateTour = (tourId, tourData) =>
  axiosInstance.patch(`/packages/${tourId}`, tourData);

/**
 * deleteTour — Soft-deletes a package by setting isActive to false (admin only).
 *
 * @param {string} tourId - MongoDB ObjectId of the package to deactivate
 * @returns {Promise} Axios response confirming deactivation
 */
export const deleteTour = (tourId) =>
  axiosInstance.delete(`/packages/${tourId}`);
