import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

interface SidebarMenuItem {
  to: string;
  label: string;
  iconType: 'dashboard' | 'calendar' | 'door' | 'bed' | 'users' | 'receipt' | 'chart' | 'settings' | 'broom';
  roles: string[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';
  const location = useLocation();

  const menuItems: SidebarMenuItem[] = [
    { to: '/', label: 'Tổng quan', iconType: 'dashboard', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPER'] },
    { to: '/reservations', label: 'Đặt phòng', iconType: 'calendar', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
    { to: '/front-desk', label: 'Check-in & Check-out', iconType: 'door', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
    { to: '/rooms', label: 'Phòng', iconType: 'bed', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPER'] },
    { to: '/users', label: 'Nhân viên', iconType: 'users', roles: ['ADMIN'] },
    { to: '/billing', label: 'Hóa đơn / Quyết toán', iconType: 'receipt', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
    { to: '/reports', label: 'Báo cáo', iconType: 'chart', roles: ['ADMIN', 'MANAGER'] },
    { to: '/system-settings', label: 'Cài đặt', iconType: 'settings', roles: ['ADMIN'] },
  ];

  // If role is HOUSEKEEPER, provide Buồng phòng item
  const extraItems: SidebarMenuItem[] = currentRole === 'HOUSEKEEPER' ? [
    { to: '/housekeeping', label: 'Nhiệm vụ buồng phòng', iconType: 'broom', roles: ['HOUSEKEEPER'] },
  ] : [];

  const renderIcon = (type: string, isActive: boolean) => {
    const strokeColor = isActive ? '#ffffff' : '#ac9d8f';

    switch (type) {
      case 'dashboard':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        );
      case 'calendar':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="2.5" />
            <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2.5" />
            <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="2.5" />
          </svg>
        );
      case 'door':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21h16" />
            <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
            <path d="M14 12v.01" strokeWidth="2.5" />
            <path d="M10 3v18" strokeDasharray="2 2" />
          </svg>
        );
      case 'bed':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4v16" />
            <path d="M2 8h18a2 2 0 0 1 2 2v10" />
            <path d="M2 17h20" />
            <path d="M6 8v4" />
          </svg>
        );
      case 'users':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2.5" />
            <path d="M15 8h3" />
            <path d="M15 12h3" />
            <path d="M5 16c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5" />
          </svg>
        );
      case 'receipt':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="13" y2="16" />
          </svg>
        );
      case 'chart':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="8" y1="17" x2="8" y2="13" strokeWidth="2" />
            <line x1="12" y1="17" x2="12" y2="9" strokeWidth="2" />
            <line x1="16" y1="17" x2="16" y2="7" strokeWidth="2" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case 'broom':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 11 7-7" />
            <path d="M12 13l-4 4-2 6 6-2 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: '#482e24',
        color: '#f2ede4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 100,
        boxShadow: '4px 0 16px rgba(48, 25, 16, 0.15)',
        userSelect: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. TOP BRAND HEADER */}
      <div
        style={{
          padding: '20px 20px 12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        {/* Luxury circular logo icon */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1.2px solid #95785c',
            backgroundColor: 'rgba(149, 120, 92, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4b996" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
            <path d="M10 17v4" />
            <path d="M14 17v4" />
          </svg>
        </div>

        {/* Brand Name */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '19px',
              fontWeight: 700,
              color: '#f2ede4',
              lineHeight: 1.15,
              letterSpacing: '0.2px',
            }}
          >
            HMS Hotel
          </span>
          <span
            style={{
              fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '1.6px',
              color: '#95785c',
              textTransform: 'uppercase',
              marginTop: '4px',
            }}
          >
            MANAGEMENT SYSTEM
          </span>
        </div>
      </div>

      {/* 2. SECTION HEADER */}
      <div
        style={{
          padding: '12px 20px 8px 20px',
          fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          color: '#8c7a6b',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        ĐIỀU HƯỚNG CHÍNH
      </div>

      {/* 3. NAVIGATION MENU ITEMS */}
      <nav
        style={{
          padding: '4px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {[...menuItems, ...extraItems].map((item) => {
          const isAllowed = item.roles.includes(currentRole);
          const isOverviewActive = item.to === '/' && (location.pathname === '/' || location.pathname === '/overview');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => {
                const active = isActive || isOverviewActive;
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", -apple-system, sans-serif',
                  fontSize: '13.5px',
                  fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  color: active ? '#ffffff' : isAllowed ? '#ac9d8f' : '#644d42',
                  backgroundColor: active ? '#5d3d32' : 'transparent',
                  transition: 'all 0.15s ease-in-out',
                  opacity: isAllowed ? 1 : 0.4,
                  cursor: isAllowed ? 'pointer' : 'not-allowed',
                };
              }}
            >
              {({ isActive }) => {
                const active = isActive || isOverviewActive;
                return (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', width: '20px', justifyContent: 'center' }}>
                      {renderIcon(item.iconType, active)}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* 4. BOTTOM FOOTER */}
      <div
        style={{
          padding: '16px 16px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderTop: '1px solid rgba(149, 120, 92, 0.15)',
          flexShrink: 0,
        }}
      >
        {/* Architectural Palace Line Art SVG */}
        <div style={{ marginBottom: '10px', opacity: 0.85 }}>
          <svg width="42" height="40" viewBox="0 0 60 56" fill="none" stroke="#95785c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M30 4 L30 10" />
            <path d="M30 10 L24 18 L36 18 Z" />
            <rect x="25" y="18" width="10" height="34" />
            <circle cx="30" cy="24" r="2" />
            <rect x="28" y="30" width="4" height="6" rx="1" />
            <rect x="28" y="40" width="4" height="6" rx="1" />
            <path d="M14 26 L20 22 L25 26" />
            <rect x="14" y="26" width="11" height="26" />
            <circle cx="19.5" cy="32" r="1.5" />
            <circle cx="19.5" cy="40" r="1.5" />
            <path d="M35 26 L40 22 L46 26" />
            <rect x="35" y="26" width="11" height="26" />
            <circle cx="40.5" cy="32" r="1.5" />
            <circle cx="40.5" cy="40" r="1.5" />
            <path d="M10 52 L50 52" />
          </svg>
        </div>

        {/* Slogan */}
        <div
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '9.5px',
            fontWeight: 600,
            letterSpacing: '1.4px',
            color: '#95785c',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          BETTER STAY · BETTER EXPERIENCE
        </div>

        {/* Copyright */}
        <div
          style={{
            fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
            fontSize: '8px',
            letterSpacing: '0.6px',
            color: '#796459',
            textTransform: 'uppercase',
          }}
        >
          © ROYAL HOTEL MANAGEMENT
        </div>
      </div>
    </aside>
  );
};
