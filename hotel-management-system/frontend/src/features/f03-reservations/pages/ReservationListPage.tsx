import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationService } from '../../../api/services/reservation.service';
import { Reservation } from '../../../types/reservation.types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { formatDateVN } from '../../../utils/formatters';
import { BookingForm } from '../components/BookingForm';

export const ReservationListPage: React.FC = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationService.getReservations,
  });

  const columns: Column<Reservation>[] = [
    { key: 'reservationCode', header: 'Mã đơn đặt', width: '15%' },
    { key: 'roomNumber', header: 'Phòng', width: '8%', render: (r) => <b>P.{r.roomNumber}</b> },
    { key: 'guest', header: 'Khách hàng', render: (r) => <div><div><b>{r.guestInfo.fullName}</b></div><div style={{ fontSize: '11px', color: '#64748b' }}>{r.guestInfo.phone}</div></div> },
    {
      key: 'dates',
      header: 'Thời gian lưu trú',
      render: (r) => (
        <span style={{ fontSize: '13px' }}>
          {formatDateVN(r.checkInDate)} ➜ {formatDateVN(r.checkOutDate)}
        </span>
      ),
    },
    { key: 'guestCount', header: 'Số khách', width: '10%', render: (r) => `${r.guestCount} người` },
    { key: 'totalPrice', header: 'Tạm tính tiền phòng', render: (r) => <CurrencyDisplay amount={r.totalPrice} /> },
    { key: 'status', header: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>[F03] Quản lý Đặt phòng (Reservations)</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Tuân thủ quy tắc kiểm tra ngày [BR01] và chống trùng lịch [BR02].</p>
        </div>
        <button
          onClick={() => setIsBookingModalOpen(true)}
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
        >
          + Tạo Đơn Đặt Phòng Mới
        </button>
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        searchPlaceholder="Tìm theo mã đơn, số phòng hoặc tên khách..."
        searchFilter={(r, q) =>
          r.reservationCode.toLowerCase().includes(q.toLowerCase()) ||
          r.roomNumber.includes(q) ||
          r.guestInfo.fullName.toLowerCase().includes(q.toLowerCase())
        }
      />

      <BookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }}
      />
    </div>
  );
};
