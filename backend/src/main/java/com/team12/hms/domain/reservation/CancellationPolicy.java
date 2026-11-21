package com.team12.hms.domain.reservation;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * [BR-21, BR-22] Tính H & mức hoàn cọc 100% / 50% / 0%.
 */
public class CancellationPolicy {
    public record RefundCalculation(BigDecimal refundPercentage, BigDecimal refundAmount, BigDecimal forfeitedAmount) {}

    public static RefundCalculation calculateRefund(BigDecimal depositPaid, double hoursRemaining) {
        if (depositPaid == null || depositPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return new RefundCalculation(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal percentage;
        if (hoursRemaining >= 72.0) {
            percentage = new BigDecimal("100.0"); // 100%
        } else if (hoursRemaining >= 24.0) {
            percentage = new BigDecimal("50.0");  // 50%
        } else {
            percentage = BigDecimal.ZERO;         // 0%
        }

        BigDecimal refundAmount = depositPaid.multiply(percentage)
                .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
        BigDecimal forfeitedAmount = depositPaid.subtract(refundAmount);

        return new RefundCalculation(percentage, refundAmount, forfeitedAmount);
    }
}
