/**
 * authApi.js — Authentication API Service
 * ------------------------------------------
 * Contains all functions that communicate with the backend's /auth endpoints.
 * Each function returns the Axios promise so the caller can handle the response.
 */

import axiosInstance from "./axiosInstance";

/**
 * registerUser — Sends a POST request to register a new user account.
 *
 * @param {Object} userData - { fullName, email, password, phoneNumber }
 * @returns {Promise} Axios response containing token and user data
 */
export const registerUser = (userData) =>
  axiosInstance.post("/auth/register", userData);

/**
 * loginUser — Sends a POST request with credentials to receive a JWT.
 *
 * @param {Object} credentials - { email, password }
 * @returns {Promise} Axios response containing token and user data
 */
export const loginUser = (credentials) =>
  axiosInstance.post("/auth/login", credentials);

/**
 * getMyProfile — Fetches the currently authenticated user's profile.
 * The JWT is automatically attached by the Axios request interceptor.
 *
 * @returns {Promise} Axios response containing the user document
 */
export const getMyProfile = () => axiosInstance.get("/auth/me");

/**
 * updateMyProfile — Partially updates the authenticated user's profile.
 * Only whitelisted fields (fullName, phoneNumber, country, profilePicture) are accepted.
 *
 * @param {Object} profileData - Partial user object with fields to update
 * @returns {Promise} Axios response with the updated user document
 */
export const updateMyProfile = (profileData) =>
  axiosInstance.patch("/auth/profile", profileData);

/**
 * changePassword — Verifies the current password and sets a new one.
 *
 * @param {Object} passwords - { currentPassword, newPassword }
 * @returns {Promise} Axios response with a fresh JWT token
 */
export const changePassword = (passwords) =>
  axiosInstance.patch("/auth/change-password", passwords);
