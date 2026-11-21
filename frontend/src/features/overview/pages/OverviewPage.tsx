import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentBooking {
  id: string;
  customerName: string;
  checkInDate: string;
  status: 'CHECKED_IN' | 'PENDING_CHECKIN' | 'PAID' | 'RESERVED';
  statusLabel: string;
}

interface TodaySchedule {
  time: string;
  customerName: string;
  roomNumber: string;
  action: 'CHECK_IN' | 'CHECK_OUT';
  actionLabel: string;
}

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDate, setActiveDate] = useState('Thứ 3, 28 Tháng 10, 2025');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // 1. KPI Metric Values (matching Figma 120, 86, 24, 48.500.000 VND)
  const kpiData = [
    {
      label: 'Tổng số phòng',
      value: '120',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#95785c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16" />
          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" />
          <path d="M6 8v4" />
        </svg>
      ),
    },
    {
      label: 'Phòng đang sử dụng',
      value: '86',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#95785c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      ),
    },
    {
      label: 'Đặt phòng hôm nay',
      value: '24',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#95785c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Doanh thu hôm nay',
      value: '48.500.000',
      suffix: 'VND',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#95785c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      ),
    },
  ];

  // 2. Revenue 7 Days Data (22/10 - 28/10)
  const revenueChartPoints = [
    { date: '22/10', amount: 20, x: 35, y: 135 },
    { date: '23/10', amount: 25, x: 95, y: 126 },
    { date: '24/10', amount: 42, x: 155, y: 92 },
    { date: '25/10', amount: 28, x: 215, y: 120 },
    { date: '26/10', amount: 72, x: 275, y: 40 },
    { date: '27/10', amount: 48, x: 335, y: 82 },
    { date: '28/10', amount: 55, x: 395, y: 68 },
  ];

  // SVG smooth spline path through the 7 points
  const splinePath = 'M 35 135 C 65 135, 75 126, 95 126 C 125 126, 135 92, 155 92 C 185 92, 195 120, 215 120 C 240 120, 255 40, 275 40 C 300 40, 315 82, 335 82 C 360 82, 375 68, 395 68';

  // 3. Recent Bookings Table Data (exact 5 rows from Figma)
  const recentBookings: RecentBooking[] = [
    { id: 'DP00123', customerName: 'Nguyễn Văn A', checkInDate: '28/10/2025', status: 'CHECKED_IN', statusLabel: 'Đã nhận phòng' },
    { id: 'DP00122', customerName: 'Trần Thị B', checkInDate: '28/10/2025', status: 'PENDING_CHECKIN', statusLabel: 'Chờ nhận phòng' },
    { id: 'DP00121', customerName: 'Lê Minh C', checkInDate: '27/10/2025', status: 'PAID', statusLabel: 'Đã thanh toán' },
    { id: 'DP00120', customerName: 'Phạm Thị D', checkInDate: '27/10/2025', status: 'RESERVED', statusLabel: 'Đã đặt phòng' },
    { id: 'DP00119', customerName: 'Hoàng Anh E', checkInDate: '26/10/2025', status: 'PAID', statusLabel: 'Đã thanh toán' },
  ];

  // 4. Today's Schedule Data (exact 4 rows from Figma)
  const todaySchedules: TodaySchedule[] = [
    { time: '08:00', customerName: 'Nguyễn Văn A', roomNumber: 'Phòng 101', action: 'CHECK_IN', actionLabel: 'Check-in' },
    { time: '10:30', customerName: 'Trần Thị B', roomNumber: 'Phòng 205', action: 'CHECK_IN', actionLabel: 'Check-in' },
    { time: '14:00', customerName: 'Lê Minh C', roomNumber: 'Phòng 302', action: 'CHECK_OUT', actionLabel: 'Check-out' },
    { time: '16:20', customerName: 'Phạm Thị D', roomNumber: 'Phòng 118', action: 'CHECK_IN', actionLabel: 'Check-in' },
  ];

  const getBadgeStyle = (status: RecentBooking['status']): React.CSSProperties => {
    switch (status) {
      case 'CHECKED_IN':
      case 'PAID':
        return {
          backgroundColor: '#e6f4ea',
          color: '#137333',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11.5px',
          fontWeight: 600,
          display: 'inline-block',
          whiteSpace: 'nowrap',
        };
      case 'PENDING_CHECKIN':
        return {
          backgroundColor: '#fef7e0',
          color: '#b06000',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11.5px',
          fontWeight: 600,
          display: 'inline-block',
          whiteSpace: 'nowrap',
        };
      case 'RESERVED':
        return {
          backgroundColor: '#e8f0fe',
          color: '#1a73e8',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11.5px',
          fontWeight: 600,
          display: 'inline-block',
          whiteSpace: 'nowrap',
        };
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ─────────────────────────────────────────────────────────────
          TOP GREETING & DATE PICKER BAR (Exact Figma Header Item)
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
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
            Xin chào, Admin!
          </h1>
          <p
            style={{
              fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
              fontSize: '13.5px',
              color: '#73675e',
              margin: 0,
            }}
          >
            Chào mừng bạn đến với hệ thống quản lý khách sạn.
          </p>
        </div>

        {/* Date Selector Pill (matching Figma) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #ede8de',
            borderRadius: '10px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#482e24',
            boxShadow: '0 1px 4px rgba(72, 46, 36, 0.04)',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#95785c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{activeDate}</span>
          <span style={{ color: '#ac9d8f', fontSize: '10px' }}>&bull;</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 1: 4 TOP KPI METRIC CARDS (Exact Figma values)
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '18px',
        }}
      >
        {kpiData.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '20px 22px',
              border: '1px solid #ede8de',
              boxShadow: '0 2px 6px rgba(72, 46, 36, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '115px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#73675e', fontWeight: 500 }}>
                {kpi.label}
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f7f1e7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {kpi.icon}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '12px' }}>
              <span
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#482e24',
                  lineHeight: 1,
                }}
              >
                {kpi.value}
              </span>
              {kpi.suffix && (
                <span
                  style={{
                    fontFamily: '"Nimbus Sans", sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#8c7a6b',
                  }}
                >
                  {kpi.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 2: TWO COLUMNS (Doanh thu 7 ngày | Đặt phòng gần đây)
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Column: Doanh thu 7 ngày gần nhất */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '22px 24px',
            border: '1px solid #ede8de',
            boxShadow: '0 2px 6px rgba(72, 46, 36, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2
              style={{
                fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
                fontSize: '15px',
                fontWeight: 700,
                color: '#482e24',
                margin: 0,
              }}
            >
              Doanh thu 7 ngày gần nhất
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#95785c',
                backgroundColor: '#f5efe6',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.4px',
              }}
            >
              VND (TRIỆU)
            </span>
          </div>

          {/* SVG Line Chart */}
          <div style={{ position: 'relative', width: '100%', height: '190px' }}>
            <svg
              viewBox="0 0 430 170"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {/* Horizontal Grid Lines */}
              {[
                { val: '80tr', y: 30 },
                { val: '60tr', y: 65 },
                { val: '40tr', y: 100 },
                { val: '20tr', y: 135 },
                { val: '0tr', y: 165 },
              ].map((grid, i) => (
                <g key={i}>
                  <text
                    x="0"
                    y={grid.y + 4}
                    fontSize="10"
                    fill="#9c8e82"
                    fontFamily='"Nimbus Sans", sans-serif'
                  >
                    {grid.val}
                  </text>
                  <line
                    x1="28"
                    y1={grid.y}
                    x2="420"
                    y2={grid.y}
                    stroke="#ede8de"
                    strokeWidth="1"
                    strokeDasharray={grid.val === '0tr' ? 'none' : '3 3'}
                  />
                </g>
              ))}

              {/* Spline Path */}
              <path
                d={splinePath}
                fill="none"
                stroke="#95785c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points with circles & interactive hover */}
              {revenueChartPoints.map((pt, idx) => {
                const isHovered = hoveredPoint === idx;
                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4.5}
                      fill="#ffffff"
                      stroke="#95785c"
                      strokeWidth={isHovered ? 3 : 2.5}
                      style={{ transition: 'all 0.15s ease' }}
                    />
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={pt.x - 28}
                          y={pt.y - 30}
                          width="56"
                          height="22"
                          rx="4"
                          fill="#482e24"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 15}
                          fill="#f8f5ec"
                          fontSize="11"
                          fontWeight="700"
                          textAnchor="middle"
                          fontFamily='"Nimbus Sans", sans-serif'
                        >
                          {pt.amount} tr
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* X-axis date labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingLeft: '32px',
              paddingRight: '10px',
              marginTop: '4px',
              fontSize: '11px',
              color: '#8c7a6b',
              fontWeight: 500,
            }}
          >
            {revenueChartPoints.map((pt, i) => (
              <span key={i}>{pt.date}</span>
            ))}
          </div>
        </div>

        {/* Right Column: Đặt phòng gần đây */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '22px 24px',
            border: '1px solid #ede8de',
            boxShadow: '0 2px 6px rgba(72, 46, 36, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2
              style={{
                fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
                fontSize: '15px',
                fontWeight: 700,
                color: '#482e24',
                margin: 0,
              }}
            >
              Đặt phòng gần đây
            </h2>
            <button
              onClick={() => navigate('/reservations')}
              style={{
                background: 'none',
                border: 'none',
                color: '#8c7a6b',
                fontSize: '12.5px',
                cursor: 'pointer',
                fontWeight: 500,
                padding: '2px 6px',
              }}
            >
              Chi tiết
            </button>
          </div>

          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.6fr 1.4fr 1.6fr',
              padding: '8px 12px',
              backgroundColor: '#f5efe6',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#8c7a6b',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            <div>MÃ ĐẶT PHÒNG</div>
            <div>KHÁCH HÀNG</div>
            <div>NGÀY NHẬN</div>
            <div style={{ textAlign: 'right' }}>TRẠNG THÁI</div>
          </div>

          {/* Table Rows (5 rows) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.6fr 1.4fr 1.6fr',
                  padding: '11px 12px',
                  alignItems: 'center',
                  borderBottom: '1px solid #f6f2ec',
                  fontSize: '12.5px',
                }}
              >
                <div style={{ fontWeight: 600, color: '#482e24' }}>{b.id}</div>
                <div style={{ color: '#482e24', fontWeight: 500 }}>{b.customerName}</div>
                <div style={{ color: '#73675e' }}>{b.checkInDate}</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={getBadgeStyle(b.status)}>{b.statusLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 3: TWO COLUMNS (Tình trạng phòng | Lịch đặt phòng hôm nay)
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Column: Tình trạng phòng (Donut Chart) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '22px 24px',
            border: '1px solid #ede8de',
            boxShadow: '0 2px 6px rgba(72, 46, 36, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2
            style={{
              fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: '#482e24',
              margin: '0 0 16px 0',
            }}
          >
            Tình trạng phòng
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flex: 1,
              padding: '10px 0',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            {/* SVG Donut Chart with center text */}
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg viewBox="0 0 160 160" width="160" height="160">
                {/* Background base circle */}
                <circle cx="80" cy="80" r="56" fill="none" stroke="#f5efe6" strokeWidth="22" />

                {/* Amber Slice: Phòng đang sử dụng (86/120 = 71.67%)
                    Circumference = 2 * PI * 56 ≈ 351.86
                    Length = 351.86 * 0.7167 ≈ 252.17 */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="none"
                  stroke="#ffd8a8"
                  strokeWidth="22"
                  strokeDasharray="250 352"
                  strokeDashoffset="60"
                  strokeLinecap="butt"
                />

                {/* Green Slice: Phòng trống (34/120 = 28.33%)
                    Length = 351.86 * 0.2833 ≈ 99.68 */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="none"
                  stroke="#0f8247"
                  strokeWidth="22"
                  strokeDasharray="98 352"
                  strokeDashoffset="-192"
                  strokeLinecap="butt"
                />
              </svg>

              {/* Center Content in Donut */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#482e24',
                    lineHeight: 1,
                  }}
                >
                  120
                </span>
                <span
                  style={{
                    fontFamily: '"Nimbus Sans", sans-serif',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#8c7a6b',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    marginTop: '3px',
                  }}
                >
                  TỔNG PHÒNG
                </span>
              </div>
            </div>

            {/* Legend on the right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0f8247', flexShrink: 0 }} />
                <span style={{ color: '#73675e' }}>Phòng trống: <b style={{ color: '#482e24' }}>34</b></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffd8a8', border: '1px solid #e5b376', flexShrink: 0 }} />
                <span style={{ color: '#73675e' }}>Phòng đang sử dụng: <b style={{ color: '#482e24' }}>86</b></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d8d8d8', flexShrink: 0 }} />
                <span style={{ color: '#73675e' }}>Phòng đang bảo trì: <b style={{ color: '#482e24' }}>0</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lịch đặt phòng hôm nay */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '22px 24px',
            border: '1px solid #ede8de',
            boxShadow: '0 2px 6px rgba(72, 46, 36, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2
              style={{
                fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
                fontSize: '15px',
                fontWeight: 700,
                color: '#482e24',
                margin: 0,
              }}
            >
              Lịch đặt phòng hôm nay
            </h2>
            <button
              onClick={() => navigate('/front-desk')}
              style={{
                background: 'none',
                border: 'none',
                color: '#8c7a6b',
                fontSize: '12.5px',
                cursor: 'pointer',
                fontWeight: 500,
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Xem tất cả</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* Schedule List Items (exact 4 rows from Figma) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todaySchedules.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#faf7f2',
                  border: '1px solid #f3eee4',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span
                    style={{
                      fontFamily: '"Nimbus Sans", sans-serif',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#482e24',
                      minWidth: '45px',
                    }}
                  >
                    {item.time}
                  </span>
                  <span style={{ fontSize: '13px', color: '#482e24', fontWeight: 500 }}>
                    {item.customerName} - {item.roomNumber}
                  </span>
                </div>

                {item.action === 'CHECK_IN' ? (
                  <button
                    onClick={() => navigate('/front-desk')}
                    style={{
                      backgroundColor: '#482e24',
                      color: '#f8f5ec',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(72, 46, 36, 0.2)',
                    }}
                  >
                    {item.actionLabel}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/front-desk')}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#482e24',
                      border: '1px solid #d9d5cc',
                      borderRadius: '8px',
                      padding: '6px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {item.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
