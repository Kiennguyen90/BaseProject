import apiAxios from './axiosInstance';
import type {
  ReturnRequest,
  CreateReturnRequestDto,
  ConfirmReturnDto,
  RejectReturnDto,
  ReturnRequestListFilter,
} from '../types/returnRequest.types';
import type { PagedResult, PagedRequest } from '../types/common.types';

export const returnRequestApi = {
  getList: (params?: ReturnRequestListFilter) =>
    apiAxios.get<PagedResult<ReturnRequest>>('/api/return-requests', { params }).then((r) => r.data),

  getMyList: (params?: PagedRequest) =>
    apiAxios.get<PagedResult<ReturnRequest>>('/api/return-requests/my', { params }).then((r) => r.data),

  get: (id: string) =>
    apiAxios.get<ReturnRequest>(`/api/return-requests/${id}`).then((r) => r.data),

  create: (data: CreateReturnRequestDto) =>
    apiAxios.post<ReturnRequest>('/api/return-requests', data).then((r) => r.data),

  confirm: (id: string, data: ConfirmReturnDto) =>
    apiAxios.put<ReturnRequest>(`/api/return-requests/${id}/confirm`, data).then((r) => r.data),

  reject: (id: string, data: RejectReturnDto) =>
    apiAxios.put<ReturnRequest>(`/api/return-requests/${id}/reject`, data).then((r) => r.data),
};
