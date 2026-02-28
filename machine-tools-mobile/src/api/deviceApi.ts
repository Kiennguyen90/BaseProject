import apiAxios from './axiosInstance';
import type { Device, DeviceListFilter } from '../types/device.types';
import type { PagedResult } from '../types/common.types';

export const deviceApi = {
  getList: (params?: DeviceListFilter) =>
    apiAxios.get<PagedResult<Device>>('/api/devices', { params }).then((r) => r.data),

  get: (id: string) =>
    apiAxios.get<Device>(`/api/devices/${id}`).then((r) => r.data),

  getAvailable: (params?: DeviceListFilter) =>
    apiAxios.get<PagedResult<Device>>('/api/devices/available', { params }).then((r) => r.data),
};
