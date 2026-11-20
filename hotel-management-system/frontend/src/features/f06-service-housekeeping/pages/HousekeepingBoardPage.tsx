import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceHkService } from '../../../api/services/serviceHk.service';
import { CleanConfirmButton } from '../components/CleanConfirmButton';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const HousekeepingBoardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: dirtyRooms = [], isLoading } = useQuery({
    queryKey: ['dirty-rooms'],
    queryFn: serviceHkService.getDirtyRooms,
  });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
          [F06 - TC_HK_01] Bảng Điều phối Dọn Buồng phòng (Housekeeping Board)
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Chỉ hiển thị các phòng có trạng thái <b>DIRTY</b> chờ dọn dẹp theo quy tắc [BR07].
        </p>
      </div>

      {isLoading ? (
        <div>Đang tải danh sách phòng cần dọn...</div>
      ) : dirtyRooms.length === 0 ? (
        <div style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '10px', textAlign: 'center', color: '#16a34a', border: '1px solid #dcfce7' }}>
          🎉 Tất cả các phòng đã được dọn sạch sẽ (Không còn phòng DIRTY nào).
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {dirtyRooms.map((room) => (
            <div
              key={room.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid #d8b4fe',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#7e22ce' }}>Phòng {room.roomNumber}</span>
                <StatusBadge status={room.status} />
              </div>

              <div style={{ fontSize: '13px', color: '#475569' }}>
                <div>Tầng: <b>Tầng {room.floor}</b></div>
                <div>Loại phòng: <b>{room.type}</b></div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{room.description}</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3e8ff' }}>
                <CleanConfirmButton
                  roomId={room.id}
                  roomNumber={room.roomNumber}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['dirty-rooms'] });
                    queryClient.invalidateQueries({ queryKey: ['rooms'] });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
