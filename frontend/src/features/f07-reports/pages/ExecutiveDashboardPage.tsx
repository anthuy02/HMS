import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../../../api/services/report.service';

interface DailyRevenue {
  date: string;
  amount: number; // in million VND
}

const DAILY_DATA: DailyRevenue[] = [
  { date: '22/10', amount: 20 },
  { date: '23/10', amount: 35 },
  { date: '24/10', amount: 45 },
  { date: '25/10', amount: 55 },
  { date: '26/10', amount: 40 },
  { date: '27/10', amount: 48 },
  { date: '28/10', amount: 62 },
];

const TOP_CUSTOMERS = [
  { rank: 1, name: 'Nguyễn Văn A', spent: 3500000 },
  { rank: 2, name: 'Trần Thị B', spent: 2800000 },
  { rank: 3, name: 'Lê Minh C', spent: 2500000 },
];

export const ExecutiveDashboardPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('01/10/2026 - 31/10/2026');

  const { data: reportData } = useQuery({
    queryKey: ['executive-report'],
    queryFn: reportService.getRevenueReport,
  });

  const totalRevenue = reportData?.totalRevenue ? reportData.totalRevenue : 48500000;
  const occupancyRate = reportData?.occupancyRate ? reportData.occupancyRate : 72;
  const totalBookings = 124;

  const handleExport = () => {
    alert('Đang tải xuống báo cáo tổng hợp doanh thu và công suất phòng (.xlsx)...');
  };

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      {/* Title */}
      <div style={{ marginBottom: '22px' }}>
        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#482e24',
            lineHeight: 1.15,
            margin: '0',
            letterSpacing: '-0.3px',
          }}
        >
          Báo cáo
        </h1>
      </div>

      {/* Control Bar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search / Category Filter */}
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
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
            placeholder="Chọn loại phòng, hình thức phòng..."
            value={selectedFilter === 'ALL' ? '' : selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
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

        {/* Date Range Picker Dropdown */}
        <div style={{ minWidth: '220px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#ede5d8',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#482e24',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{dateRange}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* Export Report Button */}
        <button
          onClick={handleExport}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#482e24',
            color: '#f8f5ec',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(72, 46, 36, 0.2)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#362118')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#482e24')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* TOP ROW: Revenue Bar Chart (Left) + KPI Summary (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Doanh thu theo ngày - Bar Chart */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px 26px',
            border: '1px solid #ebd9c8',
            boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#362118',
              margin: '0 0 20px',
            }}
          >
            Doanh thu theo ngày
          </h3>

          {/* Bar Chart Container */}
          <div style={{ display: 'flex', height: '200px', alignItems: 'flex-end', position: 'relative' }}>
            {/* Y-axis Labels & Grid Lines */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                paddingRight: '12px',
                fontSize: '11px',
                color: '#95785c',
                fontWeight: 500,
                width: '40px',
                textAlign: 'right',
              }}
            >
              <span>80tr</span>
              <span>60tr</span>
              <span>40tr</span>
              <span>20tr</span>
              <span>0tr</span>
            </div>

            {/* Bars Area with Grid Lines */}
            <div
              style={{
                flex: 1,
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                paddingBottom: '24px',
                borderBottom: '1px solid #f2ece3',
              }}
            >
              {/* Background Grid Lines */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', backgroundColor: '#f5efe6' }} />
              <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '1px', backgroundColor: '#f5efe6' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#f5efe6' }} />
              <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '1px', backgroundColor: '#f5efe6' }} />

              {/* Bars */}
              {DAILY_DATA.map((item, idx) => {
                const maxVal = 80;
                const barHeightPercent = (item.amount / maxVal) * 100;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      zIndex: 2,
                    }}
                  >
                    <div
                      title={`${item.date}: ${item.amount} triệu`}
                      style={{
                        width: '26px',
                        height: `${barHeightPercent}%`,
                        backgroundColor: '#b88d57',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease, background-color 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9e733e')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#b88d57')}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        fontSize: '11px',
                        color: '#8c7e74',
                        fontWeight: 500,
                      }}
                    >
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KPI Summary Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px 26px',
            border: '1px solid #ebd9c8',
            boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Metric 1: Tổng doanh thu */}
          <div>
            <div style={{ fontSize: '13px', color: '#8c7e74', fontWeight: 500 }}>Tổng doanh thu</div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '26px',
                fontWeight: 700,
                color: '#362118',
                marginTop: '4px',
              }}
            >
              {totalRevenue.toLocaleString('vi-VN')} VND
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f2ece3', margin: '14px 0' }} />

          {/* Metric 2: Công suất phòng */}
          <div>
            <div style={{ fontSize: '13px', color: '#8c7e74', fontWeight: 500 }}>Công suất phòng</div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                fontWeight: 700,
                color: '#362118',
                marginTop: '4px',
              }}
            >
              {occupancyRate}%
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f2ece3', margin: '14px 0' }} />

          {/* Metric 3: Số lượt đặt phòng */}
          <div>
            <div style={{ fontSize: '13px', color: '#8c7e74', fontWeight: 500 }}>Số lượt đặt phòng</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#362118',
                }}
              >
                {totalBookings}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: '12px',
                  padding: '3px 8px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                ↑ 12%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Revenue by Room Type (Left) + Top Customers (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        {/* Doanh thu theo loại phòng - Donut Chart */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px 26px',
            border: '1px solid #ebd9c8',
            boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#362118',
              margin: '0 0 20px',
            }}
          >
            Doanh thu theo loại phòng
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            {/* Donut Chart SVG */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="130" height="130" viewBox="0 0 100 100">
                {/* Standard: 45% (0 to 162 deg) */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#b48450"
                  strokeWidth="20"
                  strokeDasharray="99 121"
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
                {/* Deluxe: 35% (162 to 288 deg) */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#8c673d"
                  strokeWidth="20"
                  strokeDasharray="77 143"
                  strokeDashoffset="-99"
                  transform="rotate(-90 50 50)"
                />
                {/* Suite: 20% (288 to 360 deg) */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#2d6a4f"
                  strokeWidth="20"
                  strokeDasharray="44 176"
                  strokeDashoffset="-176"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#b48450' }} />
                <span style={{ fontSize: '13.5px', color: '#482e24', width: '80px' }}>Standard</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#362118' }}>45%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8c673d' }} />
                <span style={{ fontSize: '13.5px', color: '#482e24', width: '80px' }}>Deluxe</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#362118' }}>35%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2d6a4f' }} />
                <span style={{ fontSize: '13.5px', color: '#482e24', width: '80px' }}>Suite</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#362118' }}>20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Khách hàng */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px 26px',
            border: '1px solid #ebd9c8',
            boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#362118',
              margin: '0 0 20px',
            }}
          >
            Top khách hàng
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {TOP_CUSTOMERS.map((cust) => (
              <div
                key={cust.rank}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '14px', color: '#362118', fontWeight: 500 }}>
                  <span style={{ color: '#8c7e74', marginRight: '6px' }}>{cust.rank}.</span>
                  {cust.name}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#362118' }}>
                  {cust.spent.toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
