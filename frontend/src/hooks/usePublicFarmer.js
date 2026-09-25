import { useQuery } from '@tanstack/react-query';
import { farmerApi } from '../api/farmer.api';
import { verificationApi } from '../api/verification.api';

export const usePublicFarmer = (farmerId) => {
  return useQuery({
    queryKey: ['publicFarmer', farmerId],
    queryFn: () => farmerApi.getPublicProfile(farmerId),
    enabled: Boolean(farmerId),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicFarmerLogs = (farmerId, params = {}) => {
  return useQuery({
    queryKey: ['publicFarmerLogs', farmerId, params],
    queryFn: () => verificationApi.getFarmerLogs(farmerId, params),
    enabled: Boolean(farmerId),
    staleTime: 2 * 60 * 1000,
  });
};
