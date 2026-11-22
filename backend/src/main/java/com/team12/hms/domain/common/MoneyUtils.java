package com.team12.hms.domain.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * [BR-50, BR-53] Làm tròn HALF_UP về 1 VNĐ, đúng một lần cho mỗi dòng tiền.
 */
public final class MoneyUtils {
    private MoneyUtils() {}

    public static BigDecimal roundHalfUp(BigDecimal amount) {
        if (amount == null) return BigDecimal.ZERO;
        return amount.setScale(0, RoundingMode.HALF_UP);
    }

    public static BigDecimal zeroIfNull(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}
