import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerApi } from '../api/farmer.api';
import { useAuth } from './useAuth';

export const useFarmerProfile = () => {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: async () => {
      const res = await farmerApi.getProfile();
      return res.data;
    },
    enabled: isAuthenticated && user?.role === 'farmer',
  });
};

export const useUpdateFarmerProfile = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useAuth();

  return useMutation({
    mutationFn: async (data) => {
      const res = await farmerApi.updateProfile(data);
      return res.data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['farmer', 'profile'], updatedProfile);
      setProfile(updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['farmer'] });
      queryClient.invalidateQueries({ queryKey: ['schemes', 'match'] });
    },
  });
};

export const useTimeline = () => {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: ['farmer', 'timeline'],
    queryFn: async () => {
      const res = await farmerApi.getTimeline();
      return res.data; // milestones array
    },
    enabled: isAuthenticated && user?.role === 'farmer',
  });
};

export const useStartTransition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transitionStartDate) => {
      const res = await farmerApi.startTransition(transitionStartDate);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer', 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['farmer', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['schemes', 'match'] });
    },
  });
};

export const useSaveScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schemeId) => {
      const res = await farmerApi.saveScheme(schemeId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer'] });
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
};

export const useUnsaveScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schemeId) => {
      const res = await farmerApi.unsaveScheme(schemeId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer'] });
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
};

export const useApplyScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schemeId) => {
      const res = await farmerApi.applyScheme(schemeId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer'] });
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
};

export const useUpdateSchemeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ schemeId, status, notes }) => {
      const res = await farmerApi.updateSchemeStatus(schemeId, status, notes);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer'] });
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
};
