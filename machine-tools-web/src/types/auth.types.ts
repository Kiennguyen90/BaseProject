export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  employeeCode?: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
