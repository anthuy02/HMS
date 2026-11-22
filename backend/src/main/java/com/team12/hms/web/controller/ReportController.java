package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.ReportUseCase;
import com.team12.hms.web.dto.SystemConfigDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportUseCase reportUseCase;

    public ReportController(ReportUseCase reportUseCase) {
        this.reportUseCase = reportUseCase;
    }

    @GetMapping("/room-status")
    public ResponseEntity<Map<String, Long>> getRoomStatus() {
        return ResponseEntity.ok(reportUseCase.getRoomStatusCounts());
    }

    @GetMapping("/today-operations")
    public ResponseEntity<Map<String, Object>> getTodayOperations() {
        return ResponseEntity.ok(reportUseCase.getTodayOperations());
    }

    @GetMapping("/revenue")
    public ResponseEntity<SystemConfigDtos.RevenueReportDto> getRevenue(
            @RequestParam(defaultValue = "2026-01-01") String from,
            @RequestParam(defaultValue = "2026-12-31") String to) {

        Map<String, Object> result = reportUseCase.getRevenueReport(from, to);
        SystemConfigDtos.RevenueReportDto dto = new SystemConfigDtos.RevenueReportDto(
                (BigDecimal) result.get("totalRevenue"),
                (BigDecimal) result.get("totalRefunds"),
                (BigDecimal) result.get("totalForfeitedDeposits"),
                ((Number) result.get("occupancyRate")).doubleValue()
        );
        return ResponseEntity.ok(dto);
    }
}
