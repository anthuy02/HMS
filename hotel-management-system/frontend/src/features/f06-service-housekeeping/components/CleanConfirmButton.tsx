import React, { useState } from 'react';
import { serviceHkService } from '../../../api/services/serviceHk.service';

interface CleanConfirmButtonProps {
  roomId: string;
  roomNumber: string;
  onSuccess: () => void;
}

export const CleanConfirmButton: React.FC<CleanConfirmButtonProps> = ({ roomId, roomNumber, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleClean = async () => {
    if (!window.confirm(`Xác nhận phòng ${roomNumber} đã dọn dẹp sạch sẽ và sẵn sàng đón khách mới (AVAILABLE)?`)) {
      return;
    }
    setLoading(true);
    try {
      await serviceHkService.confirmRoomCleaned(roomId);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClean}
      disabled={loading}
      style={{
        padding: '6px 12px',
        backgroundColor: '#16a34a',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '12px',
      }}
    >
      {loading ? 'Đang cập nhật...' : '✓ Xác nhận Đã dọn xong (TC_HK_02)'}
    </button>
  );
};
