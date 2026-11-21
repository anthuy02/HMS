import React, { useState } from 'react';
import { reservationService } from '../../../api/services/reservation.service';
import { Room, RoomType } from '../../../types/room.types';
import { BookingType } from '../../../types/reservation.types';
import { validateNightlyDates, validateHourlyBooking, getHourlyRateRatio } from '../../../utils/dateValidation';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [bookingType, setBookingType] = useState<BookingType>('NIGHTLY');
  const [roomType, setRoomType] = useState<RoomType>('STANDARD');
  const [checkInDate, setCheckInDate] = useState('2026-11-22');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-24');
  const [hourlyStartTime, setHourlyStartTime] = useState('09:00');
  const [hourlyDurationHours, setHourlyDurationHours] = useState(3);
  
  const [adultCount, setAdultCount] = useState(2);
  const [child6to11Count, setChild6to11Count] = useState(0);
  const [childUnder6Count, setChildUnder6Count] = useState(0);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const guestCount = adultCount + child6to11Count;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate theo loại đơn (BR-03, BR-04)
    if (bookingType === 'NIGHTLY') {
      const v = validateNightlyDates(checkInDate, checkOutDate);
      if (!v.isValid) {
        setError(v.error || 'Ngày lưu trú không hợp lệ.');
        return;
      }
    } else {
      const v = validateHourlyBooking(checkInDate, hourlyStartTime, hourlyDurationHours, guestCount);
      if (!v.isValid) {
        setError(v.error || 'Giờ thuê không hợp lệ.');
        return;
      }
    }

    setLoading(true);
    try {
      await reservationService.createReservation({
        bookingType,
        roomType,
        checkInDate,
        checkOutDate: bookingType === 'NIGHTLY' ? checkOutDate : checkInDate,
        hourlyStartTime: bookingType === 'HOURLY' ? hourlyStartTime : undefined,
        hourlyDurationHours: bookingType === 'HOURLY' ? hourlyDurationHours : undefined,
        adultCount,
        child6to11Count,
        childUnder6Count,
        guestCount,
        guestInfo: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        },
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
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', width: '100%', maxWidth: '600px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
          Tạo Đơn Đặt Phòng Mới (F03 - Hỗ trợ Nightly &amp; Hourly)
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
          Thu cọc 30% [BR-20], kiểm tra nguồn cung chống quá tải [BR-61, BR-64].
        </p>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Chọn loại đơn: NIGHTLY vs HOURLY */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Hình thức thuê [BR-05]:</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="bookingType"
                  value="NIGHTLY"
                  checked={bookingType === 'NIGHTLY'}
                  onChange={() => setBookingType('NIGHTLY')}
                />
                <b>Theo đêm (NIGHTLY)</b> - 1 đến 30 đêm
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="bookingType"
                  value="HOURLY"
                  checked={bookingType === 'HOURLY'}
                  onChange={() => setBookingType('HOURLY')}
                />
                <b>Theo giờ (HOURLY)</b> - 06:00 đến 22:00, tối đa 2 khách
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Loại phòng</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                <option value="STANDARD">STANDARD (Sức chứa 2 - 600.000 ₫)</option>
                <option value="DELUXE">DELUXE (Sức chứa 3 - 1.000.000 ₫)</option>
                <option value="SUITE">SUITE (Sức chứa 4 - 1.800.000 ₫)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Ngày nhận phòng</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>
          </div>

          {/* Form theo đêm hoặc theo giờ */}
          {bookingType === 'NIGHTLY' ? (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Ngày trả phòng [BR-03: Sau ngày nhận, 1-30 đêm]</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Giờ bắt đầu [06:00 - 22:00]</label>
                <input
                  type="time"
                  required
                  value={hourlyStartTime}
                  onChange={(e) => setHourlyStartTime(e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Số giờ thuê [1 - 10 giờ, kết thúc &le; 24:00]</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={hourlyDurationHours}
                  onChange={(e) => setHourlyDurationHours(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '2px' }}>
                  Tỷ lệ: {getHourlyRateRatio(hourlyDurationHours) * 100}% giá ngày
                </div>
              </div>
            </div>
          )}

          {/* Số lượng khách [BR-30, BR-31, BR-32] */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Người lớn (&ge;12t)</label>
              <input
                type="number"
                min={1}
                max={4}
                required
                value={adultCount}
                onChange={(e) => setAdultCount(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Trẻ 6-11t (+100k)</label>
              <input
                type="number"
                min={0}
                max={2}
                value={child6to11Count}
                onChange={(e) => setChild6to11Count(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Trẻ &lt;6t (Tối đa 2)</label>
              <input
                type="number"
                min={0}
                max={2}
                value={childUnder6Count}
                onChange={(e) => setChildUnder6Count(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>
          </div>

          {/* Thông tin khách hàng đại diện [BR-09] */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Thông tin khách hàng [BR-09]:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Họ và tên khách</label>
                <input
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Số điện thoại (9-11 số)</label>
                <input
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Email (tùy chọn)</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>
              Hủy
            </button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>
              {loading ? 'Đang tạo đơn...' : 'Xác nhận Đặt phòng & Thu cọc (30%)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
