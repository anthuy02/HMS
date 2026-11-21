package com.team12.hms.application.port.out;

import com.team12.hms.domain.housekeeping.CleaningTask;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CleaningTaskPort {
    List<CleaningTask> findAll();
    Optional<CleaningTask> findById(UUID id);
    CleaningTask save(CleaningTask task);
}
