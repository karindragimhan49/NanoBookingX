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
