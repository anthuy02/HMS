package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.RoomUseCase;
import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomType;
import com.team12.hms.web.dto.RoomDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class RoomController {

    private final RoomUseCase roomUseCase;

    public RoomController(RoomUseCase roomUseCase) {
        this.roomUseCase = roomUseCase;
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDtos.RoomDto>> getRooms() {
        List<RoomDtos.RoomDto> dtoList = roomUseCase.getAllRooms().stream()
                .map(this::toDtoRoom)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomDtos.RoomDto> createRoom(@RequestBody RoomDtos.CreateRoomRequest req) {
        Map<String, Object> data = new HashMap<>();
        data.put("roomNumber", req.roomNumber());
        data.put("floor", req.floor() != null ? req.floor() : 1);
        data.put("roomTypeId", req.roomTypeId().toString());

        Room created = roomUseCase.createRoom(data);
        return ResponseEntity.status(201).body(toDtoRoom(created));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<RoomDtos.RoomDto> updateRoom(
            @PathVariable UUID id,
            @RequestBody RoomDtos.UpdateRoomStatusRequest req) {

        Room updated = roomUseCase.updateRoomStatus(id, req.status(), req.maintenanceReason());
        return ResponseEntity.ok(toDtoRoom(updated));
    }

    @GetMapping("/room-types")
    public ResponseEntity<List<RoomDtos.RoomTypeDto>> getRoomTypes() {
        List<RoomDtos.RoomTypeDto> dtoList = roomUseCase.getAllRoomTypes().stream()
                .map(this::toDtoRoomType)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/room-types")
    public ResponseEntity<RoomDtos.RoomTypeDto> createRoomType(@RequestBody RoomDtos.CreateRoomTypeRequest req) {
        Map<String, Object> data = new HashMap<>();
        data.put("name", req.name());
        data.put("maxCapacity", req.maxCapacity());
        data.put("baseNightlyRate", req.baseNightlyRate());

        RoomType created = roomUseCase.createRoomType(data);
        return ResponseEntity.status(201).body(toDtoRoomType(created));
    }

    private RoomDtos.RoomDto toDtoRoom(Room r) {
        return new RoomDtos.RoomDto(
                r.getId(),
                r.getRoomNumber(),
                r.getFloor(),
                r.getRoomTypeId(),
                r.getStatus() != null ? r.getStatus().name() : "AVAILABLE",
                r.getMaintenanceReason()
        );
    }

    private RoomDtos.RoomTypeDto toDtoRoomType(RoomType rt) {
        return new RoomDtos.RoomTypeDto(
                rt.getId(),
                rt.getName(),
                rt.getMaxCapacity(),
                rt.getBaseNightlyRate()
        );
    }
}
