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
  axiosInstance.get("/tours", { params });

/**
 * getTourById — Fetches a single tour's full details including guides and reviews.
 *
 * @param {string} tourId - MongoDB ObjectId of the tour
 * @returns {Promise} Axios response with a single tour object
 */
export const getTourById = (tourId) =>
  axiosInstance.get(`/tours/${tourId}`);

/**
 * createTour — Creates a new tour package (admin only).
 *
 * @param {Object} tourData - The tour object matching the Tour schema
 * @returns {Promise} Axios response with the newly created tour
 */
export const createTour = (tourData) =>
  axiosInstance.post("/tours", tourData);

/**
 * updateTour — Updates specific fields of a tour package (admin only).
 *
 * @param {string} tourId   - MongoDB ObjectId of the tour to update
 * @param {Object} tourData - Partial tour object with updated fields
 * @returns {Promise} Axios response with the updated tour
 */
export const updateTour = (tourId, tourData) =>
  axiosInstance.patch(`/tours/${tourId}`, tourData);

/**
 * deleteTour — Soft-deletes a tour by setting isActive to false (admin only).
 *
 * @param {string} tourId - MongoDB ObjectId of the tour to deactivate
 * @returns {Promise} Axios response confirming deactivation
 */
export const deleteTour = (tourId) =>
  axiosInstance.delete(`/tours/${tourId}`);
