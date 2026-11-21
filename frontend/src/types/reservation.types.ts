import { RoomType } from './room.types';

export type BookingType = 'NIGHTLY' | 'HOURLY';
export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';

export interface GuestInfo {
  fullName: string;
  phone: string;
  email?: string;
  idCard?: string;
}

export interface Reservation {
  id: string;
  reservationCode: string;
  bookingType: BookingType;
  roomType: RoomType;
  roomId?: string; // Physical room assigned (nullable until pre-assign or check-in)
  roomNumber?: string;
  guestInfo: GuestInfo;
  checkInDate: string;    // YYYY-MM-DD
  checkOutDate: string;   // YYYY-MM-DD (Nightly: 1-30 nights; Hourly: equals checkInDate)
  hourlyStartTime?: string;     // e.g. "09:00" (06:00 - 22:00)
  hourlyDurationHours?: number; // 1 - 10 hours
  adultCount: number;
  child6to11Count: number;
  childUnder6Count: number;
  guestCount: number; // adultCount + child6to11Count
  vipGuest?: boolean;
  status: ReservationStatus;
  
  // Snapshots at booking time (BR-55)
  snapNightlyRate: number;
  snapVoucherCode?: string;
  snapVoucherType?: 'PERCENT' | 'FIXED';
  snapVoucherValue?: number;
  snapVoucherMaxDiscount?: number;
  snapDepositRatePercent: number; // default 30%
  snapServiceFeeRatePercent: number; // default 5%
  snapVATRatePercent: number; // default 10%
  
  depositRequired: number; // BR-20
  depositPaid: number;     // BR-26 (actual collected)
  depositRefunded?: number;
  depositForfeited?: boolean;
  
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  totalPrice?: number;
  notes?: string;
  createdAt: string;
  cancelledAt?: string;
  noShowAt?: string;
}

export interface AvailabilityQuery {
  bookingType: BookingType;
  checkInDate: string;
  checkOutDate: string;
  hourlyStartTime?: string;
  hourlyDurationHours?: number;
  guestCount?: number;
  roomType?: RoomType;
}
