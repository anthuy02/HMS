package com.team12.hms.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class RoomDtos {
    public record RoomDto(
            UUID id,
            String roomNumber,
            int floor,
            UUID roomTypeId,
            String status,
            String maintenanceReason
    ) {}

    public record RoomTypeDto(
            UUID id,
            String name,
            int maxCapacity,
            BigDecimal baseNightlyRate
    ) {}

    public record CreateRoomRequest(
            String roomNumber,
            Integer floor,
            UUID roomTypeId
    ) {}

    public record UpdateRoomStatusRequest(
            String status,
            String maintenanceReason
    ) {}

    public record CreateRoomTypeRequest(
            String name,
            int maxCapacity,
            BigDecimal baseNightlyRate
    ) {}
}
