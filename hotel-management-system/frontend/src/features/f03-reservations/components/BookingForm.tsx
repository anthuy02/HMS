import React, { useState } from 'react';
import { reservationService } from '../../../api/services/reservation.service';
import { Room } from '../../../types/room.types';
import { RoomAvailabilityPicker } from './RoomAvailabilityPicker';
import { validateReservationDates } from '../../../utils/dateValidation';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-11-20');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-22');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // BR01 Validation
    const dateVal = validateReservationDates(checkInDate, checkOutDate);
    if (!dateVal.isValid) {
      setError(dateVal.error || 'Lỗi ngày lưu trú');
      return;
    }

    if (!selectedRoom) {
      setError('Vui lòng chọn phòng trống từ bộ lọc.');
      return;
    }

    if (guestCount > selectedRoom.maxCapacity) {
      setError(`Số khách (${guestCount}) vượt quá sức chứa tối đa (${selectedRoom.maxCapacity}) của phòng.`);
      return;
    }

    setLoading(true);
    try {
      await reservationService.createReservation({
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        guestInfo: { fullName, idCard, phone, email },
        checkInDate,
        checkOutDate,
        guestCount,
        notes,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo đơn đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', width: '100%', maxWidth: '580px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Tạo Đơn Đặt Phòng Mới (RES_01)</h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Quy tắc [BR01]: Check-out &gt; Check-in ít nhất 1 đêm &amp; không quá sức chứa.</p>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Ngày nhận phòng (Check-in)</label>
              <input type="date" required value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Ngày trả phòng (Check-out)</label>
              <input type="date" required value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Số lượng khách</label>
              <input type="number" min={1} max={10} required value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Phòng đã chọn</label>
              <div style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                {selectedRoom ? `P.${selectedRoom.roomNumber} - ${selectedRoom.type}` : 'Chưa chọn phòng'}
              </div>
            </div>
          </div>

          <RoomAvailabilityPicker
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guestCount={guestCount}
            selectedRoomId={selectedRoom?.id || ''}
            onSelectRoom={(r) => setSelectedRoom(r)}
          />

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Thông tin khách hàng đại diện:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Họ và tên</label>
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Số CCCD / Hộ chiếu</label>
                <input required value={idCard} onChange={(e) => setIdCard(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Số điện thoại</label>
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Hủy</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>
              {loading ? 'Đang tạo đơn...' : 'Xác nhận Đặt phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
