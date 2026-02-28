import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '../types/auth.types';
import { authApi } from '../api/authApi';
import { message } from 'antd';

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function userFromToken(token: string): User | null {
  const payload = parseJwt(token);
  if (!payload) return null;
  return {
    id: payload.sub || payload.nameid,
    fullName: payload.name || '',
    email: payload.email || '',
    phoneNumber: payload.phone || '',
    employeeCode: payload.employee_code || '',
    role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const user = userFromToken(token);
      setState({ user, isAuthenticated: !!user, isLoading: false });
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const result = await authApi.login({ phoneNumber: phone, password });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    const user = userFromToken(result.accessToken);
    setState({ user, isAuthenticated: true, isLoading: false });
    message.success('Đăng nhập thành công');
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await authApi.googleLogin(idToken);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    const user = userFromToken(result.accessToken);
    setState({ user, isAuthenticated: true, isLoading: false });
    message.success('Đăng nhập Google thành công');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({ user: null, isAuthenticated: false, isLoading: false });
    message.info('Đã đăng xuất');
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
