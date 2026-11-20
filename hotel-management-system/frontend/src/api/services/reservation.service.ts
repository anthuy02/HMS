import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { Reservation, AvailabilityQuery } from '../../types/reservation.types';
import { Room } from '../../types/room.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const reservationService = {
  getReservations: async (): Promise<Reservation[]> => {
    if (isMock) return mockHandlers.getReservations();
    const res = await axiosClient.get<Reservation[]>('/reservations');
    return res.data;
  },

  checkAvailability: async (query: AvailabilityQuery): Promise<Room[]> => {
    if (isMock) return mockHandlers.checkAvailability(query);
    const res = await axiosClient.get<Room[]>('/reservations/check-availability', { params: query });
    return res.data;
  },

  createReservation: async (data: Omit<Reservation, 'id' | 'reservationCode' | 'createdAt' | 'status' | 'totalPrice'>): Promise<Reservation> => {
    if (isMock) return mockHandlers.createReservation(data);
    const res = await axiosClient.post<Reservation>('/reservations', data);
    return res.data;
  },
};
