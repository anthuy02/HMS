import React from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Role } from '../../types/rbac.types';

export const Navbar: React.FC = () => {
  const { user, role, logout, switchRole } = useAuth();

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
          HOTEL MANAGEMENT SYSTEM
        </h2>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: '#f1f5f9',
            padding: '2px 8px',
            borderRadius: '4px',
            color: '#64748b',
          }}
        >
          v1.2 (React + Vite + TS)
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Quick Role Switcher for Demo & Testing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Đổi nhanh Role:</span>
            <select
              value={role || 'ADMIN'}
              onChange={(e) => switchRole(e.target.value as Role)}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontWeight: 600,
              }}
            >
              <option value="ADMIN">ADMIN (Quản trị viên)</option>
              <option value="MANAGER">MANAGER (Quản lý)</option>
              <option value="RECEPTIONIST">RECEPTIONIST (Lễ tân)</option>
              <option value="HOUSEKEEPING">HOUSEKEEPING (Buồng phòng)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              {user.fullName.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{user.fullName}</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{user.role}</span>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  );
};
