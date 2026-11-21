import React, { useState } from 'react';
import { Reservation } from '../../../types/reservation.types';
import { stayService } from '../../../api/services/stay.service';
import { calculateLateCheckOutFee } from '../../../utils/dateValidation';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { Invoice } from '../../../types/billing.types';

interface CheckOutModalProps {
  isOpen: boolean;
  reservation: Reservation;
  onClose: () => void;
  onSuccess: (invoice: Invoice) => void;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({ isOpen, reservation, onClose, onSuccess }) => {
  const [actualTime, setActualTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Giả lập tính toán phụ thu theo giờ nhập
  const mockDailyRate = (reservation.totalPrice || reservation.snapNightlyRate || 600000) / 2; // ước tính đơn giá ngày
  const [h, m] = actualTime.split(':').map(Number);
  const mockDate = new Date();
  mockDate.setHours(h || 12, m || 0, 0, 0);
  const lateInfo = calculateLateCheckOutFee(mockDailyRate, mockDate);

  const handleConfirmCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      // BR04 / BR-65: Check-out chuyển phòng sang CLEANING, tạo CleaningTask & tính phụ thu
      const result = await stayService.checkOut(reservation.id, mockDate.toISOString());
      onSuccess(result.invoice);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi trả phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', width: '100%', maxWidth: '460px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          [BR04 / BR-65] Trả Phòng {reservation.roomNumber} &amp; Chuyển sang CLEANING
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Giờ trả phòng tiêu chuẩn là 12:00 PM. Trả muộn sẽ tự động áp dụng biểu phí phụ thu (BR-43) và kích hoạt nhiệm vụ dọn phòng.
        </p>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Giờ trả phòng thực tế</label>
            <input
              type="time"
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>

          <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Chính sách phụ thu quá giờ [BR04 / BR-43]:</span>
              <b>{lateInfo.percentage}% đơn vị ngày</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tiền phụ thu trả muộn:</span>
              <CurrencyDisplay amount={lateInfo.surcharge} color={lateInfo.surcharge > 0 ? '#dc2626' : '#16a34a'} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Hủy</button>
          <button
            onClick={handleConfirmCheckout}
            disabled={loading}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600 }}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận Check-out (CLEANING)'}
          </button>
        </div>
      </div>
    </div>
  );
};
