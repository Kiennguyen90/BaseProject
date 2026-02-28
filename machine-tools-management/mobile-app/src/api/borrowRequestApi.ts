import apiAxios from './axiosInstance';
import type {
  BorrowRequest,
  CreateBorrowRequestDto,
  ApproveBorrowRequestDto,
  RejectBorrowRequestDto,
  BorrowRequestListFilter,
} from '../types/borrowRequest.types';
import type { PagedResult, PagedRequest } from '../types/common.types';

export const borrowRequestApi = {
  getList: (params?: BorrowRequestListFilter) =>
    apiAxios.get<PagedResult<BorrowRequest>>('/api/borrow-requests', { params }).then((r) => r.data),

  getMyList: (params?: PagedRequest) =>
    apiAxios.get<PagedResult<BorrowRequest>>('/api/borrow-requests/my', { params }).then((r) => r.data),

  get: (id: string) =>
    apiAxios.get<BorrowRequest>(`/api/borrow-requests/${id}`).then((r) => r.data),

  create: (data: CreateBorrowRequestDto) =>
    apiAxios.post<BorrowRequest>('/api/borrow-requests', data).then((r) => r.data),

  approve: (id: string, data: ApproveBorrowRequestDto) =>
    apiAxios.put<BorrowRequest>(`/api/borrow-requests/${id}/approve`, data).then((r) => r.data),

  reject: (id: string, data: RejectBorrowRequestDto) =>
    apiAxios.put<BorrowRequest>(`/api/borrow-requests/${id}/reject`, data).then((r) => r.data),

  getPending: (params?: PagedRequest) =>
    apiAxios.get<PagedResult<BorrowRequest>>('/api/borrow-requests/pending', { params }).then((r) => r.data),

  getOverdue: (params?: PagedRequest) =>
    apiAxios.get<PagedResult<BorrowRequest>>('/api/borrow-requests/overdue', { params }).then((r) => r.data),
};
