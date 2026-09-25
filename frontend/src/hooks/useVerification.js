import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi } from '../api/verification.api';
import { useAuth } from './useAuth';

export const useMyVerificationLogs = (params = {}) => {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: ['verification-logs', 'me', params],
    queryFn: async () => {
      const res = await verificationApi.getMyLogs(params);
      return res; // { success: true, data: logs[], meta: { pagination } }
    },
    enabled: isAuthenticated && user?.role === 'farmer',
  });
};

export const useFarmerVerificationLogs = (farmerId, params = {}) => {
  return useQuery({
    queryKey: ['verification-logs', 'farmer', farmerId, params],
    queryFn: async () => {
      const res = await verificationApi.getFarmerLogs(farmerId, params);
      return res;
    },
    enabled: Boolean(farmerId),
  });
};

export const useCreateVerificationLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await verificationApi.createLog(formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-logs'] });
      queryClient.invalidateQueries({ queryKey: ['farmer', 'profile'] });
    },
  });
};

export const usePeerVerifyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ logId, comment }) => {
      const res = await verificationApi.peerVerify(logId, comment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-logs'] });
      queryClient.invalidateQueries({ queryKey: ['farmer', 'profile'] });
    },
  });
};

export const useFlagLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ logId, flagReason }) => {
      const res = await verificationApi.flagLog(logId, flagReason);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-logs'] });
    },
  });
};

export const useUploadCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await verificationApi.uploadCertification(formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer', 'profile'] });
    },
  });
};
