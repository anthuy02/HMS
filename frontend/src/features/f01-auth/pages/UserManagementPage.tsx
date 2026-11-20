import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../../api/services/auth.service';
import { User, Role } from '../../../types/rbac.types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { UserFormModal } from '../components/UserFormModal';

export const UserManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: authService.getUsers,
  });

  const columns: Column<User>[] = [
    { key: 'fullName', header: 'Họ và tên', width: '25%' },
    { key: 'email', header: 'Email', width: '25%' },
    {
      key: 'role',
      header: 'Vai trò (RBAC)',
      render: (u) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'MANAGER' ? '#fef3c7' : '#e0f2fe',
            color: u.role === 'ADMIN' ? '#b91c1c' : u.role === 'MANAGER' ? '#b45309' : '#0369a1',
          }}
        >
          {u.role}
        </span>
      ),
    },
    { key: 'phone', header: 'Số điện thoại' },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (u) => (
        <span style={{ color: u.isActive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
          {u.isActive ? '● Đang hoạt động' : '○ Bị khóa'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>[F01 - AUTH_01] Quản lý Người dùng & Phân quyền</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Chỉ có tài khoản quyền ADMIN mới có quyền truy cập màn hình này.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
        >
          + Thêm Tài khoản Mới
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Tìm theo tên hoặc email..."
        searchFilter={(u, q) => u.fullName.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())}
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />
    </div>
  );
};
