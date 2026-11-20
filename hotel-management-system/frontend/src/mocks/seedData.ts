import { User } from '../types/rbac.types';
import { Room } from '../types/room.types';
import { Reservation } from '../types/reservation.types';
import { Invoice } from '../types/billing.types';

export const SEED_USERS: (User & { password: string })[] = [
  {
    id: 'u-admin',
    email: 'admin@hotel.com',
    password: 'admin123',
    fullName: 'Nguyễn Quản Trị (Admin)',
    role: 'ADMIN',
    phone: '0901111222',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'u-manager',
    email: 'manager@hotel.com',
    password: 'manager123',
    fullName: 'Trần Giám Đốc (Manager)',
    role: 'MANAGER',
    phone: '0903333444',
    isActive: true,
    createdAt: '2026-01-02T08:00:00Z',
  },
  {
    id: 'u-reception',
    email: 'reception@hotel.com',
    password: 'reception123',
    fullName: 'Lê Lễ Tân (Receptionist)',
    role: 'RECEPTIONIST',
    phone: '0905555666',
    isActive: true,
    createdAt: '2026-01-03T08:00:00Z',
  },
  {
    id: 'u-hk',
    email: 'hk@hotel.com',
    password: 'hk123',
    fullName: 'Phạm Buồng Phòng (Housekeeping)',
    role: 'HOUSEKEEPING',
    phone: '0907777888',
    isActive: true,
    createdAt: '2026-01-04T08:00:00Z',
  },
];

// Đúng 11 phòng (101 - 303) theo yêu cầu SRS
export const SEED_ROOMS: Room[] = [
  // Tầng 1
  { id: 'r-101', roomNumber: '101', floor: 1, type: 'STANDARD', pricePerNight: 500000, maxCapacity: 2, status: 'AVAILABLE', description: 'Phòng tiêu chuẩn 1 giường đôi, view vườn' },
  { id: 'r-102', roomNumber: '102', floor: 1, type: 'STANDARD', pricePerNight: 500000, maxCapacity: 2, status: 'RESERVED', description: 'Phòng tiêu chuẩn 2 giường đơn' },
  { id: 'r-103', roomNumber: '103', floor: 1, type: 'DELUXE', pricePerNight: 800000, maxCapacity: 3, status: 'OCCUPIED', description: 'Phòng cao cấp ban công thoáng' },
  { id: 'r-104', roomNumber: '104', floor: 1, type: 'DELUXE', pricePerNight: 800000, maxCapacity: 3, status: 'DIRTY', description: 'Phòng Deluxe vừa trả cần dọn dẹp' },

  // Tầng 2
  { id: 'r-201', roomNumber: '201', floor: 2, type: 'STANDARD', pricePerNight: 550000, maxCapacity: 2, status: 'AVAILABLE', description: 'Phòng tầng 2 yên tĩnh' },
  { id: 'r-202', roomNumber: '202', floor: 2, type: 'DELUXE', pricePerNight: 850000, maxCapacity: 3, status: 'AVAILABLE', description: 'Phòng Deluxe nhìn hồ bơi' },
  { id: 'r-203', roomNumber: '203', floor: 2, type: 'SUITE', pricePerNight: 1500000, maxCapacity: 4, status: 'OCCUPIED', description: 'Phòng Suite gia đình sang trọng' },
  { id: 'r-204', roomNumber: '204', floor: 2, type: 'SUITE', pricePerNight: 1500000, maxCapacity: 4, status: 'DIRTY', description: 'Phòng Suite cần vệ sinh gấp' },

  // Tầng 3
  { id: 'r-301', roomNumber: '301', floor: 3, type: 'DELUXE', pricePerNight: 900000, maxCapacity: 3, status: 'AVAILABLE', description: 'Phòng góc view toàn cảnh thành phố' },
  { id: 'r-302', roomNumber: '302', floor: 3, type: 'SUITE', pricePerNight: 1600000, maxCapacity: 4, status: 'AVAILABLE', description: 'Phòng Suite hướng biển' },
  { id: 'r-303', roomNumber: '303', floor: 3, type: 'PRESIDENTIAL', pricePerNight: 3500000, maxCapacity: 6, status: 'RESERVED', description: 'Phòng Tổng thống tiện nghi đẳng cấp 5 sao' },
];

