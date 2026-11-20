import React, { useState } from 'react';
import { Room, RoomType } from '../../../types/room.types';
import { roomService } from '../../../api/services/room.service';

interface RoomFormModalProps {
  isOpen: boolean;
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({ isOpen, room, onClose, onSuccess }) => {
  const [pricePerNight, setPricePerNight] = useState(room.pricePerNight);
  const [type, setType] = useState<RoomType>(room.type);
  const [maxCapacity, setMaxCapacity] = useState(room.maxCapacity);
  const [description, setDescription] = useState(room.description || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await roomService.updateRoom(room.id, {
        pricePerNight,
        type,
        maxCapacity,
        description,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', width: '100%', maxWidth: '440px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
          [ROOM_01] Chỉnh sửa Thông tin Phòng {room.roomNumber}
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
          Chỉ dành cho ADMIN & MANAGER thiết lập giá và cấu hình phòng.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Đơn giá 1 đêm (VNĐ)</label>
            <input
              type="number"
              step={10000}
              required
              value={pricePerNight}
              onChange={(e) => setPricePerNight(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Loại phòng</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RoomType)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            >
              <option value="STANDARD">STANDARD</option>
              <option value="DELUXE">DELUXE</option>
              <option value="SUITE">SUITE</option>
              <option value="PRESIDENTIAL">PRESIDENTIAL</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Sức chứa tối đa (người)</label>
            <input
              type="number"
              min={1}
              max={10}
              required
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Mô tả tiện ích</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Hủy</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
