package com.team12.hms.domain.config;

import java.math.BigDecimal;

/**
 * [BR-88] System configuration with scale <= 2.
 */
public record SystemConfig(
        BigDecimal depositRatePercent,
        BigDecimal serviceFeeRatePercent,
        BigDecimal vatRatePercent
) {
    public SystemConfig {
        if (depositRatePercent == null || depositRatePercent.scale() > 2) {
            throw new IllegalArgumentException("[BR-88] Tỷ lệ cọc phải có scale <= 2.");
        }
        if (serviceFeeRatePercent == null || serviceFeeRatePercent.scale() > 2) {
            throw new IllegalArgumentException("[BR-88] Phí dịch vụ phải có scale <= 2.");
        }
        if (vatRatePercent == null || vatRatePercent.scale() > 2) {
            throw new IllegalArgumentException("[BR-88] Thuế VAT phải có scale <= 2.");
        }
    }
}
