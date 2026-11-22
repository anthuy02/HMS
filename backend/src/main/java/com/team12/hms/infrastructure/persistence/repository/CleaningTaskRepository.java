package com.team12.hms.infrastructure.persistence.repository;

import com.team12.hms.infrastructure.persistence.entity.CleaningTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CleaningTaskRepository extends JpaRepository<CleaningTaskEntity, UUID> {
    List<CleaningTaskEntity> findByStatusIn(List<String> statuses);
}
