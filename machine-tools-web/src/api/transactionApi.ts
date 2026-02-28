import apiAxios from './axiosInstance';
import type { DeviceTransaction, TransactionFilter } from '../types/transaction.types';
import type { PagedResult, PagedRequest } from '../types/common.types';

export const transactionApi = {
  getList: (params?: TransactionFilter) =>
    apiAxios.get<PagedResult<DeviceTransaction>>('/api/transactions', { params }).then((r) => r.data),

  getByDevice: (deviceId: string, params?: PagedRequest) =>
    apiAxios.get<PagedResult<DeviceTransaction>>(`/api/transactions/device/${deviceId}`, { params }).then((r) => r.data),

  getByEmployee: (employeeId: string, params?: PagedRequest) =>
    apiAxios.get<PagedResult<DeviceTransaction>>(`/api/transactions/employee/${employeeId}`, { params }).then((r) => r.data),

  getMyList: (params?: PagedRequest) =>
    apiAxios.get<PagedResult<DeviceTransaction>>('/api/transactions/my', { params }).then((r) => r.data),
};
