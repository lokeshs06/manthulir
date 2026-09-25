import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buyerApi } from '../api/buyer.api';
import { useAuth } from '../context/AuthContext';

export const useBuyerProfile = () => {
  const { user } = useAuth();
  const isBuyer = user?.role === 'buyer';

  return useQuery({
    queryKey: ['buyer', 'me'],
    queryFn: () => buyerApi.getMyProfile(),
    enabled: isBuyer,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateBuyerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => buyerApi.updateMyProfile(data),
    onSuccess: (res) => {
      queryClient.setQueryData(['buyer', 'me'], res);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};
