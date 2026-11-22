package com.team12.hms.domain;

import com.team12.hms.domain.reservation.CancellationPolicy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CancellationPolicyTest {

    @Test
    @DisplayName("[BR-21, BR-22] Hủy trước 72 giờ: Hoàn 100% tiền cọc")
    void testRefund100Percent() {
        BigDecimal deposit = new BigDecimal("1000000");

        // Lớn hơn 72 giờ
        var res1 = CancellationPolicy.calculateRefund(deposit, 75.0);
        assertEquals(new BigDecimal("100.0"), res1.refundPercentage());
        assertEquals(new BigDecimal("1000000"), res1.refundAmount());
        assertEquals(BigDecimal.ZERO, res1.forfeitedAmount());

        // Đúng mốc biên 72.0 giờ
        var res2 = CancellationPolicy.calculateRefund(deposit, 72.0);
        assertEquals(new BigDecimal("100.0"), res2.refundPercentage());
        assertEquals(new BigDecimal("1000000"), res2.refundAmount());
        assertEquals(BigDecimal.ZERO, res2.forfeitedAmount());
    }

    @Test
    @DisplayName("[BR-21, BR-22] Hủy từ 24 đến dưới 72 giờ: Hoàn 50% tiền cọc")
    void testRefund50Percent() {
        BigDecimal deposit = new BigDecimal("1000000");

        // Ngay sát dưới 72 giờ (71.9 giờ)
        var res1 = CancellationPolicy.calculateRefund(deposit, 71.9);
        assertEquals(new BigDecimal("50.0"), res1.refundPercentage());
        assertEquals(new BigDecimal("500000"), res1.refundAmount());
        assertEquals(new BigDecimal("500000"), res1.forfeitedAmount());

        // Ở giữa (48 giờ)
        var res2 = CancellationPolicy.calculateRefund(deposit, 48.0);
        assertEquals(new BigDecimal("50.0"), res2.refundPercentage());
        assertEquals(new BigDecimal("500000"), res2.refundAmount());
        assertEquals(new BigDecimal("500000"), res2.forfeitedAmount());

        // Đúng mốc biên 24.0 giờ
        var res3 = CancellationPolicy.calculateRefund(deposit, 24.0);
        assertEquals(new BigDecimal("50.0"), res3.refundPercentage());
        assertEquals(new BigDecimal("500000"), res3.refundAmount());
        assertEquals(new BigDecimal("500000"), res3.forfeitedAmount());
    }

    @Test
    @DisplayName("[BR-21, BR-22] Hủy dưới 24 giờ: Mất 100% cọc (hoàn 0%)")
    void testRefund0Percent() {
        BigDecimal deposit = new BigDecimal("1000000");

        // Ngay sát dưới 24 giờ (23.9 giờ)
        var res1 = CancellationPolicy.calculateRefund(deposit, 23.9);
        assertEquals(BigDecimal.ZERO, res1.refundPercentage());
        assertEquals(BigDecimal.ZERO, res1.refundAmount());
        assertEquals(new BigDecimal("1000000"), res1.forfeitedAmount());

        // 0 giờ hoặc quá giờ
        var res2 = CancellationPolicy.calculateRefund(deposit, 0.0);
        assertEquals(BigDecimal.ZERO, res2.refundPercentage());
        assertEquals(BigDecimal.ZERO, res2.refundAmount());
        assertEquals(new BigDecimal("1000000"), res2.forfeitedAmount());

        var res3 = CancellationPolicy.calculateRefund(deposit, -2.0);
        assertEquals(BigDecimal.ZERO, res3.refundPercentage());
        assertEquals(BigDecimal.ZERO, res3.refundAmount());
        assertEquals(new BigDecimal("1000000"), res3.forfeitedAmount());
    }

    @Test
    @DisplayName("Tiền cọc null hoặc <= 0 thì hoàn 0")
    void testZeroOrNullDeposit() {
        var resNull = CancellationPolicy.calculateRefund(null, 100.0);
        assertEquals(BigDecimal.ZERO, resNull.refundAmount());
        assertEquals(BigDecimal.ZERO, resNull.forfeitedAmount());

        var resZero = CancellationPolicy.calculateRefund(BigDecimal.ZERO, 100.0);
        assertEquals(BigDecimal.ZERO, resZero.refundAmount());
        assertEquals(BigDecimal.ZERO, resZero.forfeitedAmount());

        var resNegative = CancellationPolicy.calculateRefund(new BigDecimal("-100"), 100.0);
        assertEquals(BigDecimal.ZERO, resNegative.refundAmount());
        assertEquals(BigDecimal.ZERO, resNegative.forfeitedAmount());
    }

    @Test
    @DisplayName("Kiểm tra constructor Policy")
    void testConstructor() {
        CancellationPolicy policy = new CancellationPolicy();
        assertNotNull(policy);
    }
}
