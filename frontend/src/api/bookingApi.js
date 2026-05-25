import axiosInstance from './axiosInstance';

export const bookingApi = {
  create: (data) => axiosInstance.post('/bookings', data).then(r => r.data),
  getMyBookings: () => axiosInstance.get('/bookings/my-bookings').then(r => r.data),
  getAll: (params) => axiosInstance.get('/bookings', { params }).then(r => r.data),
  updateStatus: (id, status) => axiosInstance.patch(`/bookings/${id}/status`, { status }).then(r => r.data),
  cancel: (id) => axiosInstance.patch(`/bookings/${id}/cancel`).then(r => r.data),
};
