import axios from 'axios';
import { storageService } from '../services/storageService';
import { Config } from '../config';

export const authAxios = axios.create({
  baseURL: Config.AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const apiAxios = axios.create({
  baseURL: Config.MACHINE_TOOLS_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Add auth header to requests
const addAuthHeader = async (config: any) => {
  const token = await storageService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authAxios.interceptors.request.use(addAuthHeader);
apiAxios.interceptors.request.use(addAuthHeader);

// Token refresh interceptor
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  refreshQueue = [];
};

apiAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiAxios(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storageService.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await authAxios.post('/api/auth/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await storageService.setAccessToken(accessToken);
        await storageService.setRefreshToken(newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        await storageService.clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiAxios;
