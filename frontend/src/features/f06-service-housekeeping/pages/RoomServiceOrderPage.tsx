import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceHkService } from '../../../api/services/serviceHk.service';
import { roomService } from '../../../api/services/room.service';

export const RoomServiceOrderPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'DAMAGE'>('CATALOG');

  // Form Service Catalog
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('103');
  const [selectedServiceCode, setSelectedServiceCode] = useState('MB01');
  const [quantity, setQuantity] = useState(1);

  // Form Damage (BR-36)
  const [damageRoomNumber, setDamageRoomNumber] = useState('103');
  const [damageAmount, setDamageAmount] = useState(200000);
  const [damageNote, setDamageNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const { data: catalog = [] } = useQuery({
    queryKey: ['services-catalog'],
    queryFn: serviceHkService.getCatalogItems,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getRooms,
  });

  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED');

  const handleOrderCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await serviceHkService.orderService(selectedRoomNumber, selectedServiceCode, quantity);
      setMsg({ text: `Đã thêm dịch vụ thành công vào hóa đơn phòng ${selectedRoomNumber}!` });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (err: any) {
      setMsg({ text: err.message || 'Lỗi khi gọi dịch vụ', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await serviceHkService.recordDamage(damageRoomNumber, damageAmount, damageNote);
      setMsg({ text: `Đã ghi nhận bồi thường hư hại tài sản vào phòng ${damageRoomNumber}!` });
      setDamageNote('');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (err: any) {
      setMsg({ text: err.message || 'Lỗi ghi nhận hư hao', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4px 8px 32px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '22px' }}>
        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#482e24',
            lineHeight: 1.15,
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px',
          }}
        >
          Gọi Dịch vụ Phòng &amp; Báo hỏng Hư hại
        </h1>
        <p
          style={{
            fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
            fontSize: '13.5px',
            color: '#73675e',
            margin: 0,
          }}
        >
          Ghi nhận dịch vụ minibar, giặt ủi và bồi thường hư hại tài sản phòng đang lưu trú.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', backgroundColor: msg.isError ? '#fee2e2' : '#dcfce7', color: msg.isError ? '#b91c1c' : '#15803d' }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('CATALOG')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'CATALOG' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'CATALOG' ? '#fff' : '#475569',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          Minibar &amp; Giặt ủi (BR-34, 35)
        </button>
        <button
          onClick={() => setActiveTab('DAMAGE')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'DAMAGE' ? '#dc2626' : '#e2e8f0',
            color: activeTab === 'DAMAGE' ? '#fff' : '#475569',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          Bồi thường Hư hao (BR-36)
        </button>
      </div>

      {activeTab === 'CATALOG' ? (
        <form onSubmit={handleOrderCatalog} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Chọn Phòng nhận dịch vụ (OCCUPIED)</label>
            <select
              required
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {occupiedRooms.map((r) => (
                <option key={r.id} value={r.roomNumber}>Phòng {r.roomNumber} ({r.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mặt hàng dịch vụ trong danh mục (BR-110)</label>
            <select
              required
              value={selectedServiceCode}
              onChange={(e) => setSelectedServiceCode(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {catalog.map((item) => (
                <option key={item.code} value={item.code}>
                  [{item.code}] {item.name} - {item.unitPrice.toLocaleString()} ₫
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Số lượng (1 - 99)</label>
            <input
              type="number"
              min={1}
              max={99}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || occupiedRooms.length === 0}
            style={{ padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}
          >
            {loading ? 'Đang gửi...' : 'Thêm vào Hóa đơn Phòng'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRecordDamage} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Chọn Phòng phát sinh hư hao (OCCUPIED)</label>
            <select
              required
              value={damageRoomNumber}
              onChange={(e) => setDamageRoomNumber(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {occupiedRooms.map((r) => (
                <option key={r.id} value={r.roomNumber}>Phòng {r.roomNumber} ({r.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tiền bồi thường (1 - 50.000.000 VNĐ) [BR-36]</label>
            <input
              type="number"
              min={1}
              max={50000000}
              step={10000}
              required
              value={damageAmount}
              onChange={(e) => setDamageAmount(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ghi chú giải trình (1 - 200 ký tự bắt buộc) [BR-36]</label>
            <textarea
              required
              rows={3}
              placeholder="Ví dụ: Vỡ ly rượu vang minibar, hỏng điều khiển TV..."
              value={damageNote}
              onChange={(e) => setDamageNote(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || occupiedRooms.length === 0}
            style={{ padding: '10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}
          >
            {loading ? 'Đang ghi nhận...' : 'Ghi nhận Khoản bồi thường vào Hóa đơn'}
          </button>
        </form>
      )}
    </div>
  );
};
