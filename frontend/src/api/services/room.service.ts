import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Room } from '../../types/room.types';
import { Role } from '../../types/rbac.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const roomService = {
  getRooms: async (): Promise<Room[]> => {
    if (isMock) return mockHandlers.getRooms();
    const res = await axiosClient.get<Room[]>('/rooms');
    return res.data;
  },

  createRoom: async (roomData: Omit<Room, 'id'>, userRole: Role): Promise<Room> => {
    if (isMock) return mockHandlers.createRoom(roomData, userRole);
    const res = await axiosClient.post<Room>('/rooms', roomData);
    return res.data;
  },

  updateRoom: async (id: string, updateData: Partial<Room>, userRole: Role): Promise<Room> => {
    if (isMock) return mockHandlers.updateRoom(id, updateData, userRole);
    const res = await axiosClient.put<Room>(`/rooms/${id}`, updateData);
    return res.data;
  },

  setOutOfService: async (id: string, reason: string, userRole: Role): Promise<Room> => {
    if (isMock) return mockHandlers.setOutOfService(id, reason, userRole);
    const res = await axiosClient.post<Room>(`/rooms/${id}/out-of-service`, { reason });
    return res.data;
  },

  returnToService: async (id: string, userRole: Role): Promise<Room> => {
    if (isMock) return mockHandlers.returnToService(id, userRole);
    const res = await axiosClient.post<Room>(`/rooms/${id}/return-to-service`);
    return res.data;
  },
};
