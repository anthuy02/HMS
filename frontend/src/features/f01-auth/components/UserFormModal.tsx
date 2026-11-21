import React, { useState, useEffect } from 'react';
import { authService } from '../../../api/services/auth.service';
import { User, Role } from '../../../types/rbac.types';

interface UserFormModalProps {
  isOpen: boolean;
  userToEdit?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  userToEdit,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!userToEdit;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('RECEPTIONIST');
  const [password, setPassword] = useState('Hotel@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFullName(userToEdit.fullName);
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role);
      setPassword('');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setRole('RECEPTIONIST');
      setPassword('Hotel@2026');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit && userToEdit) {
        await authService.updateUser(userToEdit.id, {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
        });
      } else {
        await authService.createUser({
          username: email ? email.split('@')[0] : `user_${Date.now()}`,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          isActive: true,
          password: password || 'Hotel@2026',
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thông tin nhân viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(72, 46, 36, 0.4)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(72, 46, 36, 0.15)',
          border: '1px solid #ebd9c8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#482e24',
                margin: '0 0 4px',
              }}
            >
              {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </h3>
            <p style={{ fontSize: '12px', color: '#8c7e74', margin: 0 }}>
              {isEdit ? `Cập nhật vai trò & quyền hạn cho ${userToEdit?.fullName}` : 'Tạo tài khoản phân quyền theo chuẩn RBAC'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#8c7e74',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              color: '#ba1a1a',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
              Họ và tên *
            </label>
            <input
              required
              placeholder="Ví dụ: Nguyễn Hoàng, Trần Minh..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #ebd9c8',
                backgroundColor: '#fdfbf7',
                fontSize: '13px',
                color: '#482e24',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
              Email công vụ *
            </label>
            <input
              type="email"
              required
              placeholder="Ví dụ: admin@hotel.vn, rec@hotel.vn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #ebd9c8',
                backgroundColor: '#fdfbf7',
                fontSize: '13px',
                color: '#482e24',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                Số điện thoại *
              </label>
              <input
                required
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ebd9c8',
                  backgroundColor: '#fdfbf7',
                  fontSize: '13px',
                  color: '#482e24',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                Vai trò (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ebd9c8',
                  backgroundColor: '#fdfbf7',
                  fontSize: '13px',
                  color: '#482e24',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="ADMIN">Quản trị (Admin)</option>
                <option value="MANAGER">Quản lý (Manager)</option>
                <option value="RECEPTIONIST">Lễ tân (Receptionist)</option>
                <option value="HOUSEKEEPER">Nhân viên buồng phòng</option>
              </select>
            </div>
          </div>

          {!isEdit && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#482e24', marginBottom: '4px' }}>
                Mật khẩu khởi tạo
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ebd9c8',
                  backgroundColor: '#fdfbf7',
                  fontSize: '13px',
                  color: '#482e24',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #ebd9c8',
                backgroundColor: '#ffffff',
                color: '#6d5b52',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#482e24',
                color: '#f8f5ec',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(72, 46, 36, 0.2)',
              }}
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
