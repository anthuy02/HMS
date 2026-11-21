package com.team12.hms.domain.auth;

import java.time.Instant;
import java.util.UUID;

/**
 * [BR-72, BR-73] AuthToken with 30-minute strict TTL.
 */
public class AuthToken {
    private UUID token;
    private UUID userId;
    private Instant issuedAt;
    private Instant expiresAt;

    public AuthToken(UUID userId, Instant issuedAt) {
        this.token = UUID.randomUUID();
        this.userId = userId;
        this.issuedAt = issuedAt;
        // BR-73: TTL chính xác 30 phút từ issued_at
        this.expiresAt = issuedAt.plusSeconds(30 * 60);
    }

    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt) || now.equals(expiresAt);
    }

    public UUID getToken() { return token; }
    public UUID getUserId() { return userId; }
    public Instant getExpiresAt() { return expiresAt; }
}
