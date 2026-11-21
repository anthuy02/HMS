import React, { useState, useEffect } from 'react';
import { Room, RoomType, RoomStatus } from '../../../types/room.types';
import { roomService } from '../../../api/services/room.service';
import { useAuth } from '../../../app/providers/AuthProvider';

interface RoomFormModalProps {
  isOpen: boolean;
  room?: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({ isOpen, room, onClose, onSuccess }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';
  const isManager = currentRole === 'MANAGER';
  const isCreate = !room;

  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [type, setType] = useState<RoomType>('STANDARD');
  const [pricePerNight, setPricePerNight] = useState(1000000);
  const [maxCapacity, setMaxCapacity] = useState(2);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber);
      setFloor(room.floor);
      setType(room.type);
      setPricePerNight(room.pricePerNight);
      setMaxCapacity(room.maxCapacity);
      setDescription(room.description || '');
    } else {
      setRoomNumber('');
      setFloor(1);
      setType('STANDARD');
      setPricePerNight(1000000);
      setMaxCapacity(2);
      setDescription('');
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isCreate && !isManager) {
      setError('Quy tắc [BR-101, BR-75]: Chỉ có MANAGER mới được quyền chỉnh sửa giá phòng! ADMIN chỉ có quyền xem.');
      return;
    }

    setLoading(true);
    try {
      if (isCreate) {
        await roomService.createRoom(
          {
            roomNumber: roomNumber.trim(),
            floor: Number(floor),
            type,
            pricePerNight: Number(pricePerNight),
            maxCapacity: Number(maxCapacity),
            status: 'AVAILABLE',
            description: description.trim(),
          },
          currentRole
        );
      } else if (room) {
        await roomService.updateRoom(
          room.id,
          {
            pricePerNight: Number(pricePerNight),
            maxCapacity: Number(maxCapacity),
            description: description.trim(),
          },
          currentRole
        );
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(72, 46, 36, 0.4)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(72, 46, 36, 0.15)',
          border: '1px solid #ebd9c8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#482e24',
                margin: '0 0 4px',
              }}
            >
              {isCreate ? 'Thêm phòng mới' : `Chỉnh sửa phòng ${room?.roomNumber}`}
            </h3>
            <p style={{ fontSize: '12px', color: '#8c7e74', margin: 0 }}>
              {isCreate ? 'Nhập thông tin cơ sở buồng phòng và bảng giá' : `Loại phòng hiện tại: ${room?.type}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#8c7e74',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {!isCreate && !isManager && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fffbeb',
              color: '#b45309',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
              border: '1px solid #fef3c7',
              lineHeight: 1.4,
            }}
          >
            ⚠️ <b>Quy tắc BR-101:</b> Giá phòng chỉ do <b>MANAGER</b> cập nhật. Vai trò hiện tại của bạn ({currentRole}) chỉ có quyền XEM.
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              color: '#ba1a1a',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isCreate && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                  Số phòng *
                </label>
                <input
                  required
                  placeholder="Ví dụ: 104, 203..."
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ebd9c8',
                    backgroundColor: '#fdfbf7',
                    fontSize: '13px',
                    color: '#482e24',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                  Tầng
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ebd9c8',
                    backgroundColor: '#fdfbf7',
                    fontSize: '13px',
                    color: '#482e24',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {isCreate && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                Hạng phòng (Room Type)
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const t = e.target.value as RoomType;
                  setType(t);
                  if (t === 'STANDARD') {
                    setPricePerNight(1000000);
                    setMaxCapacity(2);
                  } else if (t === 'DELUXE') {
                    setPricePerNight(1500000);
                    setMaxCapacity(3);
                  } else if (t === 'SUITE') {
                    setPricePerNight(2500000);
                    setMaxCapacity(4);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ebd9c8',
                  backgroundColor: '#fdfbf7',
                  fontSize: '13px',
                  color: '#482e24',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="STANDARD">Standard - Tiêu chuẩn (600k - 1tr)</option>
                <option value="DELUXE">Deluxe - Cao cấp (1tr - 1.5tr)</option>
                <option value="SUITE">Suite - Hoàng gia (1.8tr - 2.5tr)</option>
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                Đơn giá 1 đêm (VNĐ) {!isCreate && !isManager && '(Khóa)'}
              </label>
              <input
                type="number"
                step={50000}
                min={100000}
                required
                disabled={!isCreate && !isManager}
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ebd9c8',
                  backgroundColor: !isCreate && !isManager ? '#f3eee8' : '#fdfbf7',
                  fontSize: '13px',
                  color: '#482e24',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                Sức chứa tối đa (người)
              </label>
              <input
                type="number"
                min={1}
                max={6}
                required
                disabled={!isCreate && !isManager}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ebd9c8',
                  backgroundColor: !isCreate && !isManager ? '#f3eee8' : '#fdfbf7',
                  fontSize: '13px',
                  color: '#482e24',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
              Mô tả &amp; Tiện nghi phòng
            </label>
            <textarea
              rows={2}
              disabled={!isCreate && !isManager}
              placeholder="Ví dụ: Giường King, view ban công, bồn tắm nằm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #ebd9c8',
                backgroundColor: !isCreate && !isManager ? '#f3eee8' : '#fdfbf7',
                fontSize: '13px',
                color: '#482e24',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #ebd9c8',
                backgroundColor: '#ffffff',
                color: '#6d5b52',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            {(isCreate || isManager) && (
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#482e24',
                  color: '#f8f5ec',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(72, 46, 36, 0.2)',
                }}
              >
                {loading ? 'Đang lưu...' : isCreate ? 'Tạo phòng mới' : 'Lưu thay đổi'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
