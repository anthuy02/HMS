import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceHkService } from '../../../api/services/serviceHk.service';
import { roomService } from '../../../api/services/room.service';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';

export const RoomServiceOrderPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const { data: services = [] } = useQuery({
    queryKey: ['services-catalog'],
    queryFn: serviceHkService.getServicesCatalog,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getRooms,
  });

  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED');

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!selectedRoomNumber || !selectedServiceId) {
      setMsg({ text: 'Vui lòng chọn phòng và dịch vụ.', isError: true });
      return;
    }

    setLoading(true);
    try {
      await serviceHkService.orderService(selectedRoomNumber, selectedServiceId, quantity);
      setMsg({ text: `Đã thêm dịch vụ thành công vào hóa đơn phòng ${selectedRoomNumber}!` });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (err: any) {
      setMsg({ text: err.message || 'Lỗi khi gọi dịch vụ', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
          [F06 - TC_SVC_01] Gọi Dịch vụ Minibar &amp; Giặt ủi vào Phòng
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Dịch vụ phát sinh chỉ được phép gắn vào các phòng đang có khách lưu trú (<b>OCCUPIED</b>).
        </p>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', backgroundColor: msg.isError ? '#fee2e2' : '#dcfce7', color: msg.isError ? '#b91c1c' : '#15803d' }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleOrder} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Chọn Phòng nhận dịch vụ (Chỉ phòng OCCUPIED)</label>
          <select
            required
            value={selectedRoomNumber}
            onChange={(e) => setSelectedRoomNumber(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">-- Chọn phòng đang ở --</option>
            {occupiedRooms.map((r) => (
              <option key={r.id} value={r.roomNumber}>
                Phòng {r.roomNumber} ({r.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Chọn Dịch vụ / Nước uống</label>
          <select
            required
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">-- Chọn dịch vụ trong thực đơn --</option>
            {services.map((s: any) => (
              <option key={s.id} value={s.id}>
                [{s.category}] {s.name} - {s.price.toLocaleString()} ₫
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Số lượng</label>
          <input
            type="number"
            min={1}
            max={50}
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || occupiedRooms.length === 0}
          style={{
            marginTop: '8px',
            padding: '10px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          {loading ? 'Đang gửi order...' : 'Thêm vào Hóa đơn Phòng'}
        </button>
      </form>
    </div>
  );
};
