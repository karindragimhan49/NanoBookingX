/**
 * inquiryApi.js — Customer Inquiry API Service
 * -----------------------------------------------
 * Functions that communicate with the backend's /inquiries endpoints.
 */

import axiosInstance from "./axiosInstance";

/**
 * submitInquiry — Submit a new inquiry from any visitor.
 * The backend accepts both anonymous and authenticated submissions.
 *
 * @param {Object} data - { senderName, senderEmail, senderPhone?, subject, message, travelPackageId? }
 */
export const submitInquiry = (data) =>
  axiosInstance.post("/inquiries", data);

/** Get all inquiries submitted by the currently logged-in customer. */
export const getMyInquiries = () =>
  axiosInstance.get("/inquiries/my-inquiries");

/** Get full details of a single inquiry. */
export const getInquiryById = (inquiryId) =>
  axiosInstance.get(`/inquiries/${inquiryId}`);

/** Get all inquiries system-wide — staff & admin only. */
export const getAllInquiries = (params = {}) =>
  axiosInstance.get("/inquiries", { params });

/** Submit a staff response to an inquiry — staff & admin only. */
export const respondToInquiry = (inquiryId, data) =>
  axiosInstance.patch(`/inquiries/${inquiryId}/respond`, data);

/** Update inquiry status/priority — staff & admin only. */
export const updateInquiryStatus = (inquiryId, data) =>
  axiosInstance.patch(`/inquiries/${inquiryId}/status`, data);
