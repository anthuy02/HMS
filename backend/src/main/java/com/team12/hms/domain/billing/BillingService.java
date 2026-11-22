package com.team12.hms.domain.billing;

import com.team12.hms.domain.common.MoneyUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * [BR-50, BR-53] Tính toán hóa đơn 11 bước chuẩn mực, làm tròn HALF_UP từng dòng 1 lần.
 */
public class BillingService {

    public record InvoiceCalculationResult(
            BigDecimal roomCharge,
            BigDecimal holidaySurcharge,
            BigDecimal earlyCheckInSurcharge,
            BigDecimal lateCheckOutSurcharge,
            BigDecimal extraAdultSurcharge,
            BigDecimal extraChildSurcharge,
            BigDecimal discountAmount,
            BigDecimal serviceFee,
            BigDecimal extraServicesTotal,
            BigDecimal taxableAmount,
            BigDecimal vatAmount,
            BigDecimal totalAmount,
            BigDecimal amountDue
    ) {}

    public static InvoiceCalculationResult calculateInvoice(
            BigDecimal roomCharge,
            BigDecimal holidaySurcharge,
            BigDecimal earlyCheckInSurcharge,
            BigDecimal lateCheckOutSurcharge,
            BigDecimal extraAdultSurcharge,
            BigDecimal extraChildSurcharge,
            BigDecimal discountAmount,
            BigDecimal serviceFeeRatePercent,
            BigDecimal extraServicesTotal,
            BigDecimal vatRatePercent,
            BigDecimal depositPaid
    ) {
        roomCharge = MoneyUtils.zeroIfNull(roomCharge);
        holidaySurcharge = MoneyUtils.zeroIfNull(holidaySurcharge);
        earlyCheckInSurcharge = MoneyUtils.zeroIfNull(earlyCheckInSurcharge);
        lateCheckOutSurcharge = MoneyUtils.zeroIfNull(lateCheckOutSurcharge);
        extraAdultSurcharge = MoneyUtils.zeroIfNull(extraAdultSurcharge);
        extraChildSurcharge = MoneyUtils.zeroIfNull(extraChildSurcharge);
        extraServicesTotal = MoneyUtils.zeroIfNull(extraServicesTotal);
        depositPaid = MoneyUtils.zeroIfNull(depositPaid);

        // Trần chiết khấu tại roomCharge (BR-43)
        discountAmount = MoneyUtils.zeroIfNull(discountAmount).min(roomCharge);

        // Bước 8: Phí dịch vụ (5% trên tổng tiền phòng sau phụ thu và chiết khấu)
        BigDecimal roomSubtotal = roomCharge
                .add(holidaySurcharge)
                .add(earlyCheckInSurcharge)
                .add(lateCheckOutSurcharge)
                .add(extraAdultSurcharge)
                .add(extraChildSurcharge)
                .subtract(discountAmount)
                .max(BigDecimal.ZERO);

        BigDecimal serviceFee = roomSubtotal.multiply(serviceFeeRatePercent)
                .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);

        // Bước 9: Giá tính thuế VAT
        BigDecimal taxableAmount = roomSubtotal.add(serviceFee).add(extraServicesTotal);

        // Bước 10: Thuế VAT (10%)
        BigDecimal vatAmount = taxableAmount.multiply(vatRatePercent)
                .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);

        // Bước 11: Tổng tiền thanh toán & số dư cần quyết toán
        BigDecimal totalAmount = taxableAmount.add(vatAmount);
        BigDecimal amountDue = totalAmount.subtract(depositPaid);

        return new InvoiceCalculationResult(
                roomCharge, holidaySurcharge, earlyCheckInSurcharge, lateCheckOutSurcharge,
                extraAdultSurcharge, extraChildSurcharge, discountAmount, serviceFee,
                extraServicesTotal, taxableAmount, vatAmount, totalAmount, amountDue
        );
    }
}
