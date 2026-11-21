import React from 'react';
import { RoomStatus, CleaningTaskStatus } from '../../types/room.types';

interface StatusBadgeProps {
  status:
    | RoomStatus
    | CleaningTaskStatus
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED'
    | 'NO_SHOW'
    | 'UNPAID'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'DRAFT'
    | 'ISSUED';
}

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  // 5 Trạng thái phòng chuẩn (BR-65)
  AVAILABLE: { label: 'Trống (AVAILABLE)', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  RESERVED: { label: 'Đã giữ (RESERVED)', bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  OCCUPIED: { label: 'Đang ở (OCCUPIED)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  CLEANING: { label: 'Đang dọn (CLEANING)', bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' },
  OUT_OF_SERVICE: { label: 'Bảo trì (OUT_OF_SERVICE)', bg: '#f1f5f9', color: '#475569', border: '#94a3b8' },

  // Vòng đời 2 bước nhiệm vụ dọn phòng (BR-112)
  PENDING: { label: 'Chờ dọn (PENDING)', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  IN_PROGRESS: { label: 'Đang dọn (IN_PROGRESS)', bg: '#e0f2fe', color: '#0284c7', border: '#7dd3fc' },
  DONE: { label: 'Đã hoàn tất (DONE)', bg: '#dcfce7', color: '#16a34a', border: '#86efac' },

  // Đơn đặt phòng
  CONFIRMED: { label: 'Đã xác nhận', bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  CHECKED_IN: { label: 'Đang lưu trú', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  CHECKED_OUT: { label: 'Đã trả phòng', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  CANCELLED: { label: 'Đã hủy', bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
  NO_SHOW: { label: 'Vắng mặt (NO_SHOW)', bg: '#fee2e2', color: '#991b1b', border: '#f87171' },

  // Hóa đơn
  DRAFT: { label: 'Bản nháp (DRAFT)', bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
  ISSUED: { label: 'Đã xuất (ISSUED)', bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
  UNPAID: { label: 'Chưa thanh toán', bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
  PARTIALLY_PAID: { label: 'Thanh toán 1 phần', bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
  PAID: { label: 'Đã thanh toán đủ', bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const conf = statusConfig[status] || { label: status, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: conf.bg,
        color: conf.color,
        border: `1px solid ${conf.border}`,
      }}
    >
      {conf.label}
    </span>
  );
};
