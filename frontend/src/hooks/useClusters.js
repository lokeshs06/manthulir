import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clusterApi } from '../api/cluster.api';

export const useClustersList = (filters = {}) => {
  return useQuery({
    queryKey: ['clusters', filters],
    queryFn: () => clusterApi.getClusters(filters),
    keepPreviousData: true,
  });
};

export const useClusterDetail = (id) => {
  return useQuery({
    queryKey: ['clusterDetail', id],
    queryFn: () => clusterApi.getClusterById(id),
    enabled: Boolean(id),
  });
};

export const useCreateCluster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => clusterApi.createCluster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
};

export const useJoinCluster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clusterId) => clusterApi.joinCluster(clusterId),
    onSuccess: (_, clusterId) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusterDetail', clusterId] });
    },
  });
};

export const useDecideJoinRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clusterId, farmerId, status }) =>
      clusterApi.decideJoinRequest(clusterId, farmerId, { status }),
    onSuccess: (_, { clusterId }) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusterDetail', clusterId] });
    },
  });
};

export const useLeaveCluster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clusterId, transferLeadTo }) =>
      clusterApi.leaveCluster(clusterId, transferLeadTo ? { transferLeadTo } : {}),
    onSuccess: (_, { clusterId }) => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['clusterDetail', clusterId] });
    },
  });
};

export const useClusterSchemeEligibility = (clusterId) => {
  return useQuery({
    queryKey: ['clusterSchemes', clusterId],
    queryFn: () => clusterApi.getSchemeEligibility(clusterId),
    enabled: Boolean(clusterId),
  });
};

export const useCreatePooledListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clusterId, data }) => clusterApi.createPooledListing(clusterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce'] });
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
};
