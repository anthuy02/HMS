import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, LoginCredentials } from '../../types/rbac.types';
import { authService } from '../../api/services/auth.service';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
  switchRole: (newRole: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_MOCK_USER: User = {
  id: 'u-01',
  username: 'admin01',
  fullName: 'Nguyễn Quản Trị (Admin)',
  email: 'admin01@hotel.com',
  phone: '0901234567',
  role: 'ADMIN',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};
const DEFAULT_MOCK_TOKEN = 'mock-token-admin01';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Auto-login default admin in mock mode
    if (import.meta.env.VITE_USE_MOCK !== 'false') {
      localStorage.setItem('currentUser', JSON.stringify(DEFAULT_MOCK_USER));
      localStorage.setItem('token', DEFAULT_MOCK_TOKEN);
      return DEFAULT_MOCK_USER;
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('token');
    if (saved) return saved;
    if (import.meta.env.VITE_USE_MOCK !== 'false') return DEFAULT_MOCK_TOKEN;
    return null;
  });

  const login = async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUser(null);
    setToken(null);
  };

  const hasRole = (allowedRoles: Role[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        hasRole,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
