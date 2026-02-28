import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import type {
  UserListFilter,
  CreateUserDto,
  UpdateUserDto,
} from '../types/user.types';
import { message } from 'antd';

export const useUsers = (filter?: UserListFilter) =>
  useQuery({
    queryKey: ['users', filter],
    queryFn: () => userApi.getList(filter),
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.get(id),
    enabled: !!id,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Tạo người dùng thành công');
    },
    onError: () => message.error('Tạo người dùng thất bại'),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Cập nhật người dùng thành công');
    },
    onError: () => message.error('Cập nhật người dùng thất bại'),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Xóa người dùng thành công');
    },
    onError: () => message.error('Xóa người dùng thất bại'),
  });
};

export const useUserRoles = (id: string) =>
  useQuery({
    queryKey: ['users', id, 'roles'],
    queryFn: () => userApi.getRoles(id),
    enabled: !!id,
  });

export const useSetUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleNames }: { id: string; roleNames: string[] }) =>
      userApi.setRoles(id, roleNames),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.id, 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Cập nhật vai trò thành công');
    },
    onError: () => message.error('Cập nhật vai trò thất bại'),
  });
};
