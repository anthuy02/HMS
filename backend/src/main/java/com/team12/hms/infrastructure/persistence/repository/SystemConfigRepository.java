package com.team12.hms.infrastructure.persistence.repository;

import com.team12.hms.infrastructure.persistence.entity.SystemConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfigEntity, UUID> {}
