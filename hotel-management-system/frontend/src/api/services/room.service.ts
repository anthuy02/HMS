import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Room } from '../../types/room.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const roomService = {
  getRooms: async (): Promise<Room[]> => {
    if (isMock) return mockHandlers.getRooms();
    const res = await axiosClient.get<Room[]>('/rooms');
    return res.data;
  },

  updateRoom: async (id: string, updateData: Partial<Room>): Promise<Room> => {
    if (isMock) return mockHandlers.updateRoom(id, updateData);
    const res = await axiosClient.put<Room>(`/rooms/${id}`, updateData);
    return res.data;
  },
};
