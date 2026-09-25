import { apiClient } from './client';

export const authApi = {
  login: async ({ phone, password }) => {
    const res = await apiClient.post('/auth/login', { phone, password });
    return res.data; // { success: true, data: { user, accessToken, refreshToken } }
  },

  register: async ({ name, phone, password, role, preferredLanguage }) => {
    const res = await apiClient.post('/auth/register', {
      name,
      phone,
      password,
      role,
      preferredLanguage: preferredLanguage || 'ta',
    });
    return res.data;
  },

  refresh: async (refreshToken) => {
    const res = await apiClient.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  logout: async (refreshToken) => {
    try {
      const res = await apiClient.post('/auth/logout', { refreshToken });
      return res.data;
    } catch {
      return { success: true };
    }
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data; // { success: true, data: { user, profile } }
  },
};
