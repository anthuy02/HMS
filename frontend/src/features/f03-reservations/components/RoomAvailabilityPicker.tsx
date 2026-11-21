import React, { useState } from 'react';
import { Room } from '../../../types/room.types';
import { reservationService } from '../../../api/services/reservation.service';
import { validateReservationDates } from '../../../utils/dateValidation';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';

interface RoomAvailabilityPickerProps {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  selectedRoomId: string;
  onSelectRoom: (room: Room) => void;
}

export const RoomAvailabilityPicker: React.FC<RoomAvailabilityPickerProps> = ({
  checkInDate,
  checkOutDate,
  guestCount,
  selectedRoomId,
  onSelectRoom,
}) => {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    const dateVal = validateReservationDates(checkInDate, checkOutDate);
    if (!dateVal.isValid) {
      setError(dateVal.error || 'Ngày không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const rooms = await reservationService.checkAvailability({
        bookingType: 'NIGHTLY',
        checkInDate,
        checkOutDate,
        guestCount,
      });
      setAvailableRooms(rooms);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tra cứu phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
          [BR02] Bộ lọc phòng trống theo khoảng thời gian:
        </span>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !checkInDate || !checkOutDate}
          style={{ padding: '4px 12px', fontSize: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600 }}
        >
          {loading ? 'Đang kiểm tra...' : 'Tra cứu phòng trống'}
        </button>
      </div>

      {error && <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '8px' }}>{error}</div>}

      {searched && (
        <div style={{ marginTop: '8px' }}>
          {availableRooms.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#b91c1c', fontStyle: 'italic' }}>
              Không còn phòng nào trống thỏa mãn số lượng khách ({guestCount}) trong giai đoạn này.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
              {availableRooms.map((r) => {
                const isSelected = r.id === selectedRoomId;
                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRoom(r)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>P.{r.roomNumber}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{r.type}</div>
                    <CurrencyDisplay amount={r.pricePerNight} fontSize="11px" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
