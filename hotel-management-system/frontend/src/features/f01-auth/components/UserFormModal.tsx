import React, { useState } from 'react';
import { authService } from '../../../api/services/auth.service';
import { Role } from '../../../types/rbac.types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('RECEPTIONIST');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.createUser({
        fullName,
        email,
        phone,
        role,
        isActive: true,
        password,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', width: '100%', maxWidth: '480px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Thêm Tài khoản Nhân viên Mới (AUTH_01)</h3>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Họ và tên</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Email đăng nhập</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Số điện thoại</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Vai trò (RBAC)</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="RECEPTIONIST">RECEPTIONIST (Lễ tân)</option>
              <option value="HOUSEKEEPING">HOUSEKEEPING (Buồng phòng)</option>
              <option value="MANAGER">MANAGER (Quản lý)</option>
              <option value="ADMIN">ADMIN (Quản trị viên)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Mật khẩu khởi tạo</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Hủy</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>
              {loading ? 'Đang lưu...' : 'Lưu tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
