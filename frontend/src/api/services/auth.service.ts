import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { LoginCredentials, AuthResponse, User } from '../../types/rbac.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (isMock) return mockHandlers.login(credentials);
    const res = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  getUsers: async (): Promise<User[]> => {
    if (isMock) return mockHandlers.getUsers();
    const res = await axiosClient.get<User[]>('/auth/users');
    return res.data;
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }): Promise<User> => {
    if (isMock) return mockHandlers.createUser(userData);
    const res = await axiosClient.post<User>('/auth/users', userData);
    return res.data;
  },

  toggleUserActive: async (userId: string, currentAdminId: string): Promise<User> => {
    if (isMock) return mockHandlers.toggleUserActive(userId, currentAdminId);
    const res = await axiosClient.post<User>(`/auth/users/${userId}/toggle-active`, { currentAdminId });
    return res.data;
  },

  updateUser: async (userId: string, updateData: Partial<User>): Promise<User> => {
    if (isMock) {
      const users = (await mockHandlers.getUsers()) as any[];
      const user = users.find((u) => u.id === userId);
      if (!user) throw new Error('Người dùng không tồn tại.');
      Object.assign(user, updateData);
      return user;
    }
    const res = await axiosClient.put<User>(`/auth/users/${userId}`, updateData);
    return res.data;
  },
};
