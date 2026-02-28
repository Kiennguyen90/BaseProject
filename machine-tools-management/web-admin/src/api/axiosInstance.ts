import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || '';
const MACHINE_TOOLS_API_URL = import.meta.env.VITE_API_URL || '';

export const authAxios = axios.create({
  baseURL: AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const apiAxios = axios.create({
  baseURL: MACHINE_TOOLS_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add JWT token
const addAuthHeader = (config: any) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authAxios.interceptors.request.use(addAuthHeader);
apiAxios.interceptors.request.use(addAuthHeader);

// Response interceptor for token refresh
apiAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authAxios.post('/api/auth/refresh-token', {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiAxios(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiAxios;
