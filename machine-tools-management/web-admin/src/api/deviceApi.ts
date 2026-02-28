import apiAxios from './axiosInstance';
import type { Device, CreateDeviceDto, UpdateDeviceDto, DeviceListFilter } from '../types/device.types';
import type { PagedResult } from '../types/common.types';

export const deviceApi = {
  getList: (params?: DeviceListFilter) =>
    apiAxios.get<PagedResult<Device>>('/api/devices', { params }).then((r) => r.data),

  get: (id: string) =>
    apiAxios.get<Device>(`/api/devices/${id}`).then((r) => r.data),

  create: (data: CreateDeviceDto) =>
    apiAxios.post<Device>('/api/devices', data).then((r) => r.data),

  update: (id: string, data: UpdateDeviceDto) =>
    apiAxios.put<Device>(`/api/devices/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiAxios.delete(`/api/devices/${id}`),

  getAvailable: (params?: DeviceListFilter) =>
    apiAxios.get<PagedResult<Device>>('/api/devices/available', { params }).then((r) => r.data),

  updateQuantity: (id: string, newQuantity: number) =>
    apiAxios.put<Device>(`/api/devices/${id}/quantity`, newQuantity).then((r) => r.data),
};
