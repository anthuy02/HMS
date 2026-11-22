package com.team12.hms.domain.auth;

/**
 * [BR-70] Password validator: 8..64 code point Unicode NFC, không trim.
 */
public class PasswordValidator {
    public static boolean isValid(String password) {
        if (password == null) return false;
        int length = password.codePointCount(0, password.length());
        return length >= 8 && length <= 64;
    }
}
