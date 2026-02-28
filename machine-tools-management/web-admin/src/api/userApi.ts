import { authAxios } from './axiosInstance';
import type {
  UserListItem,
  UserDetail,
  CreateUserDto,
  UpdateUserDto,
  UserListFilter,
} from '../types/user.types';
import type { PagedResult } from '../types/common.types';

export const userApi = {
  getList: (params?: UserListFilter) =>
    authAxios.get<PagedResult<UserListItem>>('/api/users', { params }).then((r) => r.data),

  get: (id: string) =>
    authAxios.get<UserDetail>(`/api/users/${id}`).then((r) => r.data),

  create: (data: CreateUserDto) =>
    authAxios.post<UserDetail>('/api/users', data).then((r) => r.data),

  update: (id: string, data: UpdateUserDto) =>
    authAxios.put<UserDetail>(`/api/users/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    authAxios.delete(`/api/users/${id}`).then((r) => r.data),

  getRoles: (id: string) =>
    authAxios.get<string[]>(`/api/users/${id}/roles`).then((r) => r.data),

  setRoles: (id: string, roleNames: string[]) =>
    authAxios.put(`/api/users/${id}/roles`, roleNames).then((r) => r.data),
};
