package com.team12.hms.domain;

import com.team12.hms.domain.auth.AuthToken;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AuthTokenTest {

    @Test
    @DisplayName("[BR-73] AuthToken có thời hạn chính xác 30 phút")
    void testTokenExpiry() {
        UUID userId = UUID.randomUUID();
        Instant issuedAt = Instant.parse("2026-11-22T08:00:00Z");
        AuthToken token = new AuthToken(userId, issuedAt);

        assertNotNull(token.getToken());
        assertEquals(userId, token.getUserId());
        assertEquals(Instant.parse("2026-11-22T08:30:00Z"), token.getExpiresAt());

        // Thời điểm trước khi hết hạn (sau 29 phút)
        Instant before = Instant.parse("2026-11-22T08:29:59Z");
        assertFalse(token.isExpired(before));

        // Đúng thời điểm 30 phút
        Instant exact = Instant.parse("2026-11-22T08:30:00Z");
        assertTrue(token.isExpired(exact));

        // Sau khi hết hạn (sau 31 phút)
        Instant after = Instant.parse("2026-11-22T08:31:00Z");
        assertTrue(token.isExpired(after));
    }
}
