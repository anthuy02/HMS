package com.team12.hms.application.port.in;

import com.team12.hms.domain.housekeeping.CleaningTask;

import java.util.List;
import java.util.UUID;

public interface ServiceHkUseCase {
    List<CleaningTask> getAllTasks();
    CleaningTask updateTaskStatus(UUID taskId, String newStatus);
}
