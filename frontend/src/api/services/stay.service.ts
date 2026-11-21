import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Reservation } from '../../types/reservation.types';
import { Room } from '../../types/room.types';
import { Invoice } from '../../types/billing.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const stayService = {
  checkIn: async (reservationId: string, assignedRoomId?: string): Promise<{ reservation: Reservation; room: Room }> => {
    if (isMock) return mockHandlers.checkIn(reservationId, assignedRoomId);
    const res = await axiosClient.post<{ reservation: Reservation; room: Room }>('/stays/check-in', { reservationId, assignedRoomId });
    return res.data;
  },

  getInterimBalance: async (reservationId: string): Promise<Invoice> => {
    if (isMock) return mockHandlers.getInterimBalance(reservationId);
    const res = await axiosClient.get<Invoice>(`/stays/interim-balance/${reservationId}`);
    return res.data;
  },

  checkOut: async (
    reservationId: string,
    actualCheckoutTime?: string
  ): Promise<{ reservation: Reservation; room: Room; invoice: Invoice; branchMessage: string }> => {
    if (isMock) return mockHandlers.checkOut(reservationId, actualCheckoutTime);
    const res = await axiosClient.post<any>('/stays/check-out', { reservationId, actualCheckoutTime });
    return res.data;
  },
};
