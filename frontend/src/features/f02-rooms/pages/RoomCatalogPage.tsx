import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../../../api/services/room.service';
import { Room } from '../../../types/room.types';
import { RoomDiagramGrid } from '../components/RoomDiagramGrid';
import { RoomFormModal } from '../components/RoomFormModal';
import { RoleGate } from '../../../components/guards/RoleGate';

export const RoomCatalogPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getRooms,
  });

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>[F02] Sơ đồ & Quản lý Danh mục Phòng</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Trực quan hóa trạng thái 11 phòng (101 - 303) theo 3 tầng.</p>
        </div>
      </div>

      {isLoading ? (
        <div>Đang tải dữ liệu phòng...</div>
      ) : (
        <RoomDiagramGrid rooms={rooms} onSelectRoom={handleEditRoom} />
      )}

      {selectedRoom && (
        <RoomFormModal
          isOpen={isEditModalOpen}
          room={selectedRoom}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoom(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedRoom(null);
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
          }}
        />
      )}
    </div>
  );
};
