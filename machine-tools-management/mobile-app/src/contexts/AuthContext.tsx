import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import type { User, AuthState } from '../types/auth.types';
import { authApi } from '../api/authApi';
import { storageService } from '../services/storageService';

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function base64Decode(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  const str = input.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < str.length) {
    const enc1 = chars.indexOf(str.charAt(i++));
    const enc2 = chars.indexOf(str.charAt(i++));
    const enc3 = chars.indexOf(str.charAt(i++));
    const enc4 = chars.indexOf(str.charAt(i++));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }
  return output;
}

function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(
      decodeURIComponent(
        base64Decode(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
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
    const restore = async () => {
      try {
        const token = await storageService.getAccessToken();
        if (token) {
          const user = userFromToken(token);
          setState({ user, isAuthenticated: !!user, isLoading: false });
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };
    restore();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const result = await authApi.login({ phoneNumber: phone, password });
    await storageService.setAccessToken(result.accessToken);
    await storageService.setRefreshToken(result.refreshToken);
    const user = userFromToken(result.accessToken);
    if (user) await storageService.setUser(user);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await authApi.googleLogin(idToken);
    await storageService.setAccessToken(result.accessToken);
    await storageService.setRefreshToken(result.refreshToken);
    const user = userFromToken(result.accessToken);
    if (user) await storageService.setUser(user);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await storageService.clearAuth();
    setState({ user: null, isAuthenticated: false, isLoading: false });
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
