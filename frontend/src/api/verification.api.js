import { apiClient } from './client';

export const verificationApi = {
  // Create a log entry with compressed photos (multipart/form-data)
  createLog: async (formData) => {
    const res = await apiClient.post('/verification-logs', formData);
    return res.data;
  },

  // Get current farmer's own logs
  getMyLogs: async (params = {}) => {
    const res = await apiClient.get('/verification-logs/me', { params });
    return res.data; // { success: true, data: logs[], meta: { pagination } }
  },

  // Get public logs for a specific farmer
  getFarmerLogs: async (farmerId, params = {}) => {
    const res = await apiClient.get(`/verification-logs/farmer/${farmerId}`, { params });
    return res.data;
  },

  // Peer-verify a cluster member's log
  peerVerify: async (logId, comment = '') => {
    const res = await apiClient.post(`/verification-logs/${logId}/verify`, { comment });
    return res.data;
  },

  // Flag a suspicious log
  flagLog: async (logId, flagReason) => {
    const res = await apiClient.post(`/verification-logs/${logId}/flag`, { flagReason });
    return res.data;
  },

  // Upload certification document (multipart/form-data)
  uploadCertification: async (formData) => {
    const res = await apiClient.post('/farmers/me/certification', formData);
    return res.data;
  },
};
