import api from '@/utils/api';
import type { User } from '@/types';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export const authApi = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};