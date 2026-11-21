import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../../api/services/auth.service';
import { User, Role } from '../../../types/rbac.types';
import { UserFormModal } from '../components/UserFormModal';
import { useAuth } from '../../../app/providers/AuthProvider';

// Fallback seed accounts matching Figma node 25-2 if empty
const FIGMA_DEFAULT_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin01',
    fullName: 'Nguyễn Hoàng',
    email: 'admin@hotel.vn',
    role: 'ADMIN',
    phone: '0901111222',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'u-mgr',
    username: 'quanly01',
    fullName: 'Trần Minh',
    email: 'mgr@hotel.vn',
    role: 'MANAGER',
    phone: '0903333444',
    isActive: true,
    createdAt: '2026-01-02T08:00:00Z',
  },
  {
    id: 'u-rec',
    username: 'letan01',
    fullName: 'Lê Thị Hương',
    email: 'rec@hotel.vn',
    role: 'RECEPTIONIST',
    phone: '0905555666',
    isActive: true,
    createdAt: '2026-01-03T08:00:00Z',
  },
  {
    id: 'u-hk1',
    username: 'donphong01',
    fullName: 'Phạm Văn Nam',
    email: 'hk@hotel.vn',
    role: 'HOUSEKEEPER',
    phone: '0907777888',
    isActive: true,
    createdAt: '2026-01-04T08:00:00Z',
  },
  {
    id: 'u-hk2',
    username: 'donphong02',
    fullName: 'Vũ Thị Mai',
    email: 'acc@hotel.vn',
    role: 'HOUSEKEEPER',
    phone: '0909999000',
    isActive: true,
    createdAt: '2026-01-05T08:00:00Z',
  },
];

export const UserManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentLoggedUser } = useAuth();

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  const { data: dbUsers = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: authService.getUsers,
  });

  const allUsers = dbUsers.length > 0 ? dbUsers : FIGMA_DEFAULT_USERS;

  // Search filter
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      const roleStr =
        u.role === 'ADMIN'
          ? 'quản trị admin'
          : u.role === 'MANAGER'
          ? 'quản lý manager'
          : u.role === 'RECEPTIONIST'
          ? 'lễ tân receptionist'
          : 'nhân viên buồng phòng housekeeper';
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        roleStr.includes(q)
      );
    });
  }, [allUsers, searchTerm]);

  // Pagination (5 items per page matching Figma)
  const pageSize = 5;
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setIsModalOpen(true);
    setActiveMenuUserId(null);
  };

  const handleToggleActive = async (targetUser: User) => {
    setActiveMenuUserId(null);
    const actionLabel = targetUser.isActive ? 'khóa' : 'kích hoạt lại';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionLabel} tài khoản ${targetUser.fullName}?`)) {
      return;
    }
    try {
      await authService.toggleUserActive(targetUser.id, currentLoggedUser?.id || '');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const formatRoleLabel = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị';
      case 'MANAGER':
        return 'Quản lý';
      case 'RECEPTIONIST':
        return 'Lễ tân';
      case 'HOUSEKEEPER':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  return (
    <div style={{ padding: '4px 8px 32px' }}>
      {/* Title & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '32px',
              fontWeight: 700,
              color: '#482e24',
              lineHeight: 1.15,
              margin: '0',
              letterSpacing: '-0.3px',
            }}
          >
            Quản lý nhân viên
          </h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#482e24',
            color: '#f8f5ec',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(72, 46, 36, 0.2)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#362118')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#482e24')}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Full-width Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#95785c',
              fontSize: '14px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm tên, email, vai trò..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '11px 16px 11px 40px',
              backgroundColor: '#ede5d8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: '#482e24',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(72, 46, 36, 0.04)',
          border: '1px solid #ebd9c8',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#ede6da' }}>
              <th
                style={{
                  padding: '14px 24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '24%',
                }}
              >
                HỌ TÊN
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '26%',
                }}
              >
                EMAIL
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '18%',
                }}
              >
                VAI TRÒ
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  width: '20%',
                }}
              >
                TRẠNG THÁI
              </th>
              <th
                style={{
                  padding: '14px 24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6d5b52',
                  letterSpacing: '0.5px',
                  textAlign: 'right',
                  width: '12%',
                }}
              >
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#8c7e74' }}>
                  Đang tải danh sách nhân viên...
                </td>
              </tr>
            ) : pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#8c7e74' }}>
                  Không tìm thấy nhân viên phù hợp với từ khóa.
                </td>
              </tr>
            ) : (
              pagedUsers.map((emp) => {
                return (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: '1px solid #f2ece3',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Full Name */}
                    <td style={{ padding: '16px 24px', fontSize: '14.5px', fontWeight: 600, color: '#362118' }}>
                      {emp.fullName}
                    </td>

                    {/* Email */}
                    <td style={{ padding: '16px 20px', fontSize: '13.5px', color: '#64748b' }}>
                      {emp.email}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '16px 20px', fontSize: '13.5px', color: '#1d4ed8', fontWeight: 600 }}>
                      {formatRoleLabel(emp.role)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      {emp.isActive ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 14px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Đang hoạt động
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 14px',
                            backgroundColor: '#fee2e2',
                            color: '#ba1a1a',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Tạm khóa
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          title="Chỉnh sửa thông tin nhân viên"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6d5b52',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede5d8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>

                        {/* More Button */}
                        <button
                          onClick={() => setActiveMenuUserId(activeMenuUserId === emp.id ? null : emp.id)}
                          title="Tùy chọn khác"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6d5b52',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede5d8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1.5"></circle>
                            <circle cx="12" cy="12" r="1.5"></circle>
                            <circle cx="12" cy="19" r="1.5"></circle>
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuUserId === emp.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              backgroundColor: '#ffffff',
                              border: '1px solid #ebd9c8',
                              borderRadius: '8px',
                              boxShadow: '0 8px 24px rgba(72, 46, 36, 0.12)',
                              padding: '6px 0',
                              zIndex: 100,
                              minWidth: '180px',
                              textAlign: 'left',
                            }}
                          >
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              style={{
                                width: '100%',
                                padding: '8px 14px',
                                background: 'none',
                                border: 'none',
                                fontSize: '13px',
                                color: '#482e24',
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdfbf7')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              Chỉnh sửa vai trò
                            </button>

                            <button
                              onClick={() => handleToggleActive(emp)}
                              style={{
                                width: '100%',
                                padding: '8px 14px',
                                background: 'none',
                                border: 'none',
                                fontSize: '13px',
                                color: emp.isActive ? '#ba1a1a' : '#15803d',
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = emp.isActive ? '#fef2f2' : '#f0fdf4')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              {emp.isActive ? 'Khóa tài khoản (BR-94)' : 'Mở khóa tài khoản'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '16px 24px',
            borderTop: '1px solid #f2ece3',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #ebd9c8',
              backgroundColor: '#ffffff',
              color: '#6d5b52',
              fontSize: '13px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: currentPage === pageNum ? '#482e24' : 'transparent',
                color: currentPage === pageNum ? '#ffffff' : '#6d5b52',
                fontSize: '13px',
                fontWeight: currentPage === pageNum ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #ebd9c8',
              backgroundColor: '#ffffff',
              color: '#6d5b52',
              fontSize: '13px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* User Create / Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        userToEdit={editingUser}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />
    </div>
  );
};
