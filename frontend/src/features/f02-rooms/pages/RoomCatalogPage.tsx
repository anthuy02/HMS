import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../../../api/services/room.service';
import { Room, RoomStatus, RoomType } from '../../../types/room.types';
import { RoomFormModal } from '../components/RoomFormModal';
import { useAuth } from '../../../app/providers/AuthProvider';

// Room category preview photos matching luxury aesthetic
const ROOM_IMAGES: Record<RoomType, string> = {
  STANDARD: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=160&q=80',
  DELUXE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=160&q=80',
  SUITE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=160&q=80',
};

// Fallback seed rooms matching Figma node 9-556 if mockDb is clean
const FIGMA_DEFAULT_ROOMS: Room[] = [
  { id: 'r-101', roomNumber: '101', floor: 1, type: 'STANDARD', pricePerNight: 1000000, maxCapacity: 2, status: 'AVAILABLE', description: 'Phòng Standard tầng 1' },
  { id: 'r-102', roomNumber: '102', floor: 1, type: 'STANDARD', pricePerNight: 1000000, maxCapacity: 2, status: 'OCCUPIED', description: 'Phòng Standard có khách ở' },
  { id: 'r-103', roomNumber: '103', floor: 1, type: 'STANDARD', pricePerNight: 1000000, maxCapacity: 2, status: 'AVAILABLE', description: 'Phòng Standard tầng 1' },
  { id: 'r-201', roomNumber: '201', floor: 2, type: 'DELUXE', pricePerNight: 1500000, maxCapacity: 3, status: 'AVAILABLE', description: 'Phòng Deluxe ban công' },
  { id: 'r-202', roomNumber: '202', floor: 2, type: 'DELUXE', pricePerNight: 1500000, maxCapacity: 3, status: 'OCCUPIED', description: 'Phòng Deluxe có khách ở' },
  { id: 'r-203', roomNumber: '203', floor: 2, type: 'DELUXE', pricePerNight: 1500000, maxCapacity: 3, status: 'CLEANING', description: 'Phòng Deluxe đang dọn dẹp' },
  { id: 'r-301', roomNumber: '301', floor: 3, type: 'SUITE', pricePerNight: 2500000, maxCapacity: 4, status: 'AVAILABLE', description: 'Phòng Suite hoàng gia' },
  { id: 'r-302', roomNumber: '302', floor: 3, type: 'SUITE', pricePerNight: 2500000, maxCapacity: 4, status: 'OCCUPIED', description: 'Phòng Suite có khách ở' },
  { id: 'r-303', roomNumber: '303', floor: 3, type: 'SUITE', pricePerNight: 2500000, maxCapacity: 4, status: 'AVAILABLE', description: 'Phòng Suite hoàng gia' },
];

