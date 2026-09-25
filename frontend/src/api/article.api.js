import { apiClient } from './client';

export const articleApi = {
  getArticles: async (params = {}) => {
    const res = await apiClient.get('/articles', { params });
    return res.data;
  },

  getArticleBySlug: async (slug) => {
    const res = await apiClient.get(`/articles/${slug}`);
    return res.data;
  },

  createArticle: async (data) => {
    const res = await apiClient.post('/articles', data);
    return res.data;
  },

  updateArticle: async (id, data) => {
    const res = await apiClient.put(`/articles/${id}`, data);
    return res.data;
  },

  deleteArticle: async (id) => {
    const res = await apiClient.delete(`/articles/${id}`);
    return res.data;
  },
};
