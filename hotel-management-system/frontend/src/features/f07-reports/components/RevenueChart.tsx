import React from 'react';
import { formatCurrencyVND } from '../../../utils/formatters';

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>
        Biểu đồ Doanh thu các Tháng Gần nhất (VNĐ)
      </h3>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '180px', paddingTop: '20px' }}>
        {data.map((item) => {
          const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
          return (
            <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                {Math.round(item.revenue / 1000000)}M
              </span>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(10, heightPercent)}%`,
                  backgroundColor: '#38bdf8',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginTop: '8px' }}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
