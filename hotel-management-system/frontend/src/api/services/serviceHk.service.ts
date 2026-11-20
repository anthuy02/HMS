import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Room } from '../../types/room.types';
import { Invoice } from '../../types/billing.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const serviceHkService = {
  getServicesCatalog: async () => {
    if (isMock) return mockHandlers.getServicesCatalog();
    const res = await axiosClient.get('/services/items');
    return res.data;
  },

  getDirtyRooms: async (): Promise<Room[]> => {
    if (isMock) return mockHandlers.getDirtyRooms();
    const res = await axiosClient.get<Room[]>('/housekeeping/dirty-rooms');
    return res.data;
  },

  confirmRoomCleaned: async (roomId: string): Promise<Room> => {
    if (isMock) return mockHandlers.confirmRoomCleaned(roomId);
    const res = await axiosClient.post<Room>(`/housekeeping/clean/${roomId}`);
    return res.data;
  },

  orderService: async (roomNumber: string, serviceItemId: string, quantity: number): Promise<Invoice> => {
    if (isMock) return mockHandlers.orderService(roomNumber, serviceItemId, quantity);
    const res = await axiosClient.post<Invoice>('/services/orders', { roomNumber, serviceItemId, quantity });
    return res.data;
  },
};
