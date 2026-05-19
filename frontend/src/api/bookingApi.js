/**
 * bookingApi.js — Booking API Service
 * --------------------------------------
 * Functions that communicate with the backend's /bookings endpoints.
 */

import axiosInstance from "./axiosInstance";

/** Fetch all bookings for the currently logged-in customer. */
export const getMyBookings = () =>
  axiosInstance.get("/bookings/my-bookings");

/** Create a new booking (customer only). */
export const createBooking = (bookingData) =>
  axiosInstance.post("/bookings", bookingData);

/** Fetch a single booking by its MongoDB ObjectId. */
export const getBookingById = (bookingId) =>
  axiosInstance.get(`/bookings/${bookingId}`);

/** Cancel a booking owned by the current customer. */
export const cancelBooking = (bookingId, cancellationReason = "") =>
  axiosInstance.patch(`/bookings/${bookingId}/cancel`, { cancellationReason });

/** Update a booking's status — staff/admin only. */
export const updateBookingStatus = (bookingId, statusData) =>
  axiosInstance.patch(`/bookings/${bookingId}/status`, statusData);

/** Fetch all bookings across all customers — staff/admin only. */
export const getAllBookings = (params = {}) =>
  axiosInstance.get("/bookings", { params });
