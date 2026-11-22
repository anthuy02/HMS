package com.team12.hms.domain;

import com.team12.hms.domain.config.SystemConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class SystemConfigTest {

    @Test
    @DisplayName("[BR-88] Khởi tạo SystemConfig hợp lệ với scale <= 2")
    void testValidSystemConfig() {
        SystemConfig config = new SystemConfig(
                new BigDecimal("30.00"),
                new BigDecimal("5.0"),
                new BigDecimal("10")
        );

        assertEquals(new BigDecimal("30.00"), config.depositRatePercent());
        assertEquals(new BigDecimal("5.0"), config.serviceFeeRatePercent());
        assertEquals(new BigDecimal("10"), config.vatRatePercent());
    }

    @Test
    @DisplayName("[BR-88] Tỷ lệ cọc scale > 2 hoặc null ném ngoại lệ")
    void testInvalidDepositRate() {
        assertThrows(IllegalArgumentException.class, () ->
                new SystemConfig(null, new BigDecimal("5.00"), new BigDecimal("10.00")));
        assertThrows(IllegalArgumentException.class, () ->
                new SystemConfig(new BigDecimal("30.123"), new BigDecimal("5.00"), new BigDecimal("10.00")));
    }

    @Test
    @DisplayName("[BR-88] Phí dịch vụ scale > 2 hoặc null ném ngoại lệ")
    void testInvalidServiceFeeRate() {
        assertThrows(IllegalArgumentException.class, () ->
                new SystemConfig(new BigDecimal("30.00"), null, new BigDecimal("10.00")));
        assertThrows(IllegalArgumentException.class, () ->
                new SystemConfig(new BigDecimal("30.00"), new BigDecimal("5.555"), new BigDecimal("10.00")));
    }

    @Test
    @DisplayName("[BR-88] Thuế VAT scale > 2 hoặc null ném ngoại lệ")
    void testInvalidVatRate() {
        assertThrows(IllegalArgumentException.class, () ->
                new SystemConfig(new BigDecimal("30.00"), new BigDecimal("5.00"), null));
        assertThrows(IllegalArgumentException.class, () ->
                new SystemConfig(new BigDecimal("30.00"), new BigDecimal("5.00"), new BigDecimal("10.001")));
    }
}
