import { apiClient } from './client';

export const pestApi = {
  /**
   * Upload crop/pest photo for AI detection and organic remedies
   * @param {FormData} formData - Contains 'image' file and 'consentForTraining' ('true'|'false')
   */
  detectPest: async (formData) => {
    const res = await apiClient.post('/pests/detect', formData);
    return res.data;
  },

  /**
   * Get paginated detection history for current farmer
   */
  getMyDetections: async (params = {}) => {
    const res = await apiClient.get('/pests/detections', { params });
    return res.data;
  },

  /**
   * Submit accuracy feedback on a detection
   * @param {string} id - Detection ID
   * @param {Object} data - { farmerFeedback: 'correct' | 'incorrect' | 'unsure', feedbackNote?: string }
   */
  submitFeedback: async (id, data) => {
    const res = await apiClient.post(`/pests/detections/${id}/feedback`, data);
    return res.data;
  },

  /**
   * Browse organic pest & disease remedies
   */
  getRemedies: async (params = {}) => {
    const res = await apiClient.get('/pests/remedies', { params });
    return res.data;
  },

  /**
   * Get single remedy details
   */
  getRemedy: async (id, params = {}) => {
    const res = await apiClient.get(`/pests/remedies/${id}`, { params });
    return res.data;
  },
};
