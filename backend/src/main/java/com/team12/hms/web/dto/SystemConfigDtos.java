package com.team12.hms.web.dto;

import java.math.BigDecimal;

public class SystemConfigDtos {
    public record SystemConfigDto(
            BigDecimal depositRatePercent,
            BigDecimal serviceFeeRatePercent,
            BigDecimal vatRatePercent
    ) {}

    public record UpdateSystemConfigRequest(
            BigDecimal depositRatePercent,
            BigDecimal serviceFeeRatePercent,
            BigDecimal vatRatePercent
    ) {}

    public record HolidayDto(
            String dayMonth,
            String name
    ) {}

    public record RevenueReportDto(
            BigDecimal totalRevenue,
            BigDecimal totalRefunds,
            BigDecimal totalForfeitedDeposits,
            double occupancyRate
    ) {}
}
