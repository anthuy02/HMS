import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';

export const Forbidden403Page: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const deniedUrl = (location.state as any)?.deniedUrl || 'trang này';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '72px', fontWeight: 900, color: '#ef4444' }}>403</div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
        Truy cập Bị từ chối (Access Denied)
      </h2>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', lineHeight: 1.6, marginBottom: '24px' }}>
        Quy tắc [BR08 - TC_AUTH_04]: Vai trò hiện tại của bạn là <b>{user?.role}</b> không được cấp quyền truy cập vào đường dẫn:
        <br />
        <code style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px' }}>{deniedUrl}</code>
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate('/rooms')}
          style={{ padding: '8px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px' }}
        >
          Trở về Sơ đồ phòng
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '8px 18px', backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '14px' }}
        >
          Quay lại trang trước
        </button>
      </div>
    </div>
  );
};
