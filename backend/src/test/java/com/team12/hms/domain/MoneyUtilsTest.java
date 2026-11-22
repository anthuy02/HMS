package com.team12.hms.domain;

import com.team12.hms.domain.common.MoneyUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MoneyUtilsTest {

    @Test
    @DisplayName("[BR-53] Làm tròn HALF_UP chuẩn xác về 1 VNĐ")
    void testRoundHalfUp() {
        assertEquals(BigDecimal.ZERO, MoneyUtils.roundHalfUp(null));
        assertEquals(new BigDecimal("100"), MoneyUtils.roundHalfUp(new BigDecimal("100.49")));
        assertEquals(new BigDecimal("101"), MoneyUtils.roundHalfUp(new BigDecimal("100.50")));
        assertEquals(new BigDecimal("101"), MoneyUtils.roundHalfUp(new BigDecimal("100.51")));
        assertEquals(new BigDecimal("-100"), MoneyUtils.roundHalfUp(new BigDecimal("-100.49")));
        assertEquals(new BigDecimal("-101"), MoneyUtils.roundHalfUp(new BigDecimal("-100.50")));
    }

    @Test
    @DisplayName("Chuyển null thành BigDecimal.ZERO")
    void testZeroIfNull() {
        assertEquals(BigDecimal.ZERO, MoneyUtils.zeroIfNull(null));
        assertEquals(new BigDecimal("250000"), MoneyUtils.zeroIfNull(new BigDecimal("250000")));
    }
}
