import { apiClient } from './client';

export const farmerApi = {
  // Profile
  getProfile: async () => {
    const res = await apiClient.get('/farmers/me');
    return res.data; // { success: true, data: profile }
  },

  updateProfile: async (data) => {
    const res = await apiClient.put('/farmers/me', data);
    return res.data;
  },

  // Public Trust Profile
  getPublicProfile: async (id) => {
    const res = await apiClient.get(`/farmers/${id}/public`);
    return res.data;
  },

  // Transition timeline
  getTimeline: async () => {
    const res = await apiClient.get('/farmers/me/timeline');
    return res.data; // { success: true, data: milestones[] }
  },

  startTransition: async (transitionStartDate) => {
    const res = await apiClient.post('/farmers/me/transition/start', {
      transitionStartDate,
    });
    return res.data;
  },

  // Schemes saved & applied
  saveScheme: async (schemeId) => {
    const res = await apiClient.post(`/farmers/me/schemes/${schemeId}/save`);
    return res.data;
  },

  unsaveScheme: async (schemeId) => {
    const res = await apiClient.delete(`/farmers/me/schemes/${schemeId}/save`);
    return res.data;
  },

  applyScheme: async (schemeId) => {
    const res = await apiClient.post(`/farmers/me/schemes/${schemeId}/apply`);
    return res.data;
  },

  updateSchemeStatus: async (schemeId, status, notes) => {
    const res = await apiClient.patch(`/farmers/me/schemes/${schemeId}/status`, {
      status,
      notes,
    });
    return res.data;
  },
};
