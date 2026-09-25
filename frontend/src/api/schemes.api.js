import { apiClient } from './client';

export const schemesApi = {
  getSchemes: async (params = {}) => {
    const res = await apiClient.get('/schemes', { params });
    return res.data; // { success: true, data: schemes[], meta: { pagination } }
  },

  getScheme: async (id) => {
    const res = await apiClient.get(`/schemes/${id}`);
    return res.data; // { success: true, data: scheme }
  },

  matchSchemes: async (params = {}) => {
    const res = await apiClient.get('/schemes/match', { params });
    return res.data; // { success: true, data: { eligible: [], nearMatches: [] } }
  },
};
