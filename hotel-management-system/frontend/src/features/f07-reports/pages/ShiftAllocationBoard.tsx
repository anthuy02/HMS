import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { roomService } from '../../../api/services/room.service';
import { reservationService } from '../../../api/services/reservation.service';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const ShiftAllocationBoard: React.FC = () => {
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: roomService.getRooms });
  const { data: reservations = [] } = useQuery({ queryKey: ['reservations'], queryFn: reservationService.getReservations });

  const activeReservations = reservations.filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
          [F07 - REP_02] Bảng Phân bổ Phòng Ca trực Lễ tân
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Theo dõi tổng hợp tình trạng phòng và lượng khách dự kiến phục vụ trong ca làm việc.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Tổng quan Tình trạng 11 Phòng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rooms.map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span><b>Phòng {r.roomNumber}</b> (Tầng {r.floor} - {r.type})</span>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Lượt Khách Trong Ca Làm Việc</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeReservations.map((res) => (
              <div key={res.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <b>Phòng {res.roomNumber} - {res.guestInfo.fullName}</b>
                  <StatusBadge status={res.status} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Lưu trú: {res.checkInDate} đến {res.checkOutDate} ({res.guestCount} khách)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
