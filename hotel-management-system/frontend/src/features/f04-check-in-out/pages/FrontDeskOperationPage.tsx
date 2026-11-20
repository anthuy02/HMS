import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationService } from '../../../api/services/reservation.service';
import { Reservation } from '../../../types/reservation.types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatDateVN } from '../../../utils/formatters';
import { CheckInModal } from '../components/CheckInModal';
import { CheckOutModal } from '../components/CheckOutModal';
import { useNavigate } from 'react-router-dom';

export const FrontDeskOperationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedResForCheckIn, setSelectedResForCheckIn] = useState<Reservation | null>(null);
  const [selectedResForCheckOut, setSelectedResForCheckOut] = useState<Reservation | null>(null);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationService.getReservations,
  });

  const activeReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN'
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>[F04] Bàn làm việc Lễ tân (Front Desk Operations)</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Tiếp đón khách, thực hiện Check-in [BR03] và Trả phòng &amp; Tính phụ thu Check-out [BR04].
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {activeReservations.map((res) => (
          <div
            key={res.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Phòng {res.roomNumber}</span>
              <StatusBadge status={res.status} />
            </div>

            <div style={{ fontSize: '13px', color: '#334155' }}>
              <div>Khách: <b>{res.guestInfo.fullName}</b></div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>SĐT: {res.guestInfo.phone} | CCCD: {res.guestInfo.idCard}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Lưu trú: {formatDateVN(res.checkInDate)} ➜ {formatDateVN(res.checkOutDate)} ({res.guestCount} khách)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              {res.status === 'CONFIRMED' && (
                <button
                  onClick={() => setSelectedResForCheckIn(res)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  Xác nhận Nhận phòng (BR03)
                </button>
              )}

              {res.status === 'CHECKED_IN' && (
                <>
                  <button
                    onClick={() => setSelectedResForCheckOut(res)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '13px',
                    }}
                  >
                    Trả phòng (BR04)
                  </button>
                  <button
                    onClick={() => navigate(`/billing/inv-${res.id}`)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    Xem Hóa đơn
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedResForCheckIn && (
        <CheckInModal
          isOpen={!!selectedResForCheckIn}
          reservation={selectedResForCheckIn}
          onClose={() => setSelectedResForCheckIn(null)}
          onSuccess={() => {
            setSelectedResForCheckIn(null);
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
          }}
        />
      )}

      {selectedResForCheckOut && (
        <CheckOutModal
          isOpen={!!selectedResForCheckOut}
          reservation={selectedResForCheckOut}
          onClose={() => setSelectedResForCheckOut(null)}
          onSuccess={(invoice) => {
            setSelectedResForCheckOut(null);
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            navigate(`/billing/${invoice.id}`);
          }}
        />
      )}
    </div>
  );
};
