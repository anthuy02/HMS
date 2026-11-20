import React, { useState } from 'react';
import { Reservation } from '../../../types/reservation.types';
import { stayService } from '../../../api/services/stay.service';
import { formatDateVN } from '../../../utils/formatters';

interface CheckInModalProps {
  isOpen: boolean;
  reservation: Reservation;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, reservation, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirmCheckIn = async () => {
    setError('');
    setLoading(true);
    try {
      // Gọi service thực hiện BR03: Đổi phòng sang OCCUPIED, đơn sang CHECKED_IN
      await stayService.checkIn(reservation.id);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi nhận phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', width: '100%', maxWidth: '440px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          [BR03] Xác nhận Nhận Phòng {reservation.roomNumber}
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Hệ thống sẽ cập nhật trạng thái phòng sang <b>OCCUPIED</b> và khởi tạo bảng kê hóa đơn cho khách.
        </p>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
          <div>Khách nhận: <b>{reservation.guestInfo.fullName}</b></div>
          <div>CCCD/Hộ chiếu: <b>{reservation.guestInfo.idCard}</b></div>
          <div>Ngày check-in: <b>{formatDateVN(reservation.checkInDate)}</b></div>
          <div>Số lượng khách: <b>{reservation.guestCount} người</b></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Hủy bỏ</button>
          <button
            onClick={handleConfirmCheckIn}
            disabled={loading}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600 }}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận Check-in (OCCUPIED)'}
          </button>
        </div>
      </div>
    </div>
  );
};
