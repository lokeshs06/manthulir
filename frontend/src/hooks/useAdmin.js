import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';

export const useAdminStats = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
    enabled: isAdmin,
    staleTime: 60 * 1000,
  });
};

export const useFlaggedLogs = (params = {}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['admin', 'flaggedLogs', params],
    queryFn: () => adminApi.getFlaggedLogs(params),
    enabled: isAdmin,
    staleTime: 30 * 1000,
  });
};

export const useResolveFlaggedLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolutionNote }) => adminApi.resolveFlaggedLog(id, resolutionNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flaggedLogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const usePendingCertifications = (params = {}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['admin', 'pendingCertifications', params],
    queryFn: () => adminApi.getPendingCertifications(params),
    enabled: isAdmin,
    staleTime: 30 * 1000,
  });
};

export const useReviewCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ farmerId, status, reviewNote }) =>
      adminApi.reviewCertification(farmerId, { status, reviewNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCertifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useUnverifiedSchemes = (params = {}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['admin', 'unverifiedSchemes', params],
    queryFn: () => adminApi.getUnverifiedSchemes(params),
    enabled: isAdmin,
    staleTime: 60 * 1000,
  });
};

export const useVerifyScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.verifyScheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unverifiedSchemes'] });
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
};

export const usePestFeedbackList = (params = {}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['admin', 'pestFeedback', params],
    queryFn: () => adminApi.getPestFeedback(params),
    enabled: isAdmin,
    staleTime: 60 * 1000,
  });
};
