import React from 'react';
import { RoomStatus } from '../../types/room.types';

interface StatusBadgeProps {
  status: RoomStatus | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
}

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  AVAILABLE: { label: 'Trống (Sẵn sàng)', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  RESERVED: { label: 'Đã đặt (Giữ chỗ)', bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  OCCUPIED: { label: 'Đang có khách', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  DIRTY: { label: 'Chưa dọn (Bẩn)', bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' },

  CONFIRMED: { label: 'Đã xác nhận', bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  CHECKED_IN: { label: 'Đang lưu trú', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  CHECKED_OUT: { label: 'Đã trả phòng', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  CANCELLED: { label: 'Đã hủy', bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },

  UNPAID: { label: 'Chưa thanh toán', bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
  PARTIALLY_PAID: { label: 'Thanh toán một phần', bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
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
