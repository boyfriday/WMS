import { coreApi } from './api';
import type { LoginRequest, RegisterRequest, User, ApiResponse } from '../types';

export const authService = {
  login: (data: LoginRequest) =>
    coreApi.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    coreApi.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data),

  me: () => coreApi.get<ApiResponse<User>>('/auth/me'),
};
