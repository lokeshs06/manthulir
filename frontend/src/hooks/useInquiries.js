import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { inquiryApi } from '../api/inquiry.api';
import { produceApi } from '../api/produce.api';

export const useReceivedInquiries = (params = {}) => {
  return useQuery({
    queryKey: ['inquiriesReceived', params],
    queryFn: () => inquiryApi.getReceivedInquiries(params),
    placeholderData: keepPreviousData,
  });
};

export const useSentInquiries = (params = {}) => {
  return useQuery({
    queryKey: ['inquiriesSent', params],
    queryFn: () => inquiryApi.getSentInquiries(params),
    placeholderData: keepPreviousData,
  });
};

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, farmerResponse }) =>
      inquiryApi.updateInquiryStatus(id, { status, farmerResponse }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiriesReceived'] });
      queryClient.invalidateQueries({ queryKey: ['inquiriesSent'] });
    },
  });
};

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ produceId, data }) => produceApi.createInquiry(produceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiriesSent'] });
    },
  });
};