export const SEED_SERVICES = [
  { id: 's-1', name: 'Bia Heineken (Lon)', category: 'MINIBAR', price: 35000 },
  { id: 's-2', name: 'Nước suối Lavie 500ml', category: 'MINIBAR', price: 15000 },
  { id: 's-3', name: 'Coca Cola', category: 'MINIBAR', price: 20000 },
  { id: 's-4', name: 'Khoai tây sấy Pringles', category: 'MINIBAR', price: 45000 },
  { id: 's-5', name: 'Giặt ủi áo sơ mi', category: 'LAUNDRY', price: 30000 },
  { id: 's-6', name: 'Giặt ủi quần âu', category: 'LAUNDRY', price: 35000 },
  { id: 's-7', name: 'Giặt hấp bộ Comple', category: 'LAUNDRY', price: 120000 },
];

export const SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'res-102',
    reservationCode: 'RSV-10201',
    roomId: 'r-102',
    roomNumber: '102',
    guestInfo: {
      fullName: 'Hoàng Văn Anh',
      idCard: '001200001234',
      phone: '0912345678',
      email: 'hoanganh@gmail.com',
    },
    checkInDate: '2026-11-20',
    checkOutDate: '2026-11-22',
    guestCount: 2,
    status: 'CONFIRMED',
    totalPrice: 1000000,
    notes: 'Khách đến nhận phòng lúc 14:00',
    createdAt: '2026-11-19T10:00:00Z',
  },
  {
    id: 'res-103',
    reservationCode: 'RSV-10301',
    roomId: 'r-103',
    roomNumber: '103',
    guestInfo: {
      fullName: 'Vũ Thị Mai',
      idCard: '001200005678',
      phone: '0987654321',
      email: 'maivu@gmail.com',
    },
    checkInDate: '2026-11-19',
    checkOutDate: '2026-11-21',
    guestCount: 2,
    status: 'CHECKED_IN',
    totalPrice: 1600000,
    notes: 'Khách VIP đang lưu trú',
    createdAt: '2026-11-18T09:00:00Z',
  },
  {
    id: 'res-203',
    reservationCode: 'RSV-20301',
    roomId: 'r-203',
    roomNumber: '203',
    guestInfo: {
      fullName: 'Đặng Tuấn Kiệt',
      idCard: '001200009999',
      phone: '0933221100',
      email: 'kietdang@gmail.com',
    },
    checkInDate: '2026-11-18',
    checkOutDate: '2026-11-20',
    guestCount: 3,
    status: 'CHECKED_IN',
    totalPrice: 3000000,
    notes: 'Gia đình có trẻ em',
    createdAt: '2026-11-17T14:30:00Z',
  },
  {
    id: 'res-303',
    reservationCode: 'RSV-30301',
    roomId: 'r-303',
    roomNumber: '303',
    guestInfo: {
      fullName: 'Phạm Hồng Phúc',
      idCard: '079200008888',
      phone: '0908889999',
      email: 'phucpham@corp.vn',
    },
    checkInDate: '2026-11-21',
    checkOutDate: '2026-11-25',
    guestCount: 4,
    status: 'CONFIRMED',
    totalPrice: 14000000,
    notes: 'Phòng tổng thống đoàn đại biểu',
    createdAt: '2026-11-19T16:00:00Z',
  },
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv-103',
    invoiceNumber: 'INV-202611-001',
    reservationId: 'res-103',
    roomNumber: '103',
    guestName: 'Vũ Thị Mai',
    checkInDate: '2026-11-19',
    checkOutDate: '2026-11-21',
    items: [
      { id: 'it-1', description: 'Tiền phòng Deluxe (2 đêm)', quantity: 2, unitPrice: 800000, total: 1600000, type: 'ROOM' },
      { id: 'it-2', description: 'Bia Heineken (Lon)', quantity: 2, unitPrice: 35000, total: 70000, type: 'SERVICE' },
      { id: 'it-3', description: 'Nước suối Lavie', quantity: 2, unitPrice: 15000, total: 30000, type: 'SERVICE' },
    ],
    roomCharge: 1600000,
    serviceCharge: 100000,
    lateSurcharge: 0,
    subTotal: 1700000,
    discountPercent: 0,
    discountAmount: 0,
    vatRate: 0.1,
    vatAmount: 170000,
    totalAmount: 1870000,
    paidAmount: 500000,
    remainingBalance: 1370000,
    status: 'PARTIALLY_PAID',
    payments: [
      {
        id: 'pay-1',
        amount: 500000,
        method: 'BANK_TRANSFER',
        transactionDate: '2026-11-19T14:30:00Z',
        idempotencyKey: 'init-deposit-103',
        note: 'Tiền đặt cọc nhận phòng',
      },
    ],
    createdAt: '2026-11-19T14:30:00Z',
  },
];
