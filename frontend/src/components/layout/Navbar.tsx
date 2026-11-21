import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Role } from '../../types/rbac.types';

export const Navbar: React.FC = () => {
  const { user, role, logout, switchRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#f8f5ec',
        borderBottom: '1px solid #ebe5d8',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Notification Bell Button */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Thông báo"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: notifOpen ? 'rgba(72, 46, 36, 0.08)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#301910',
              transition: 'background-color 0.15s ease',
            }}
          >
            {/* Bell Outline SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#301910" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            {/* Red Notification Dot Badge (matching Figma) */}
            <span
              style={{
                position: 'absolute',
                top: '7px',
                right: '8px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ba1a1a',
                border: '1.5px solid #f8f5ec',
              }}
            />
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '300px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5ded3',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(72, 46, 36, 0.12)',
                padding: '16px',
                zIndex: 100,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: '"Nimbus Sans", sans-serif', fontWeight: 700, fontSize: '13px', color: '#482e24' }}>
                  Thông báo hệ thống
                </span>
                <span style={{ fontSize: '11px', color: '#ba1a1a', fontWeight: 600 }}>2 mới</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fdfbf7', borderRadius: '6px', borderLeft: '3px solid #95785c' }}>
                  <div style={{ fontWeight: 600, color: '#482e24' }}>Phòng 202 cần dọn dẹp</div>
                  <div style={{ fontSize: '11.5px', color: '#73675e' }}>Nhiệm vụ buồng phòng [TASK-001] đang chờ tiếp nhận.</div>
                </div>
                <div style={{ padding: '8px', backgroundColor: '#fdfbf7', borderRadius: '6px', borderLeft: '3px solid #482e24' }}>
                  <div style={{ fontWeight: 600, color: '#482e24' }}>Lịch Check-in hôm nay</div>
                  <div style={{ fontSize: '11.5px', color: '#73675e' }}>Đơn RES-001 (Phòng 101) dự kiến check-in lúc 14:00.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider Line (matching Figma) */}
        <div
          style={{
            width: '1px',
            height: '24px',
            backgroundColor: '#d9d5cc',
            margin: '0 14px',
          }}
        />

        {/* User Profile Trigger (matching Figma) */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              padding: '6px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: dropdownOpen ? 'rgba(72, 46, 36, 0.08)' : 'transparent',
              transition: 'background-color 0.15s ease',
            }}
          >
            {/* Circular Dark Avatar Icon with white person icon */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#301910',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            </div>

            {/* User display name (matches Figma 'Admin') */}
            <span
              style={{
                fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#301910',
              }}
            >
              {user?.role === 'ADMIN' ? 'Admin' : user?.fullName || 'Admin'}
            </span>

            {/* Chevron down arrow icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#301910"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Profile & Role Dropdown Panel */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '260px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5ded3',
                borderRadius: '10px',
                boxShadow: '0 12px 30px rgba(72, 46, 36, 0.15)',
                padding: '16px',
                zIndex: 100,
              }}
            >
              {/* User details */}
              <div style={{ borderBottom: '1px solid #ede8de', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 700, color: '#482e24' }}>
                  {user?.fullName || 'Quản trị viên'}
                </div>
                <div style={{ fontSize: '12px', color: '#73675e', marginTop: '2px' }}>
                  @{user?.username || 'admin01'} &bull; <b style={{ color: '#95785c' }}>{user?.role || 'ADMIN'}</b>
                </div>
              </div>

              {/* Quick Role Switcher for Test Oracle */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8c7a6b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  Đổi Role thử nghiệm (RBAC):
                </label>
                <select
                  value={role || 'ADMIN'}
                  onChange={(e) => {
                    switchRole(e.target.value as Role);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    fontSize: '12.5px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d9d5cc',
                    backgroundColor: '#f8f5ec',
                    color: '#482e24',
                    fontWeight: 600,
                  }}
                >
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  <option value="MANAGER">MANAGER (Quản lý)</option>
                  <option value="RECEPTIONIST">RECEPTIONIST (Lễ tân)</option>
                  <option value="HOUSEKEEPER">HOUSEKEEPER (Buồng phòng)</option>
                </select>
              </div>

              {/* Logout button */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#ba1a1a',
                  backgroundColor: 'rgba(186, 26, 26, 0.08)',
                  border: '1px solid rgba(186, 26, 26, 0.2)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
