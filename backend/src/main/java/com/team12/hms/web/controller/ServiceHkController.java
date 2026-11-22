package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.ServiceHkUseCase;
import com.team12.hms.domain.housekeeping.CleaningTask;
import com.team12.hms.web.dto.HousekeepingDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class ServiceHkController {

    private final ServiceHkUseCase serviceHkUseCase;

    public ServiceHkController(ServiceHkUseCase serviceHkUseCase) {
        this.serviceHkUseCase = serviceHkUseCase;
    }

    @GetMapping("/service-catalog")
    public ResponseEntity<List<Map<String, Object>>> getCatalog() {
        return ResponseEntity.ok(List.of(
            Map.of("code", "MB01", "name", "Nước suối 500ml", "type", "MINIBAR", "unitPrice", 15000),
            Map.of("code", "MB02", "name", "Nước ngọt lon", "type", "MINIBAR", "unitPrice", 25000),
            Map.of("code", "LD01", "name", "Giặt ủi (mỗi món)", "type", "LAUNDRY", "unitPrice", 25000)
        ));
    }

    @PostMapping("/reservations/{id}/services")
    public ResponseEntity<Map<String, Object>> addServiceCharge(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(201).body(Map.of("message", "Đã ghi nhận dịch vụ vào hóa đơn thành công."));
    }

    @GetMapping("/cleaning-tasks")
    public ResponseEntity<List<HousekeepingDtos.CleaningTaskDto>> getCleaningTasks() {
        List<HousekeepingDtos.CleaningTaskDto> dtoList = serviceHkUseCase.getAllTasks().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PatchMapping("/cleaning-tasks/{id}/status")
    public ResponseEntity<HousekeepingDtos.CleaningTaskDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody HousekeepingDtos.UpdateTaskStatusRequest req) {

        CleaningTask task = serviceHkUseCase.updateTaskStatus(id, req.status());
        return ResponseEntity.ok(toDto(task));
    }

    private HousekeepingDtos.CleaningTaskDto toDto(CleaningTask t) {
        return new HousekeepingDtos.CleaningTaskDto(
                t.getId(),
                t.getRoomId(),
                t.getRoomNumber(),
                t.getHousekeeperId(),
                t.getHousekeeperName(),
                t.getStatus(),
                t.getNotes()
        );
    }
}