export const RoomCatalogPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Menu state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [activeMenuRoomId, setActiveMenuRoomId] = useState<string | null>(null);
  const [maintenanceRoom, setMaintenanceRoom] = useState<Room | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');

  const { data: dbRooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getRooms,
  });

  // Use dbRooms if available; if empty, fallback to Figma default rooms
  const allRooms = dbRooms.length > 0 ? dbRooms : FIGMA_DEFAULT_ROOMS;

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return allRooms.filter((r) => {
      // Search
      const matchSearch =
        !searchTerm.trim() ||
        r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase().trim());

      // Type filter
      const matchType = selectedType === 'ALL' || r.type === selectedType;

      // Status filter
      const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [allRooms, searchTerm, selectedType, selectedStatus]);

  // Pagination (9 items per page)
  const pageSize = 9;
  const totalPages = Math.ceil(filteredRooms.length / pageSize) || 1;
  const pagedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRooms.slice(start, start + pageSize);
  }, [filteredRooms, currentPage]);

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setIsFormModalOpen(true);
    setActiveMenuRoomId(null);
  };

  const handleSetOutOfService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceRoom) return;
    try {
      await roomService.setOutOfService(maintenanceRoom.id, maintenanceReason, currentRole);
      setMaintenanceRoom(null);
      setMaintenanceReason('');
      setActiveMenuRoomId(null);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đặt bảo trì phòng');
    }
  };

  const handleReturnToService = async (room: Room) => {
    if (!window.confirm(`Xác nhận đưa phòng ${room.roomNumber} trở lại hoạt động sẵn sàng (AVAILABLE)?`)) return;
    try {
      await roomService.returnToService(room.id, currentRole);
      setActiveMenuRoomId(null);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    } catch (err: any) {
      alert(err.message || 'Lỗi khi mở lại phòng');
    }
  };

  const handleSetCleaning = async (room: Room) => {
    try {
      await roomService.updateRoom(room.id, { status: 'CLEANING' }, currentRole);
      setActiveMenuRoomId(null);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    } catch (err: any) {
      alert(err.message || 'Lỗi khi chuyển trạng thái dọn dẹp');
    }
  };

  const renderStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 14px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Trống
          </span>
        );
      case 'OCCUPIED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 14px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Đang sử dụng
          </span>
        );
      case 'CLEANING':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 14px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Đang dọn dẹp
          </span>
        );
      case 'RESERVED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 14px',
              backgroundColor: '#ede9fe',
              color: '#7c3aed',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Đã giữ chỗ
          </span>
        );
      case 'OUT_OF_SERVICE':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 14px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Bảo trì
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      {/* Page Title & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
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
            Quản lý phòng
          </h1>
          <p
            style={{
              fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
              fontSize: '13.5px',
              color: '#73675e',
              margin: 0,
            }}
          >
            Danh mục kiểm soát cơ sở buồng phòng, tiện nghi và biểu giá theo thời gian thực.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#482e24',
            color: '#f8f5ec',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(72, 46, 36, 0.2)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#362118')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#482e24')}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
          <span>Thêm phòng</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#95785c',
              fontSize: '14px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm phòng (số phòng, loại phòng...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              backgroundColor: '#ede5d8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: '#482e24',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Room Type Dropdown */}
        <div style={{ position: 'relative', width: '200px' }}>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#ede5d8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: '#482e24',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">Tất cả loại phòng</option>
            <option value="STANDARD">Standard</option>
            <option value="DELUXE">Deluxe</option>
            <option value="SUITE">Suite</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div style={{ position: 'relative', width: '200px' }}>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#ede5d8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: '#482e24',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Trống (Available)</option>
            <option value="OCCUPIED">Đang sử dụng (Occupied)</option>
            <option value="CLEANING">Đang dọn dẹp (Cleaning)</option>
            <option value="RESERVED">Đã giữ chỗ (Reserved)</option>
            <option value="OUT_OF_SERVICE">Bảo trì (Out of Service)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
          border: '1px solid #ebd9c8',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#ede6da' }}>
              <th
                style={{
                  padding: '14px 24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '22%',
                }}
              >
                SỐ PHÒNG
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '20%',
                }}
              >
                LOẠI PHÒNG
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '22%',
                }}
              >
                GIÁ (VNĐ/ĐÊM)
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '22%',
                }}
              >
                TRẠNG THÁI
              </th>
              <th
                style={{
                  padding: '14px 24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  textAlign: 'right',
                  width: '14%',
                }}
              >
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#8c7e74' }}>
                  Đang tải danh sách phòng...
                </td>
              </tr>
            ) : pagedRooms.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#8c7e74' }}>
                  Không tìm thấy phòng phù hợp với điều kiện tìm kiếm.
                </td>
              </tr>
            ) : (
              pagedRooms.map((room) => {
                const roomTypeLabel =
                  room.type === 'STANDARD' ? 'Standard' : room.type === 'DELUXE' ? 'Deluxe' : 'Suite';
                const thumbnail = ROOM_IMAGES[room.type] || ROOM_IMAGES.STANDARD;

                return (
                  <tr
                    key={room.id}
                    style={{
                      borderBottom: '1px solid #f2ece3',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Room Thumbnail + Number */}
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={thumbnail}
                          alt={`Phòng ${room.roomNumber}`}
                          style={{
                            width: '46px',
                            height: '34px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid #ebd9c8',
                          }}
                        />
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#362118' }}>
                          {room.roomNumber}
                        </span>
                      </div>
                    </td>

                    {/* Room Type */}
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#482e24', fontWeight: 500 }}>
                      {roomTypeLabel}
                    </td>

                    {/* Price */}
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#362118', fontWeight: 600 }}>
                      {room.pricePerNight.toLocaleString('vi-VN')}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      {renderStatusBadge(room.status)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(room)}
                          title="Chỉnh sửa thông tin phòng"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6d5b52',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede5d8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>

                        {/* More Options Button */}
                        <button
                          onClick={() => setActiveMenuRoomId(activeMenuRoomId === room.id ? null : room.id)}
                          title="Tùy chọn khác"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6d5b52',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede5d8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1.5"></circle>
                            <circle cx="12" cy="12" r="1.5"></circle>
                            <circle cx="12" cy="19" r="1.5"></circle>
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuRoomId === room.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              backgroundColor: '#ffffff',
                              border: '1px solid #ebd9c8',
                              borderRadius: '8px',
                              boxShadow: '0 8px 24px rgba(72, 46, 36, 0.12)',
                              padding: '6px 0',
                              zIndex: 100,
                              minWidth: '190px',
                              textAlign: 'left',
                            }}
                          >
                            <button
                              onClick={() => handleOpenEditModal(room)}
                              style={{
                                width: '100%',
                                padding: '8px 14px',
                                background: 'none',
                                border: 'none',
                                fontSize: '13px',
                                color: '#482e24',
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Chỉnh sửa thông tin
                            </button>

                            {room.status !== 'OUT_OF_SERVICE' ? (
                              <button
                                onClick={() => {
                                  setMaintenanceRoom(room);
                                  setActiveMenuRoomId(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '13px',
                                  color: '#ba1a1a',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                Đặt bảo trì (OUT_OF_SERVICE)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReturnToService(room)}
                                style={{
                                  width: '100%',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '13px',
                                  color: '#15803d',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                Mở lại phòng (AVAILABLE)
                              </button>
                            )}

                            {room.status !== 'CLEANING' && room.status !== 'OCCUPIED' && (
                              <button
                                onClick={() => handleSetCleaning(room)}
                                style={{
                                  width: '100%',
                                  padding: '8px 14px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '13px',
                                  color: '#b45309',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fffbeb')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                Đổi sang dọn dẹp
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '16px 24px',
            borderTop: '1px solid #f2ece3',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #ebd9c8',
              backgroundColor: '#ffffff',
              color: '#6d5b52',
              fontSize: '13px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: currentPage === pageNum ? '#482e24' : 'transparent',
                color: currentPage === pageNum ? '#ffffff' : '#6d5b52',
                fontSize: '13px',
                fontWeight: currentPage === pageNum ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #ebd9c8',
              backgroundColor: '#ffffff',
              color: '#6d5b52',
              fontSize: '13px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Room Create / Edit Modal */}
      <RoomFormModal
        isOpen={isFormModalOpen}
        room={editingRoom}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRoom(null);
        }}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setEditingRoom(null);
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }}
      />

      {/* Maintenance OUT_OF_SERVICE Modal (BR-104) */}
      {maintenanceRoom && (
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
              maxWidth: '460px',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(72, 46, 36, 0.15)',
              border: '1px solid #ebd9c8',
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#482e24',
                margin: '0 0 6px',
              }}
            >
              Đặt phòng {maintenanceRoom.roomNumber} bảo trì
            </h3>
            <p style={{ fontSize: '12px', color: '#8c7e74', margin: '0 0 16px', lineHeight: 1.4 }}>
              Quy tắc [BR-104]: Bắt buộc nhập lý do bảo trì giải trình (1 - 200 ký tự). Trạng thái phòng sẽ chuyển sang <b>OUT_OF_SERVICE</b>.
            </p>

            <form onSubmit={handleSetOutOfService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                  Lý do bảo trì *
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={200}
                  placeholder="Ví dụ: Sửa đường ống nước vệ sinh, bảo dưỡng điều hòa..."
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ebd9c8',
                    backgroundColor: '#fdfbf7',
                    fontSize: '13px',
                    color: '#482e24',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none',
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#95785c', marginTop: '2px' }}>
                  {maintenanceReason.length}/200 ký tự
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMaintenanceRoom(null);
                    setMaintenanceReason('');
                  }}
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
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ba1a1a',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(186, 26, 26, 0.2)',
                  }}
                >
                  Xác nhận bảo trì
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
