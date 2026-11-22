package com.team12.hms.domain;

import com.team12.hms.domain.reservation.GuestInfo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GuestInfoTest {

    @Test
    @DisplayName("[BR-09] Khởi tạo GuestInfo hợp lệ với đầy đủ thông tin")
    void testValidGuestInfo() {
        GuestInfo info = new GuestInfo("Nguyễn Văn A", "0901234567", "guest@example.com");
        assertEquals("Nguyễn Văn A", info.fullName());
        assertEquals("0901234567", info.phone());
        assertEquals("guest@example.com", info.email());

        // Email null hoặc rỗng -> chuyển thành null
        GuestInfo infoNullEmail = new GuestInfo("Trần Thị B", "0912345678", null);
        assertNull(infoNullEmail.email());

        GuestInfo infoEmptyEmail = new GuestInfo("Lê Văn C", "0987654321", "   ");
        assertNull(infoEmptyEmail.email());
    }

    @Test
    @DisplayName("[BR-09] Họ tên không hợp lệ (null, rỗng hoặc > 100 ký tự)")
    void testInvalidFullName() {
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo(null, "0901234567", null));
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo("   ", "0901234567", null));
        String tooLong = "A".repeat(101);
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo(tooLong, "0901234567", null));
    }

    @Test
    @DisplayName("[BR-09] Số điện thoại không hợp lệ (không phải 9-11 chữ số)")
    void testInvalidPhone() {
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo("Nguyễn A", null, null));
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo("Nguyễn A", "12345678", null)); // 8 số
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo("Nguyễn A", "123456789012", null)); // 12 số
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo("Nguyễn A", "09012abcde", null)); // Chứa chữ cái
    }

    @Test
    @DisplayName("[BR-09] Email không đúng định dạng hoặc > 100 ký tự")
    void testInvalidEmail() {
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo("Nguyễn A", "0901234567", "invalid-email"));
        String tooLongEmail = "a".repeat(95) + "@test.com";
        assertThrows(IllegalArgumentException.class, () -> new GuestInfo("Nguyễn A", "0901234567", tooLongEmail));
    }
}
