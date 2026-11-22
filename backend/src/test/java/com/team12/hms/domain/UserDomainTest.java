package com.team12.hms.domain;

import com.team12.hms.domain.auth.Role;
import com.team12.hms.domain.auth.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserDomainTest {

    @Test
    @DisplayName("[BR-71] Khóa tài khoản 15 phút sau 5 lần đăng nhập thất bại")
    void testFailedLoginAndLockout() {
        UUID id = UUID.randomUUID();
        User user = new User(id, "letan01", "hash", "Nguyễn Văn Lễ Tân", Role.RECEPTIONIST);
        Instant now = Instant.parse("2026-11-22T08:00:00Z");

        assertEquals(id, user.getId());
        assertEquals("letan01", user.getUsername());
        assertEquals("hash", user.getPasswordHash());
        assertEquals("Nguyễn Văn Lễ Tân", user.getFullName());
        assertEquals(Role.RECEPTIONIST, user.getRole());
        assertTrue(user.isActive());
        assertEquals(0, user.getFailedAttempts());
        assertFalse(user.isLocked(now));

        // 4 lần thử sai: chưa khóa
        for (int i = 1; i <= 4; i++) {
            user.recordFailedLogin(now);
            assertEquals(i, user.getFailedAttempts());
            assertFalse(user.isLocked(now));
        }

        // Lần thứ 5: Khóa 15 phút
        user.recordFailedLogin(now);
        assertEquals(5, user.getFailedAttempts());
        assertTrue(user.isLocked(now));
        assertEquals(Instant.parse("2026-11-22T08:15:00Z"), user.getLockedUntil());

        // Thời điểm trong 15 phút khóa: vẫn bị khóa
        Instant duringLock = Instant.parse("2026-11-22T08:14:59Z");
        assertTrue(user.isLocked(duringLock));

        // Đúng 15 phút sau: hết khóa
        Instant exactUnclock = Instant.parse("2026-11-22T08:15:00Z");
        assertFalse(user.isLocked(exactUnclock));

        // Sau 16 phút: không còn bị khóa
        Instant afterLock = Instant.parse("2026-11-22T08:16:00Z");
        assertFalse(user.isLocked(afterLock));

        // Đăng nhập thành công -> reset
        user.resetFailedLogins();
        assertEquals(0, user.getFailedAttempts());
        assertNull(user.getLockedUntil());
        assertFalse(user.isLocked(now));
    }

    @Test
    @DisplayName("Kiểm tra User getters và setters")
    void testUserGettersAndSetters() {
        User user = new User();
        UUID id = UUID.randomUUID();
        user.setId(id);
        user.setUsername("testuser");
        user.setPasswordHash("pass");
        user.setFullName("Full Name");
        user.setRole(Role.ADMIN);
        user.setPhone("0987654321");
        user.setEmail("admin@hotel.com");
        user.setActive(true);
        user.setFailedAttempts(1);
        Instant lock = Instant.now();
        user.setLockedUntil(lock);

        assertEquals(id, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("pass", user.getPasswordHash());
        assertEquals("Full Name", user.getFullName());
        assertEquals(Role.ADMIN, user.getRole());
        assertEquals("0987654321", user.getPhone());
        assertEquals("admin@hotel.com", user.getEmail());
        assertTrue(user.isActive());
        assertEquals(1, user.getFailedAttempts());
        assertEquals(lock, user.getLockedUntil());
    }
}
