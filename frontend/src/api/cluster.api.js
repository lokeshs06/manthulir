import { apiClient } from './client';

export const clusterApi = {
  getClusters: async (params = {}) => {
    const res = await apiClient.get('/clusters', { params });
    return res.data;
  },

  getClusterById: async (id) => {
    const res = await apiClient.get(`/clusters/${id}`);
    return res.data;
  },

  createCluster: async (data) => {
    const res = await apiClient.post('/clusters', data);
    return res.data;
  },

  joinCluster: async (id) => {
    const res = await apiClient.post(`/clusters/${id}/join`);
    return res.data;
  },

  decideJoinRequest: async (clusterId, farmerId, { status }) => {
    const res = await apiClient.patch(`/clusters/${clusterId}/requests/${farmerId}`, { status });
    return res.data;
  },

  leaveCluster: async (clusterId, data = {}) => {
    const res = await apiClient.delete(`/clusters/${clusterId}/members/me`, { data });
    return res.data;
  },

  getSchemeEligibility: async (clusterId) => {
    const res = await apiClient.get(`/clusters/${clusterId}/scheme-eligibility`);
    return res.data;
  },

  createPooledListing: async (clusterId, data) => {
    const res = await apiClient.post(`/clusters/${clusterId}/produce`, data);
    return res.data;
  },
};
