package com.team12.hms.domain.reservation;

/**
 * [BR-09, BR-27] Guest information validation.
 */
public record GuestInfo(String fullName, String phone, String email) {
    public GuestInfo {
        if (fullName == null || fullName.trim().isEmpty() || fullName.trim().length() > 100) {
            throw new IllegalArgumentException("[BR-09] Họ tên khách bắt buộc từ 1 đến 100 ký tự.");
        }
        fullName = fullName.trim();

        if (phone == null || !phone.matches("^[0-9]{9,11}$")) {
            throw new IllegalArgumentException("[BR-09] Số điện thoại bắt buộc gồm 9 đến 11 chữ số.");
        }

        if (email != null && !email.trim().isEmpty()) {
            email = email.trim();
            if (email.length() > 100 || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                throw new IllegalArgumentException("[BR-09] Email không đúng định dạng hoặc vượt quá 100 ký tự.");
            }
        } else {
            email = null;
        }
    }
}
