import { apiClient } from './client';

export const adminApi = {
  // Stats
  getStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  // Flagged Verification Logs
  getFlaggedLogs: async (params = {}) => {
    const res = await apiClient.get('/admin/flagged-logs', { params });
    return res.data;
  },

  resolveFlaggedLog: async (id, resolutionNote = '') => {
    const res = await apiClient.patch(`/admin/flagged-logs/${id}`, { resolutionNote });
    return res.data;
  },

  // Certifications Review
  getPendingCertifications: async (params = {}) => {
    const res = await apiClient.get('/admin/certifications/pending', { params });
    return res.data;
  },

  reviewCertification: async (farmerId, { status, reviewNote = '' }) => {
    const res = await apiClient.patch(`/admin/certifications/${farmerId}`, {
      status,
      reviewNote,
    });
    return res.data;
  },

  // Schemes Review & Verification
  getUnverifiedSchemes: async (params = {}) => {
    const res = await apiClient.get('/admin/schemes/unverified', { params });
    return res.data;
  },

  verifyScheme: async (id) => {
    const res = await apiClient.patch(`/schemes/${id}/verify`);
    return res.data;
  },

  createScheme: async (data) => {
    const res = await apiClient.post('/schemes', data);
    return res.data;
  },

  updateScheme: async (id, data) => {
    const res = await apiClient.put(`/schemes/${id}`, data);
    return res.data;
  },

  deleteScheme: async (id) => {
    const res = await apiClient.delete(`/schemes/${id}`);
    return res.data;
  },

  // Pest Feedback
  getPestFeedback: async (params = {}) => {
    const res = await apiClient.get('/admin/pest-feedback', { params });
    return res.data;
  },

  // Pest Remedies
  getRemedies: async (params = {}) => {
    const res = await apiClient.get('/pests/remedies', { params });
    return res.data;
  },

  createRemedy: async (data) => {
    const res = await apiClient.post('/pests/remedies', data);
    return res.data;
  },

  updateRemedy: async (id, data) => {
    const res = await apiClient.put(`/pests/remedies/${id}`, data);
    return res.data;
  },

  deleteRemedy: async (id) => {
    const res = await apiClient.delete(`/pests/remedies/${id}`);
    return res.data;
  },
};
