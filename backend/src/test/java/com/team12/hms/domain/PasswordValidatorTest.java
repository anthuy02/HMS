package com.team12.hms.domain;

import com.team12.hms.domain.auth.PasswordValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    @DisplayName("[BR-70] Mật khẩu hợp lệ khi từ 8 đến 64 code points Unicode")
    void testValidPasswordLengths() {
        // Đúng 8 ký tự
        assertTrue(PasswordValidator.isValid("12345678"));
        // 10 ký tự chuẩn
        assertTrue(PasswordValidator.isValid("Hotel@2026"));
        // Đúng 64 ký tự
        String exactly64 = "a".repeat(64);
        assertTrue(PasswordValidator.isValid(exactly64));
    }

    @Test
    @DisplayName("[BR-70] Mật khẩu không hợp lệ khi null, < 8 hoặc > 64 ký tự")
    void testInvalidPasswordLengths() {
        assertFalse(PasswordValidator.isValid(null));
        assertFalse(PasswordValidator.isValid(""));
        assertFalse(PasswordValidator.isValid("1234567")); // 7 ký tự

        String length65 = "a".repeat(65);
        assertFalse(PasswordValidator.isValid(length65)); // 65 ký tự
    }

    @Test
    @DisplayName("Kiểm tra constructor")
    void testConstructor() {
        PasswordValidator validator = new PasswordValidator();
        assertNotNull(validator);
    }
}
