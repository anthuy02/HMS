import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { Role } from '../../types/rbac.types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Chặn trái quyền và điều hướng sang màn hình 403 Forbidden (TC_AUTH_04, BR08)
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/403" state={{ deniedUrl: location.pathname, currentRole: user?.role }} replace />;
  }

  return children;
};
