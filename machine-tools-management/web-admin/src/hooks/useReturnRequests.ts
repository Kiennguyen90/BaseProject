import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnRequestApi } from '../api/returnRequestApi';
import type {
  ReturnRequestListFilter,
  CreateReturnRequestDto,
  ConfirmReturnDto,
  RejectReturnDto,
} from '../types/returnRequest.types';
import { message } from 'antd';

export const useReturnRequests = (filter?: ReturnRequestListFilter) =>
  useQuery({
    queryKey: ['return-requests', filter],
    queryFn: () => returnRequestApi.getList(filter),
  });

export const useReturnRequest = (id: string) =>
  useQuery({
    queryKey: ['return-requests', id],
    queryFn: () => returnRequestApi.get(id),
    enabled: !!id,
  });

export const useCreateReturnRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnRequestDto) => returnRequestApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['return-requests'] });
      message.success('Tạo yêu cầu trả thành công');
    },
    onError: () => message.error('Không thể tạo yêu cầu trả'),
  });
};

export const useConfirmReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfirmReturnDto }) =>
      returnRequestApi.confirm(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['return-requests'] });
      qc.invalidateQueries({ queryKey: ['borrow-requests'] });
      qc.invalidateQueries({ queryKey: ['devices'] });
      message.success('Đã xác nhận trả thiết bị');
    },
    onError: () => message.error('Không thể xác nhận trả'),
  });
};

export const useRejectReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectReturnDto }) =>
      returnRequestApi.reject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['return-requests'] });
      message.success('Đã từ chối yêu cầu trả');
    },
    onError: () => message.error('Không thể từ chối yêu cầu'),
  });
};
