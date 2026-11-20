import React from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Role } from '../../types/rbac.types';

interface RoleGateProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Ẩn/hiện nút thao tác và component theo RBAC (BR08)
 * Ví dụ: Lễ tân chỉ được VIEW ở F02, ẩn nút Sửa phòng
 */
export const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles, children, fallback = null }) => {
  const { hasRole } = useAuth();
  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
