package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.SystemConfigUseCase;
import com.team12.hms.domain.config.SystemConfig;
import com.team12.hms.web.dto.SystemConfigDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class SystemConfigController {

    private final SystemConfigUseCase systemConfigUseCase;

    public SystemConfigController(SystemConfigUseCase systemConfigUseCase) {
        this.systemConfigUseCase = systemConfigUseCase;
    }

    @GetMapping("/config")
    public ResponseEntity<SystemConfigDtos.SystemConfigDto> getConfig() {
        SystemConfig cfg = systemConfigUseCase.getConfig();
        return ResponseEntity.ok(toDto(cfg));
    }

    @PutMapping("/config")
    public ResponseEntity<SystemConfigDtos.SystemConfigDto> updateConfig(@RequestBody SystemConfigDtos.UpdateSystemConfigRequest req) {
        Map<String, Object> data = new HashMap<>();
        if (req.depositRatePercent() != null) data.put("depositRatePercent", req.depositRatePercent());
        if (req.serviceFeeRatePercent() != null) data.put("serviceFeeRatePercent", req.serviceFeeRatePercent());
        if (req.vatRatePercent() != null) data.put("vatRatePercent", req.vatRatePercent());

        SystemConfig updated = systemConfigUseCase.updateConfig(data);
        return ResponseEntity.ok(toDto(updated));
    }

    @GetMapping("/holidays")
    public ResponseEntity<List<SystemConfigDtos.HolidayDto>> getHolidays() {
        return ResponseEntity.ok(List.of(
            new SystemConfigDtos.HolidayDto("01/01", "Tết Dương Lịch"),
            new SystemConfigDtos.HolidayDto("30/04", "Ngày Giải Phóng Miền Nam"),
            new SystemConfigDtos.HolidayDto("01/05", "Quốc Tế Lao Động"),
            new SystemConfigDtos.HolidayDto("02/09", "Quốc Khánh")
        ));
    }

    private SystemConfigDtos.SystemConfigDto toDto(SystemConfig cfg) {
        return new SystemConfigDtos.SystemConfigDto(
                cfg.depositRatePercent(),
                cfg.serviceFeeRatePercent(),
                cfg.vatRatePercent()
        );
    }
}
