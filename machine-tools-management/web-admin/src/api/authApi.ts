import { authAxios } from './axiosInstance';
import type { LoginRequest, LoginResult, TokenRefreshRequest } from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    authAxios.post<LoginResult>('/api/auth/login/phone', data).then((r) => r.data),

  googleLogin: (idToken: string) =>
    authAxios.post<LoginResult>('/api/auth/login/google', { idToken }).then((r) => r.data),

  refresh: (data: TokenRefreshRequest) =>
    authAxios.post<LoginResult>('/api/auth/refresh-token', data).then((r) => r.data),
};
