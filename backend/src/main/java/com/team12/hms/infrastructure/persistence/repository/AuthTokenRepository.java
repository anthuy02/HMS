package com.team12.hms.infrastructure.persistence.repository;

import com.team12.hms.infrastructure.persistence.entity.AuthTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthTokenEntity, UUID> {
    Optional<AuthTokenEntity> findByTokenAndExpiresAtAfter(UUID token, Instant now);
    void deleteByExpiresAtBefore(Instant now);
}
