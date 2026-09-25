import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pestApi } from '../api/pest.api';
import { useTranslation } from 'react-i18next';

export const useDetectPest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => pestApi.detectPest(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pestDetections'] });
    },
  });
};

export const useMyDetections = ({ page = 1, limit = 10 } = {}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ta' ? 'ta' : 'en';

  return useQuery({
    queryKey: ['pestDetections', { page, limit, lang }],
    queryFn: () => pestApi.getMyDetections({ page, limit, lang }),
    keepPreviousData: true,
  });
};

export const useSubmitPestFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedbackData }) => pestApi.submitFeedback(id, feedbackData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pestDetections'] });
    },
  });
};

export const useRemedies = (filters = {}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ta' ? 'ta' : 'en';

  return useQuery({
    queryKey: ['pestRemedies', { ...filters, lang }],
    queryFn: () => pestApi.getRemedies({ ...filters, lang }),
  });
};

export const useRemedy = (id) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ta' ? 'ta' : 'en';

  return useQuery({
    queryKey: ['pestRemedy', id, lang],
    queryFn: () => pestApi.getRemedy(id, { lang }),
    enabled: Boolean(id),
  });
};
