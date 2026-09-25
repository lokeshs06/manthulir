import { useQuery } from '@tanstack/react-query';
import { schemesApi } from '../api/schemes.api';
import { useAuth } from './useAuth';

export const useSchemes = (filters = {}) => {
  return useQuery({
    queryKey: ['schemes', filters],
    queryFn: async () => {
      const res = await schemesApi.getSchemes(filters);
      return res; // { success: true, data: schemes[], meta: { pagination } }
    },
  });
};

export const useScheme = (id) => {
  return useQuery({
    queryKey: ['scheme', id],
    queryFn: async () => {
      const res = await schemesApi.getScheme(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
};

export const useMatchedSchemes = (params = {}) => {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: ['schemes', 'match', params, isAuthenticated ? user?._id : 'anon'],
    queryFn: async () => {
      const res = await schemesApi.matchSchemes(params);
      return res.data; // { eligible: [], nearMatches: [] }
    },
  });
};
