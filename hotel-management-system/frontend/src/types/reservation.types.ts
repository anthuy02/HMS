import { Room } from './room.types';

export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface GuestInfo {
  fullName: string;
  idCard: string;
  phone: string;
  email: string;
}

export interface Reservation {
  id: string;
  reservationCode: string;
  roomId: string;
  roomNumber: string;
  guestInfo: GuestInfo;
  checkInDate: string;   // YYYY-MM-DD
  checkOutDate: string;  // YYYY-MM-DD
  guestCount: number;
  status: ReservationStatus;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface AvailabilityQuery {
  checkInDate: string;
  checkOutDate: string;
  guestCount?: number;
  roomType?: string;
}
