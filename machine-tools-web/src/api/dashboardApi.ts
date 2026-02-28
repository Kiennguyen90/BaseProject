import apiAxios from './axiosInstance';
import type { DashboardStats } from '../types/dashboard.types';

export const dashboardApi = {
  getStats: () =>
    apiAxios.get<DashboardStats>('/api/dashboard/stats').then((r) => r.data),
};
