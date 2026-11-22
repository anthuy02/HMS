import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';

// F01
import { LoginPage } from '../features/f01-auth/pages/LoginPage';
import { UserManagementPage } from '../features/f01-auth/pages/UserManagementPage';
import { Forbidden403Page } from '../features/f01-auth/pages/Forbidden403Page';

// F02
import { RoomCatalogPage } from '../features/f02-rooms/pages/RoomCatalogPage';

// F03
import { ReservationListPage } from '../features/f03-reservations/pages/ReservationListPage';

// F04
import { FrontDeskOperationPage } from '../features/f04-check-in-out/pages/FrontDeskOperationPage';

// F05
import { InvoiceDetailPage } from '../features/f05-billing/pages/InvoiceDetailPage';
import { BillingLedgerPage } from '../features/f05-billing/pages/BillingLedgerPage';

// F06
import { HousekeepingBoardPage } from '../features/f06-service-housekeeping/pages/HousekeepingBoardPage';
import { RoomServiceOrderPage } from '../features/f06-service-housekeeping/pages/RoomServiceOrderPage';

// F07
import { ExecutiveDashboardPage } from '../features/f07-reports/pages/ExecutiveDashboardPage';
import { ShiftAllocationBoard } from '../features/f07-reports/pages/ShiftAllocationBoard';
import { SystemSettingsPage } from '../features/f07-reports/pages/SystemSettingsPage';
import { OverviewPage } from '../features/overview/pages/OverviewPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <Forbidden403Page />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: 'overview',
        element: <OverviewPage />,
      },
      // [F01] User Management (Chỉ ADMIN - AUTH_01, BR-93)
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      // [UC-03 / BR-88] Cấu hình Hệ thống (Chỉ ADMIN)
      {
        path: 'system-settings',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SystemSettingsPage />
          </ProtectedRoute>
        ),
      },
      // [F02] Room Management (5 trạng thái, 6 phòng)
      {
        path: 'rooms',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPER']}>
            <RoomCatalogPage />
          </ProtectedRoute>
        ),
      },
      // [F03] Reservation Management (Nightly & Hourly, Reschedule, Cancel, Pre-assign)
      {
        path: 'reservations',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
            <ReservationListPage />
          </ProtectedRoute>
        ),
      },
      // [F04] Front Desk Operations (Check-in, 3 branches Check-out, Interim Balance)
      {
        path: 'front-desk',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
            <FrontDeskOperationPage />
          </ProtectedRoute>
        ),
      },
      // [F05] Billing & 11-step Invoice
      {
        path: 'billing',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
            <BillingLedgerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'billing/:invoiceId',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
            <InvoiceDetailPage />
          </ProtectedRoute>
        ),
      },
      // [F06] Service & Housekeeping (2-step CleaningTask & Damage)
      {
        path: 'housekeeping',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPER']}>
            <HousekeepingBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'service-orders',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
            <RoomServiceOrderPage />
          </ProtectedRoute>
        ),
      },
      // [F07] Reports & Shift Allocation
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <ExecutiveDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports/shift',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
            <ShiftAllocationBoard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/rooms" replace />,
  },
]);
