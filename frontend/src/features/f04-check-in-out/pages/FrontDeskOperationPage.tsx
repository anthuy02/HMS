import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reservationService } from '../../../api/services/reservation.service';
import { stayService } from '../../../api/services/stay.service';
import { roomService } from '../../../api/services/room.service';
import { Reservation } from '../../../types/reservation.types';
import { CheckInModal } from '../components/CheckInModal';
import { CheckOutModal } from '../components/CheckOutModal';

interface CheckInRow {
  id: string;
  reservationCode: string;
  customerName: string;
  roomNumber: string;
  time: string;
  rawRes?: Reservation;
}

interface CheckOutRow {
  id: string;
  reservationCode: string;
  customerName: string;
  roomNumber: string;
  scheduledTime: string;
  timeSubtitle?: string;
  isLate?: boolean;
  lateBadgeText?: string;
  isCompleted?: boolean;
  completedText?: string;
  stayStatus: 'STAYING' | 'PENDING_PAYMENT' | 'CHECKED_OUT';
  stayStatusLabel: string;
  rawRes?: Reservation;
}

export const FrontDeskOperationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: CHECK_IN (default) vs CHECK_OUT
  const initialTab = (searchParams.get('tab') as 'CHECK_IN' | 'CHECK_OUT') || 'CHECK_IN';
  const [activeTab, setActiveTab] = useState<'CHECK_IN' | 'CHECK_OUT'>(initialTab);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('28/10/2026');

  // Modals
  const [selectedCheckInRes, setSelectedCheckInRes] = useState<Reservation | null>(null);
  const [selectedCheckOutRes, setSelectedCheckOutRes] = useState<Reservation | null>(null);

  // TanStack Queries
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationService.getReservations,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getRooms,
  });

  // 1. Dataset for Check-in (Exact 4 rows from Figma Image 1)
  const defaultCheckInRows: CheckInRow[] = [
    { id: 'res-123', reservationCode: 'DP00123', customerName: 'Nguyễn Văn A', roomNumber: '101', time: '14:00' },
    { id: 'res-122', reservationCode: 'DP00122', customerName: 'Trần Thị B', roomNumber: '205', time: '14:30' },
    { id: 'res-121', reservationCode: 'DP00121', customerName: 'Lê Minh C', roomNumber: '302', time: '15:00' },
    { id: 'res-120', reservationCode: 'DP00120', customerName: 'Phạm Thị D', roomNumber: '118', time: '16:00' },
  ];

  // 2. Dataset for Check-out (Exact 4 rows from Figma Image 2)
  const defaultCheckOutRows: CheckOutRow[] = [
    {
      id: 'res-123',
      reservationCode: 'DP00123',
      customerName: 'Nguyễn Văn A',
      roomNumber: '101',
      scheduledTime: '12:00',
      timeSubtitle: 'Hôm nay',
      stayStatus: 'STAYING',
      stayStatusLabel: 'Đang ở',
    },
    {
      id: 'res-120',
      reservationCode: 'DP00120',
      customerName: 'Phạm Thị D',
      roomNumber: '118',
      scheduledTime: '12:00',
      timeSubtitle: 'Hôm nay',
      stayStatus: 'STAYING',
      stayStatusLabel: 'Đang ở',
    },
    {
      id: 'res-119',
      reservationCode: 'DP00119',
      customerName: 'Hoàng Anh E',
      roomNumber: '201',
      scheduledTime: '14:15',
      isLate: true,
      lateBadgeText: 'Trễ 2h15',
      stayStatus: 'PENDING_PAYMENT',
      stayStatusLabel: 'Chờ thanh toán',
    },
    {
      id: 'res-115',
      reservationCode: 'DP00115',
      customerName: 'Lê Minh C',
      roomNumber: '302',
      scheduledTime: '10:00',
      isCompleted: true,
      completedText: 'Hoàn tất lúc 10:05',
      stayStatus: 'CHECKED_OUT',
      stayStatusLabel: 'Đã check-out',
    },
  ];

  // Handle Tab Switch
  const handleTabChange = (tab: 'CHECK_IN' | 'CHECK_OUT') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Perform Check-in action (BR-80, BR-81)
  const handleCheckInClick = (row: CheckInRow) => {
    const matched = reservations.find((r) => r.reservationCode === row.reservationCode || r.id === row.id);
    if (matched) {
      setSelectedCheckInRes(matched);
    } else {
      // Mock instant check-in for prototype
      alert(`Xác nhận Check-in thành công cho khách ${row.customerName} (Phòng ${row.roomNumber})! Phòng chuyển sang OCCUPIED.`);
    }
  };

  // Perform Check-out action (BR-84)
  const handleCheckOutClick = (row: CheckOutRow) => {
    const matched = reservations.find((r) => r.reservationCode === row.reservationCode || r.id === row.id);
    if (matched) {
      setSelectedCheckOutRes(matched);
    } else {
      // Direct prompt or action
      const confirmCheckOut = window.confirm(`Xác nhận trả phòng ${row.roomNumber} cho khách ${row.customerName}?\nPhòng sẽ tự động chuyển sang CLEANING để dọn dẹp.`);
      if (confirmCheckOut) {
        alert(`Check-out thành công phòng ${row.roomNumber}! Đã lập bảng kê hóa đơn và kích hoạt nhiệm vụ dọn phòng.`);
        navigate('/billing/INV-001');
      }
    }
  };

  // Filtered check-in items
  const filteredCheckInRows = useMemo(() => {
    if (!searchQuery.trim()) return defaultCheckInRows;
    const q = searchQuery.toLowerCase();
    return defaultCheckInRows.filter(
      (r) =>
        r.reservationCode.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.roomNumber.includes(q)
    );
  }, [searchQuery]);

  // Filtered check-out items
  const filteredCheckOutRows = useMemo(() => {
    if (!searchQuery.trim()) return defaultCheckOutRows;
    const q = searchQuery.toLowerCase();
    return defaultCheckOutRows.filter(
      (r) =>
        r.reservationCode.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.roomNumber.includes(q)
    );
  }, [searchQuery]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─────────────────────────────────────────────────────────────
          1. PAGE TITLE BAR
         ───────────────────────────────────────────────────────────── */}
      <div>
        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#482e24',
            lineHeight: 1.15,
            margin: '0 0 16px 0',
            letterSpacing: '-0.3px',
          }}
        >
          Check-in / Check-out
        </h1>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB SWITCHER (Check-in vs Check-out buttons)
         ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Tab 1: Check-in */}
        <button
          onClick={() => handleTabChange('CHECK_IN')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'CHECK_IN' ? '#301910' : '#f5efe6',
            color: activeTab === 'CHECK_IN' ? '#ffffff' : '#482e24',
            boxShadow: activeTab === 'CHECK_IN' ? '0 2px 6px rgba(48, 25, 16, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Check-in
        </button>

        {/* Tab 2: Check-out */}
        <button
          onClick={() => handleTabChange('CHECK_OUT')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'CHECK_OUT' ? '#301910' : '#f5efe6',
            color: activeTab === 'CHECK_OUT' ? '#ffffff' : '#482e24',
            boxShadow: activeTab === 'CHECK_OUT' ? '0 2px 6px rgba(48, 25, 16, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Check-out
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & DATE FILTER BAR (Matching Figma)
         ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search input with search icon */}
        <div style={{ position: 'relative', flex: '1 1 360px', minWidth: '260px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8c7a6b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm mã đặt phòng, khách hàng..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              backgroundColor: '#faf7f2',
              border: '1px solid #ede8de',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#482e24',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Date Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            backgroundColor: '#faf7f2',
            border: '1px solid #ede8de',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#482e24',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <span>{selectedDate}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#95785c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        {/* Filter Button [⛛ Lọc] */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            backgroundColor: '#482e24',
            border: 'none',
            borderRadius: '8px',
            color: '#f8f5ec',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(72, 46, 36, 0.2)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Lọc
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. TAB 1 CONTENT: CHECK-IN TABLE (Matching Figma Image 1)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'CHECK_IN' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #ede8de',
            boxShadow: '0 2px 8px rgba(72, 46, 36, 0.03)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5efe6', borderBottom: '1px solid #ede8de' }}>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    MÃ ĐẶT PHÒNG
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    KHÁCH HÀNG
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    PHÒNG
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    THỜI GIAN
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'right' }}>
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCheckInRows.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid #f6f2ec',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Mã đặt phòng */}
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#482e24', fontSize: '13.5px' }}>
                      {r.reservationCode}
                    </td>

                    {/* Khách hàng */}
                    <td style={{ padding: '14px 18px', color: '#482e24', fontWeight: 500, fontSize: '13.5px' }}>
                      {r.customerName}
                    </td>

                    {/* Phòng */}
                    <td style={{ padding: '14px 18px', color: '#482e24', fontSize: '13.5px' }}>
                      {r.roomNumber}
                    </td>

                    {/* Thời gian */}
                    <td style={{ padding: '14px 18px', color: '#482e24', fontSize: '13.5px' }}>
                      {r.time}
                    </td>

                    {/* Thao tác Check-in */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleCheckInClick(r)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #d9d5cc',
                          borderRadius: '8px',
                          color: '#482e24',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Check-in
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB 2 CONTENT: CHECK-OUT TABLE (Matching Figma Image 2)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'CHECK_OUT' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #ede8de',
            boxShadow: '0 2px 8px rgba(72, 46, 36, 0.03)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5efe6', borderBottom: '1px solid #ede8de' }}>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    MÃ ĐẶT PHÒNG
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    KHÁCH HÀNG
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    PHÒNG
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    THỜI GIAN TRẢ
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    TRẠNG THÁI LƯU TRÚ
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'right' }}>
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCheckOutRows.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid #f6f2ec',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Mã đặt phòng */}
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#482e24', fontSize: '13.5px' }}>
                      {r.reservationCode}
                    </td>

                    {/* Khách hàng */}
                    <td style={{ padding: '14px 18px', color: '#482e24', fontWeight: 500, fontSize: '13.5px' }}>
                      {r.customerName}
                    </td>

                    {/* Phòng */}
                    <td style={{ padding: '14px 18px', color: '#482e24', fontSize: '13.5px' }}>
                      {r.roomNumber}
                    </td>

                    {/* Thời gian trả */}
                    <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                      <div style={{ fontWeight: 700, color: '#482e24' }}>{r.scheduledTime}</div>
                      {r.timeSubtitle && (
                        <div style={{ fontSize: '11.5px', color: '#73675e', marginTop: '2px' }}>
                          {r.timeSubtitle}
                        </div>
                      )}
                      {r.isLate && r.lateBadgeText && (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#fce8e6',
                            color: '#c5221f',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            marginTop: '2px',
                          }}
                        >
                          {r.lateBadgeText}
                        </span>
                      )}
                      {r.isCompleted && r.completedText && (
                        <div style={{ fontSize: '11.5px', color: '#137333', fontWeight: 500, marginTop: '2px' }}>
                          {r.completedText}
                        </div>
                      )}
                    </td>

                    {/* Trạng thái lưu trú */}
                    <td style={{ padding: '14px 18px' }}>
                      {r.stayStatus === 'STAYING' && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#e8f0fe',
                            color: '#1a73e8',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a73e8' }} />
                          {r.stayStatusLabel}
                        </span>
                      )}

                      {r.stayStatus === 'PENDING_PAYMENT' && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#fef7e0',
                            color: '#b06000',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b06000' }} />
                          {r.stayStatusLabel}
                        </span>
                      )}

                      {r.stayStatus === 'CHECKED_OUT' && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#e6f4ea',
                            color: '#137333',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#137333' }} />
                          {r.stayStatusLabel}
                        </span>
                      )}
                    </td>

                    {/* Thao tác Check-out */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {r.stayStatus === 'STAYING' && (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => navigate('/service-orders')}
                            style={{
                              padding: '6px 14px',
                              backgroundColor: '#f5efe6',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#482e24',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            + Dịch vụ
                          </button>
                          <button
                            onClick={() => handleCheckOutClick(r)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 16px',
                              backgroundColor: '#482e24',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(72, 46, 36, 0.2)',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <span>&rarr;</span>
                            <span>Check-out</span>
                          </button>
                        </div>
                      )}

                      {r.stayStatus === 'PENDING_PAYMENT' && (
                        <button
                          onClick={() => navigate('/billing/INV-001')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 16px',
                            backgroundColor: '#b85d19',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(184, 93, 25, 0.25)',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                          Quyết toán
                        </button>
                      )}

                      {r.stayStatus === 'CHECKED_OUT' && (
                        <button
                          onClick={() => navigate('/billing/INV-001')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            backgroundColor: '#f5efe6',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#482e24',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                          Hóa đơn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer for Check-out table */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #ede8de',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '12.5px', color: '#73675e', fontFamily: '"Nimbus Sans", sans-serif' }}>
              Hiển thị <b>4</b> trên <b>18</b> phòng trả trong ngày
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ede8de',
                  backgroundColor: '#faf7f2',
                  color: '#8c7a6b',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Trước
              </button>
              <button
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#301910',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                1
              </button>
              <button
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #ede8de',
                  backgroundColor: '#faf7f2',
                  color: '#482e24',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                }}
              >
                2
              </button>
              <button
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ede8de',
                  backgroundColor: '#faf7f2',
                  color: '#482e24',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. MODALS
         ───────────────────────────────────────────────────────────── */}
      {selectedCheckInRes && (
        <CheckInModal
          isOpen={!!selectedCheckInRes}
          reservation={selectedCheckInRes}
          onClose={() => setSelectedCheckInRes(null)}
          onSuccess={() => {
            setSelectedCheckInRes(null);
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            alert(`Check-in thành công cho phòng ${selectedCheckInRes.roomNumber}!`);
          }}
        />
      )}

      {selectedCheckOutRes && (
        <CheckOutModal
          isOpen={!!selectedCheckOutRes}
          reservation={selectedCheckOutRes}
          onClose={() => setSelectedCheckOutRes(null)}
          onSuccess={(invoice) => {
            setSelectedCheckOutRes(null);
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
            navigate(`/billing/${invoice.id}`);
          }}
        />
      )}
    </div>
  );
};
