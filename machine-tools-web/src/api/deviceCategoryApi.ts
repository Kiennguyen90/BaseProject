import apiAxios from './axiosInstance';
import type {
  DeviceCategory,
  CreateDeviceCategoryDto,
  UpdateDeviceCategoryDto,
} from '../types/device.types';
import type { ListResult } from '../types/common.types';

export const deviceCategoryApi = {
  getList: () =>
    apiAxios.get<ListResult<DeviceCategory>>('/api/device-categories').then((r) => r.data),

  get: (id: string) =>
    apiAxios.get<DeviceCategory>(`/api/device-categories/${id}`).then((r) => r.data),

  create: (data: CreateDeviceCategoryDto) =>
    apiAxios.post<DeviceCategory>('/api/device-categories', data).then((r) => r.data),

  update: (id: string, data: UpdateDeviceCategoryDto) =>
    apiAxios.put<DeviceCategory>(`/api/device-categories/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiAxios.delete(`/api/device-categories/${id}`),
};
