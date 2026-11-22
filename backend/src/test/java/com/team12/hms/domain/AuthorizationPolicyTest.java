package com.team12.hms.domain;

import com.team12.hms.domain.auth.AuthorizationPolicy;
import com.team12.hms.domain.auth.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthorizationPolicyTest {

    @Test
    @DisplayName("[BR-75] Chỉ MANAGER được quyền quản lý cơ cấu phòng")
    void testCanManageRooms() {
        assertTrue(AuthorizationPolicy.canManageRooms(Role.MANAGER));
        assertFalse(AuthorizationPolicy.canManageRooms(Role.ADMIN));
        assertFalse(AuthorizationPolicy.canManageRooms(Role.RECEPTIONIST));
        assertFalse(AuthorizationPolicy.canManageRooms(Role.HOUSEKEEPER));
    }

    @Test
    @DisplayName("[BR-75] Chỉ ADMIN được quyền quản lý người dùng")
    void testCanManageUsers() {
        assertTrue(AuthorizationPolicy.canManageUsers(Role.ADMIN));
        assertFalse(AuthorizationPolicy.canManageUsers(Role.MANAGER));
        assertFalse(AuthorizationPolicy.canManageUsers(Role.RECEPTIONIST));
        assertFalse(AuthorizationPolicy.canManageUsers(Role.HOUSEKEEPER));
    }

    @Test
    @DisplayName("[BR-75] Chỉ ADMIN được quyền quản lý cấu hình hệ thống")
    void testCanManageSystemConfig() {
        assertTrue(AuthorizationPolicy.canManageSystemConfig(Role.ADMIN));
        assertFalse(AuthorizationPolicy.canManageSystemConfig(Role.MANAGER));
        assertFalse(AuthorizationPolicy.canManageSystemConfig(Role.RECEPTIONIST));
        assertFalse(AuthorizationPolicy.canManageSystemConfig(Role.HOUSEKEEPER));
    }

    @Test
    @DisplayName("[BR-75] MANAGER và RECEPTIONIST được tạo đặt phòng")
    void testCanCreateReservation() {
        assertTrue(AuthorizationPolicy.canCreateReservation(Role.MANAGER));
        assertTrue(AuthorizationPolicy.canCreateReservation(Role.RECEPTIONIST));
        assertFalse(AuthorizationPolicy.canCreateReservation(Role.ADMIN));
        assertFalse(AuthorizationPolicy.canCreateReservation(Role.HOUSEKEEPER));
    }

    @Test
    @DisplayName("[BR-75] MANAGER và RECEPTIONIST được thực hiện check-in/out")
    void testCanExecuteCheckInOut() {
        assertTrue(AuthorizationPolicy.canExecuteCheckInOut(Role.MANAGER));
        assertTrue(AuthorizationPolicy.canExecuteCheckInOut(Role.RECEPTIONIST));
        assertFalse(AuthorizationPolicy.canExecuteCheckInOut(Role.ADMIN));
        assertFalse(AuthorizationPolicy.canExecuteCheckInOut(Role.HOUSEKEEPER));
    }

    @Test
    @DisplayName("[BR-75] ADMIN và MANAGER được xem báo cáo đầy đủ")
    void testCanViewFullReports() {
        assertTrue(AuthorizationPolicy.canViewFullReports(Role.ADMIN));
        assertTrue(AuthorizationPolicy.canViewFullReports(Role.MANAGER));
        assertFalse(AuthorizationPolicy.canViewFullReports(Role.RECEPTIONIST));
        assertFalse(AuthorizationPolicy.canViewFullReports(Role.HOUSEKEEPER));
    }

    @Test
    @DisplayName("[BR-75] Chỉ HOUSEKEEPER được nhận và hoàn tất nhiệm vụ buồng phòng")
    void testCanExecuteHousekeeping() {
        assertTrue(AuthorizationPolicy.canExecuteHousekeeping(Role.HOUSEKEEPER));
        assertFalse(AuthorizationPolicy.canExecuteHousekeeping(Role.ADMIN));
        assertFalse(AuthorizationPolicy.canExecuteHousekeeping(Role.MANAGER));
        assertFalse(AuthorizationPolicy.canExecuteHousekeeping(Role.RECEPTIONIST));
    }

    @Test
    @DisplayName("Kiểm tra constructor")
    void testConstructor() {
        AuthorizationPolicy policy = new AuthorizationPolicy();
        assertNotNull(policy);
    }
}
