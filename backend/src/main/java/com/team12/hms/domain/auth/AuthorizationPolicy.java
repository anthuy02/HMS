package com.team12.hms.domain.auth;

/**
 * [BR-75, BR-79, BR-124] Hàm thuần Decision Table ma trận 4 vai trò.
 */
public class AuthorizationPolicy {
    public static boolean canManageRooms(Role role) {
        // Chỉ MANAGER sửa giá phòng (BR-75, BR-101)
        return role == Role.MANAGER;
    }

    public static boolean canManageUsers(Role role) {
        return role == Role.ADMIN;
    }

    public static boolean canManageSystemConfig(Role role) {
        return role == Role.ADMIN;
    }

    public static boolean canCreateReservation(Role role) {
        return role == Role.MANAGER || role == Role.RECEPTIONIST;
    }

    public static boolean canExecuteCheckInOut(Role role) {
        return role == Role.MANAGER || role == Role.RECEPTIONIST;
    }

    public static boolean canViewFullReports(Role role) {
        return role == Role.ADMIN || role == Role.MANAGER;
    }

    public static boolean canExecuteHousekeeping(Role role) {
        return role == Role.HOUSEKEEPER;
    }
}
