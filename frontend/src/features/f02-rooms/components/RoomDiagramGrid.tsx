import React from 'react';
import { Room } from '../../../types/room.types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { RoleGate } from '../../../components/guards/RoleGate';

interface RoomDiagramGridProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onSetOutOfService: (room: Room) => void;
  onReturnToService: (room: Room) => void;
}

export const RoomDiagramGrid: React.FC<RoomDiagramGridProps> = ({
  rooms,
  onSelectRoom,
  onSetOutOfService,
  onReturnToService,
}) => {
  const floors = [3, 2, 1]; // Tầng 3 xuống Tầng 1 (Đúng 6 phòng chuẩn)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {floors.map((floor) => {
        const floorRooms = rooms.filter((r) => r.floor === floor);
        return (
          <div key={floor} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              Tầng {floor} ({floorRooms.length} phòng)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {floorRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '14px',
                    backgroundColor: room.status === 'OUT_OF_SERVICE' ? '#f8fafc' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Phòng {room.roomNumber}</span>
                    <StatusBadge status={room.status} />
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Loại: <b>{room.type}</b> (Sức chứa tối đa: {room.maxCapacity} khách)
                  </div>

                  {room.maintenanceReason && (
                    <div style={{ fontSize: '11px', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                      Lý do bảo trì: {room.maintenanceReason}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <CurrencyDisplay amount={room.pricePerNight} fontSize="13px" />
                    <div style={{ display: 'flex', gap: '6px' }}>
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
                        Chi tiết / Giá
                      </button>

                      {/* Nút đặt bảo trì OUT_OF_SERVICE cho Admin & Manager (BR-69, BR-104) */}
                      <RoleGate allowedRoles={['ADMIN', 'MANAGER']}>
                        {room.status === 'OUT_OF_SERVICE' ? (
                          <button
                            onClick={() => onReturnToService(room)}
                            style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600 }}
                          >
                            Mở lại
                          </button>
                        ) : (
                          (room.status === 'AVAILABLE' || room.status === 'CLEANING') && (
                            <button
                              onClick={() => onSetOutOfService(room)}
                              style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600 }}
                            >
                              Bảo trì
                            </button>
                          )
                        )}
                      </RoleGate>
                    </div>
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
