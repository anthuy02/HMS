/**
 * Định nghĩa các Role và User theo phân quyền RBAC v1.2 (BR08, BR-75)
 * Role: ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPER
 */
export type Role = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPER';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string;
  isActive: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  createdAt: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string; // Hỗ trợ cả username hoặc email
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
