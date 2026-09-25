import { apiClient } from './client';

export const inquiryApi = {
  getReceivedInquiries: async (params = {}) => {
    const res = await apiClient.get('/inquiries/received', { params });
    return res.data;
  },

  getSentInquiries: async (params = {}) => {
    const res = await apiClient.get('/inquiries/sent', { params });
    return res.data;
  },

  updateInquiryStatus: async (id, { status, farmerResponse }) => {
    const res = await apiClient.patch(`/inquiries/${id}`, { status, farmerResponse });
    return res.data;
  },
};
