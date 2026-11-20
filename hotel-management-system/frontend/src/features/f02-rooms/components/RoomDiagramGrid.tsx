import React from 'react';
import { Room } from '../../../types/room.types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { RoleGate } from '../../../components/guards/RoleGate';

interface RoomDiagramGridProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export const RoomDiagramGrid: React.FC<RoomDiagramGridProps> = ({ rooms, onSelectRoom }) => {
  const floors = [3, 2, 1]; // Hiển thị từ tầng cao xuống tầng 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {floors.map((floor) => {
        const floorRooms = rooms.filter((r) => r.floor === floor);
        return (
          <div key={floor} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              Tầng {floor} ({floorRooms.length} phòng)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {floorRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '14px',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>P.{room.roomNumber}</span>
                    <StatusBadge status={room.status} />
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Loại phòng: <b>{room.type}</b> (Tối đa {room.maxCapacity} khách)
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <CurrencyDisplay amount={room.pricePerNight} fontSize="13px" />
                    <RoleGate allowedRoles={['ADMIN', 'MANAGER']}>
                      <button
                        onClick={() => onSelectRoom(room)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        Sửa giá (ROOM_01)
                      </button>
                    </RoleGate>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
