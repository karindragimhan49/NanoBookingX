/**
 * axiosInstance.js — Pre-configured Axios HTTP Client
 * ------------------------------------------------------
 * Creates a shared Axios instance with the base URL set to /api.
 * The Vite dev proxy forwards /api/* to http://localhost:5000.
 *
 * Includes a request interceptor that automatically attaches the
 * JWT token to every outgoing request's Authorization header.
 */

import axios from "axios";

// Create the Axios instance with a shared base URL and timeout
const axiosInstance = axios.create({
  baseURL: "/api", // Relative URL — Vite proxy handles the full URL in development
  timeout: 15000,  // 15-second timeout before a request is considered failed
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- REQUEST INTERCEPTOR ----
// Runs before every outgoing request. If a JWT token exists in
// localStorage, it's attached to the Authorization header automatically.
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the token stored after a successful login
    const token = localStorage.getItem("globetrek_token");

    if (token) {
      // Attach the token in the "Bearer <token>" format expected by the backend
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If the request itself fails to send, reject the promise
    return Promise.reject(error);
  }
);

// ---- RESPONSE INTERCEPTOR ----
// Runs after every response. Handles common errors like 401 Unauthorized
// by clearing stale auth data and redirecting the user to login.
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses through unchanged

  (error) => {
    // If the server returns 401 (token expired or invalid), force logout
    if (error.response?.status === 401) {
      localStorage.removeItem("globetrek_token");
      localStorage.removeItem("globetrek_user");
      // Redirect to the login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
