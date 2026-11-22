package com.team12.hms.web.dto;

import java.util.UUID;

public class HousekeepingDtos {
    public record CleaningTaskDto(
            UUID id,
            UUID roomId,
            String roomNumber,
            UUID housekeeperId,
            String housekeeperName,
            String status,
            String notes
    ) {}

    public record UpdateTaskStatusRequest(
            String status,
            UUID housekeeperId,
            String housekeeperName
    ) {}
}
