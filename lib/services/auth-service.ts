import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await api.get<AuthResponse['user']>('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<{ token: string }>('/auth/refresh');
    return response.data;
  }
};