import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { produceApi } from '../api/produce.api';
import { useTranslation } from 'react-i18next';

export const useProduceList = (filters = {}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ta' ? 'ta' : 'en';

  return useQuery({
    queryKey: ['produce', filters, lang],
    queryFn: () => produceApi.getProduce({ ...filters, lang }),
    placeholderData: keepPreviousData,
  });
};

export const useProduceDetail = (id) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ta' ? 'ta' : 'en';

  return useQuery({
    queryKey: ['produceDetail', id, lang],
    queryFn: () => produceApi.getProduceById(id),
    enabled: Boolean(id),
  });
};

export const useCreateProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => produceApi.createProduce(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce'] });
    },
  });
};

export const useUpdateProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => produceApi.updateProduce(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['produce'] });
      queryClient.invalidateQueries({ queryKey: ['produceDetail', id] });
    },
  });
};

export const useDeleteProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => produceApi.deleteProduce(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce'] });
    },
  });
};
