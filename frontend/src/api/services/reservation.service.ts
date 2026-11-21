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

  createReservation: async (data: any): Promise<Reservation> => {
    if (isMock) return mockHandlers.createReservation(data);
    const res = await axiosClient.post<Reservation>('/reservations', data);
    return res.data;
  },

  rescheduleReservation: async (id: string, newCheckIn: string, newCheckOut: string): Promise<Reservation> => {
    if (isMock) return mockHandlers.rescheduleReservation(id, newCheckIn, newCheckOut);
    const res = await axiosClient.post<Reservation>(`/reservations/${id}/reschedule`, { newCheckIn, newCheckOut });
    return res.data;
  },

  cancelReservation: async (id: string): Promise<{ reservation: Reservation; refundAmount: number; refundPercentLabel: string }> => {
    if (isMock) return mockHandlers.cancelReservation(id);
    const res = await axiosClient.post(`/reservations/${id}/cancel`);
    return res.data;
  },

  updateGuestProfile: async (id: string, guestInfo: { fullName: string; phone: string; email?: string }): Promise<Reservation> => {
    if (isMock) return mockHandlers.updateGuestProfile(id, guestInfo);
    const res = await axiosClient.put<Reservation>(`/reservations/${id}/guest`, guestInfo);
    return res.data;
  },

  preAssignRoom: async (id: string, roomId: string): Promise<Reservation> => {
    if (isMock) return mockHandlers.preAssignRoom(id, roomId);
    const res = await axiosClient.post<Reservation>(`/reservations/${id}/pre-assign`, { roomId });
    return res.data;
  },
};
