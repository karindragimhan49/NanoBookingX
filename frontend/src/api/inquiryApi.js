import axiosInstance from './axiosInstance';

export const inquiryApi = {
  create: (data) => axiosInstance.post('/inquiries', data).then(r => r.data),
  getMyInquiries: () => axiosInstance.get('/inquiries/my-inquiries').then(r => r.data),
  getAll: (params) => axiosInstance.get('/inquiries', { params }).then(r => r.data),
  update: (id, data) => axiosInstance.patch(`/inquiries/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/inquiries/${id}`).then(r => r.data),
};
