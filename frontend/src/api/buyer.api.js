import { apiClient } from './client';

export const buyerApi = {
  getMyProfile: async () => {
    const res = await apiClient.get('/buyers/me');
    return res.data;
  },

  updateMyProfile: async (data) => {
    const res = await apiClient.put('/buyers/me', data);
    return res.data;
  },
};
