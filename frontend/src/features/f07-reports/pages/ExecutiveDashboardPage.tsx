import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../../../api/services/report.service';
import { CurrencyDisplay } from '../../../components/common/CurrencyDisplay';
import { RevenueChart } from '../components/RevenueChart';

export const ExecutiveDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['executive-report'],
    queryFn: reportService.getRevenueReport,
  });

  if (isLoading || !data) return <div>Đang tổng hợp báo cáo...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
          [F07 - REP_01] Báo cáo Hoạt động &amp; Doanh thu Khách sạn (Executive Dashboard)
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Chỉ dành riêng cho cấp quản trị ADMIN và MANAGER theo dõi hiệu suất tài chính kỳ T.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TỔNG DOANH THU ĐÃ THU</div>
          <div style={{ marginTop: '8px' }}>
            <CurrencyDisplay amount={data.totalRevenue} fontSize="20px" color="#16a34a" />
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>DOANH THU DỰ KIẾN (KÈM DƯ NỢ)</div>
          <div style={{ marginTop: '8px' }}>
            <CurrencyDisplay amount={data.totalExpected} fontSize="20px" color="#0284c7" />
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CÔNG SUẤT PHÒNG HIỆN TẠI</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#ea580c', marginTop: '8px' }}>
            {data.occupancyRate}%
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{data.occupiedRooms} / {data.totalRooms} phòng có khách</div>
        </div>
      </div>

      <RevenueChart data={data.monthlyData} />
    </div>
  );
};
