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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

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
