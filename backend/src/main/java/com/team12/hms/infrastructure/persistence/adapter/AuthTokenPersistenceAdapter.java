package com.team12.hms.infrastructure.persistence.adapter;

import com.team12.hms.application.port.out.AuthTokenPort;
import com.team12.hms.domain.auth.AuthToken;
import com.team12.hms.infrastructure.persistence.entity.AuthTokenEntity;
import com.team12.hms.infrastructure.persistence.repository.AuthTokenRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Component
public class AuthTokenPersistenceAdapter implements AuthTokenPort {

    private final AuthTokenRepository authTokenRepository;

    public AuthTokenPersistenceAdapter(AuthTokenRepository authTokenRepository) {
        this.authTokenRepository = authTokenRepository;
    }

    @Override
    public void saveToken(AuthToken token) {
        AuthTokenEntity entity = new AuthTokenEntity(
                token.getToken(),
                token.getUserId(),
                Instant.now(),
                token.getExpiresAt()
        );
        authTokenRepository.save(entity);
    }

    @Override
    public Optional<AuthToken> findValidToken(UUID token, Instant now) {
        return authTokenRepository.findByTokenAndExpiresAtAfter(token, now)
                .map(e -> {
                    AuthToken d = new AuthToken(e.getUserId(), e.getIssuedAt());
                    return d;
                });
    }

    @Override
    public void deleteToken(UUID token) {
        authTokenRepository.deleteById(token);
    }
}
