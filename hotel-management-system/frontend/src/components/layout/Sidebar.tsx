import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

interface MenuItem {
  to: string;
  label: string;
  module: string;
  roles: string[];
}

const MENU_ITEMS: MenuItem[] = [
  { to: '/rooms', label: 'Sơ đồ & Danh mục phòng', module: '[F02]', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'] },
  { to: '/reservations', label: 'Quản lý Đặt phòng', module: '[F03]', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
  { to: '/front-desk', label: 'Bàn làm việc Lễ tân', module: '[F04]', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
  { to: '/billing/inv-103', label: 'Hóa đơn & Thanh toán', module: '[F05]', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
  { to: '/housekeeping', label: 'Bảng Dọn buồng phòng', module: '[F06]', roles: ['ADMIN', 'MANAGER', 'HOUSEKEEPING'] },
  { to: '/service-orders', label: 'Gọi dịch vụ Minibar', module: '[F06]', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
  { to: '/reports', label: 'Báo cáo Doanh thu', module: '[F07]', roles: ['ADMIN', 'MANAGER'] },
  { to: '/reports/shift', label: 'Phân bổ ca trực', module: '[F07]', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
  { to: '/users', label: 'Quản lý Người dùng', module: '[F01]', roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>HMS PORTAL</h1>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>7 Modules Cốt lõi F01 - F07</p>
      </div>

      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {MENU_ITEMS.map((item) => {
          const isAllowed = item.roles.includes(currentRole);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? '#ffffff' : isAllowed ? '#cbd5e1' : '#64748b',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                borderLeft: isActive ? '4px solid #38bdf8' : '4px solid transparent',
                opacity: isAllowed ? 1 : 0.45,
              })}
            >
              <span>{item.label}</span>
              <span style={{ fontSize: '10px', color: '#64748b', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>
                {item.module}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', fontSize: '11px', color: '#64748b' }}>
        Tài khoản hiện tại: <b style={{ color: '#38bdf8' }}>{currentRole}</b>
      </div>
    </aside>
  );
};
