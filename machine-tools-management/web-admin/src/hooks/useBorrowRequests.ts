import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowRequestApi } from '../api/borrowRequestApi';
import type {
  BorrowRequestListFilter,
  CreateBorrowRequestDto,
  ApproveBorrowRequestDto,
  RejectBorrowRequestDto,
} from '../types/borrowRequest.types';
import type { PagedRequest } from '../types/common.types';
import { message } from 'antd';

export const useBorrowRequests = (filter?: BorrowRequestListFilter) =>
  useQuery({
    queryKey: ['borrow-requests', filter],
    queryFn: () => borrowRequestApi.getList(filter),
  });

export const useBorrowRequest = (id: string) =>
  useQuery({
    queryKey: ['borrow-requests', id],
    queryFn: () => borrowRequestApi.get(id),
    enabled: !!id,
  });

export const usePendingBorrowRequests = (params?: PagedRequest) =>
  useQuery({
    queryKey: ['borrow-requests', 'pending', params],
    queryFn: () => borrowRequestApi.getPending(params),
  });

export const useOverdueBorrowRequests = (params?: PagedRequest) =>
  useQuery({
    queryKey: ['borrow-requests', 'overdue', params],
    queryFn: () => borrowRequestApi.getOverdue(params),
  });

export const useCreateBorrowRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBorrowRequestDto) => borrowRequestApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['borrow-requests'] });
      message.success('Tạo yêu cầu mượn thành công');
    },
    onError: () => message.error('Không thể tạo yêu cầu mượn'),
  });
};

export const useApproveBorrowRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveBorrowRequestDto }) =>
      borrowRequestApi.approve(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['borrow-requests'] });
      qc.invalidateQueries({ queryKey: ['devices'] });
      message.success('Đã duyệt yêu cầu mượn');
    },
    onError: () => message.error('Không thể duyệt yêu cầu'),
  });
};

export const useRejectBorrowRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectBorrowRequestDto }) =>
      borrowRequestApi.reject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['borrow-requests'] });
      message.success('Đã từ chối yêu cầu mượn');
    },
    onError: () => message.error('Không thể từ chối yêu cầu'),
  });
};
