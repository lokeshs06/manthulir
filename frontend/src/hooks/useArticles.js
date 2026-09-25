import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi } from '../api/article.api';

export const useArticles = (params = {}) => {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articleApi.getArticles(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useArticle = (slug) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => articleApi.getArticleBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => articleApi.createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => articleApi.updateArticle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => articleApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};
