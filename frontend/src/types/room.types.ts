/**
 * Trạng thái và Danh mục phòng theo SRS F02
 */
export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'DIRTY';

export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  pricePerNight: number;
  maxCapacity: number;
  status: RoomStatus;
  description?: string;
}
