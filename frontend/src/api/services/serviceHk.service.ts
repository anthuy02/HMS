import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Room, CleaningTask } from '../../types/room.types';
import { Invoice } from '../../types/billing.types';
import { ServiceCatalogItem } from '../../types/systemConfig.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const serviceHkService = {
  getCatalogItems: async (): Promise<ServiceCatalogItem[]> => {
    if (isMock) return mockHandlers.getCatalogItems();
    const res = await axiosClient.get<ServiceCatalogItem[]>('/service-catalog');
    return res.data;
  },

  orderService: async (roomNumber: string, itemCode: string, quantity: number): Promise<Invoice> => {
    if (isMock) return mockHandlers.orderService(roomNumber, itemCode, quantity);
    const res = await axiosClient.post<Invoice>(`/reservations/${roomNumber}/services`, { itemCode, quantity });
    return res.data;
  },

  recordDamage: async (roomNumber: string, amount: number, note: string): Promise<Invoice> => {
    if (isMock) return mockHandlers.recordDamage(roomNumber, amount, note);
    const res = await axiosClient.post<Invoice>(`/reservations/${roomNumber}/services`, { amount, note, type: 'DAMAGE' });
    return res.data;
  },

  getCleaningTasks: async (): Promise<CleaningTask[]> => {
    if (isMock) return mockHandlers.getCleaningTasks();
    const res = await axiosClient.get<CleaningTask[]>('/cleaning-tasks');
    return res.data;
  },

  startCleaningTask: async (taskId: string, housekeeperId: string, housekeeperName: string): Promise<CleaningTask> => {
    if (isMock) return mockHandlers.startCleaningTask(taskId, housekeeperId, housekeeperName);
    const res = await axiosClient.patch<CleaningTask>(`/cleaning-tasks/${taskId}/status`, { housekeeperId, housekeeperName, status: 'IN_PROGRESS' });
    return res.data;
  },

  completeCleaningTask: async (taskId: string): Promise<{ task: CleaningTask; room: Room }> => {
    if (isMock) return mockHandlers.completeCleaningTask(taskId);
    const res = await axiosClient.patch<any>(`/cleaning-tasks/${taskId}/status`, { status: 'COMPLETED' });
    return res.data;
  },

  confirmRoomCleaned: async (roomId: string): Promise<Room> => {
    if (isMock) return mockHandlers.confirmRoomCleaned(roomId);
    const res = await axiosClient.put<Room>(`/rooms/${roomId}`, { status: 'AVAILABLE' });
    return res.data;
  },
};
