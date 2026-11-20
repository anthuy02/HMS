/**
 * Định nghĩa các Role và User theo phân quyền RBAC (BR08)
 */
export type Role = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
