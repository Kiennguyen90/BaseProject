import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceApi } from '../api/deviceApi';
import type { DeviceListFilter, CreateDeviceDto, UpdateDeviceDto } from '../types/device.types';
import { message } from 'antd';

export const useDevices = (filter?: DeviceListFilter) =>
  useQuery({
    queryKey: ['devices', filter],
    queryFn: () => deviceApi.getList(filter),
  });

export const useDevice = (id: string) =>
  useQuery({
    queryKey: ['devices', id],
    queryFn: () => deviceApi.get(id),
    enabled: !!id,
  });

export const useAvailableDevices = (filter?: DeviceListFilter) =>
  useQuery({
    queryKey: ['devices', 'available', filter],
    queryFn: () => deviceApi.getAvailable(filter),
  });

export const useCreateDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeviceDto) => deviceApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] });
      message.success('Thêm thiết bị thành công');
    },
    onError: () => message.error('Không thể thêm thiết bị'),
  });
};

export const useUpdateDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeviceDto }) => deviceApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] });
      message.success('Cập nhật thiết bị thành công');
    },
    onError: () => message.error('Không thể cập nhật thiết bị'),
  });
};

export const useDeleteDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deviceApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] });
      message.success('Xóa thiết bị thành công');
    },
    onError: () => message.error('Không thể xóa thiết bị'),
  });
};
