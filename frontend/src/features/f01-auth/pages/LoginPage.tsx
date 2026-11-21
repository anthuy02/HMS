import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin01');
  const [password, setPassword] = useState('Hotel@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/overview';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser: string) => {
    setUsername(demoUser);
    setPassword('Hotel@2026');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f5ec',
        padding: '24px',
        fontFamily: "'Nimbus Sans', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 20px 40px rgba(72, 46, 36, 0.08)',
          border: '1px solid #ebd9c8',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#482e24',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              color: '#d4af37',
              boxShadow: '0 4px 12px rgba(72, 46, 36, 0.2)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18"/>
              <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
              <path d="M9 9h1"/>
              <path d="M9 13h1"/>
              <path d="M9 17h1"/>
              <path d="M14 9h1"/>
              <path d="M14 13h1"/>
              <path d="M14 17h1"/>
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '26px',
              fontWeight: 700,
              color: '#482e24',
              letterSpacing: '0.5px',
              margin: '0 0 4px',
            }}
          >
            HMS Hotel
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#95785c', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
            MANAGEMENT SYSTEM
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              color: '#ba1a1a',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#482e24', marginBottom: '6px' }}>
              Tên đăng nhập (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #ebd9c8',
                backgroundColor: '#fdfbf7',
                fontSize: '14px',
                color: '#482e24',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#482e24', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #ebd9c8',
                backgroundColor: '#fdfbf7',
                fontSize: '14px',
                color: '#482e24',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#482e24',
              color: '#f8f5ec',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(72, 46, 36, 0.25)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ thống'}
          </button>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #ebd9c8' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#95785c', marginBottom: '10px', textAlign: 'center' }}>
            5 Tài khoản Mẫu Chuẩn BR v1.2 (Pass: Hotel@2026):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'admin01', label: 'admin01', role: 'ADMIN' },
              { id: 'quanly01', label: 'quanly01', role: 'MANAGER' },
              { id: 'letan01', label: 'letan01', role: 'LỄ TÂN' },
              { id: 'donphong01', label: 'donphong01', role: 'HK 1' },
              { id: 'donphong02', label: 'donphong02', role: 'HK 2' },
            ].map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleQuickLogin(acc.id)}
                style={{
                  padding: '8px 4px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  border: username === acc.id ? '1.5px solid #482e24' : '1px solid #ebd9c8',
                  backgroundColor: username === acc.id ? '#f5eee3' : '#fdfbf7',
                  color: '#482e24',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div>{acc.label}</div>
                <div style={{ fontSize: '10px', color: '#95785c', marginTop: '2px' }}>({acc.role})</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
