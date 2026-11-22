package com.team12.hms.application.port.out;

import com.team12.hms.domain.auth.AuthToken;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AuthTokenPort {
    void saveToken(AuthToken token);
    Optional<AuthToken> findValidToken(UUID token, Instant now);
    void deleteToken(UUID token);
}
