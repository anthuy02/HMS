import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@hotel.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/rooms';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>HOTEL MANAGEMENT</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>[F01] Đăng nhập & Xác thực Tài khoản</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '10px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ thống'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Tài khoản Demo nhanh 4 Roles:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hotel.com', 'admin123')}
              style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            >
              ADMIN
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@hotel.com', 'manager123')}
              style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            >
              MANAGER
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('reception@hotel.com', 'reception123')}
              style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            >
              RECEPTIONIST
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('hk@hotel.com', 'hk123')}
              style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            >
              HOUSEKEEPING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
