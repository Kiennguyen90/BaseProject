import { useQuery } from '@tanstack/react-query';
import { deviceCategoryApi } from '../api/deviceCategoryApi';

export const useDeviceCategories = () =>
  useQuery({
    queryKey: ['device-categories'],
    queryFn: () => deviceCategoryApi.getList(),
  });

export const useDeviceCategory = (id: string) =>
  useQuery({
    queryKey: ['device-categories', id],
    queryFn: () => deviceCategoryApi.get(id),
    enabled: !!id,
  });
