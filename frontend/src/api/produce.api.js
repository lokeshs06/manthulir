import { apiClient } from './client';

export const produceApi = {
  getProduce: async (params = {}) => {
    const res = await apiClient.get('/produce', { params });
    return res.data;
  },

  getProduceById: async (id) => {
    const res = await apiClient.get(`/produce/${id}`);
    return res.data;
  },

  createProduce: async (data) => {
    const res = await apiClient.post('/produce', data);
    return res.data;
  },

  updateProduce: async (id, data) => {
    const res = await apiClient.put(`/produce/${id}`, data);
    return res.data;
  },

  deleteProduce: async (id) => {
    const res = await apiClient.delete(`/produce/${id}`);
    return res.data;
  },

  createInquiry: async (produceId, data) => {
    const res = await apiClient.post(`/produce/${produceId}/inquiries`, data);
    return res.data;
  },
};
