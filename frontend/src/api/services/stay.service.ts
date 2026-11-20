import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Reservation } from '../../types/reservation.types';
import { Room } from '../../types/room.types';
import { Invoice } from '../../types/billing.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const stayService = {
  checkIn: async (reservationId: string): Promise<{ reservation: Reservation; room: Room }> => {
    if (isMock) return mockHandlers.checkIn(reservationId);
    const res = await axiosClient.post<{ reservation: Reservation; room: Room }>('/stays/check-in', { reservationId });
    return res.data;
  },

  checkOut: async (reservationId: string, actualCheckoutTime?: string): Promise<{ reservation: Reservation; room: Room; invoice: Invoice }> => {
    if (isMock) return mockHandlers.checkOut(reservationId, actualCheckoutTime);
    const res = await axiosClient.post<{ reservation: Reservation; room: Room; invoice: Invoice }>('/stays/check-out', {
      reservationId,
      actualCheckoutTime,
    });
    return res.data;
  },
};
