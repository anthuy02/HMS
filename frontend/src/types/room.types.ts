/**
 * Trạng thái và Danh mục phòng theo SRS & BR v1.2 (BR-65, BR-101)
 * 5 trạng thái: AVAILABLE, RESERVED, OCCUPIED, CLEANING, OUT_OF_SERVICE
 */
export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'OUT_OF_SERVICE';

export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  pricePerNight: number;
  maxCapacity: number;
  status: RoomStatus;
  maintenanceReason?: string;
  assignedReservationId?: string; // Nếu phòng đang RESERVED gắn với 1 đơn CONFIRMED (BR-08)
  description?: string;
}

export type CleaningTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface CleaningTask {
  id: string;
  roomId: string;
  roomNumber: string;
  reservationId: string;
  assignedHousekeeperId?: string;
  assignedHousekeeperName?: string;
  status: CleaningTaskStatus;
  createdAt: string;
  completedAt?: string;
}
