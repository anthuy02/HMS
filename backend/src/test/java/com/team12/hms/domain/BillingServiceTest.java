package com.team12.hms.domain;

import com.team12.hms.domain.billing.BillingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class BillingServiceTest {

    @Test
    @DisplayName("[BR-50] Kiểm tra tính toán hóa đơn 11 bước chuẩn xác")
    void testStandardInvoiceCalculation() {
        var result = BillingService.calculateInvoice(
                new BigDecimal("3000000"), // roomCharge (3 đêm x 1.000.000)
                BigDecimal.ZERO,           // holidaySurcharge
                BigDecimal.ZERO,           // earlyCheckIn
                BigDecimal.ZERO,           // lateCheckOut
                BigDecimal.ZERO,           // extraAdult
                BigDecimal.ZERO,           // extraChild
                BigDecimal.ZERO,           // discount
                new BigDecimal("5.00"),    // serviceFee 5% -> 150.000
                BigDecimal.ZERO,           // extraServices
                new BigDecimal("10.00"),   // vat 10%
                new BigDecimal("1000000")  // depositPaid
        );

        assertEquals(new BigDecimal("3000000"), result.roomCharge());
        assertEquals(BigDecimal.ZERO, result.holidaySurcharge());
        assertEquals(BigDecimal.ZERO, result.earlyCheckInSurcharge());
        assertEquals(BigDecimal.ZERO, result.lateCheckOutSurcharge());
        assertEquals(BigDecimal.ZERO, result.extraAdultSurcharge());
        assertEquals(BigDecimal.ZERO, result.extraChildSurcharge());
        assertEquals(BigDecimal.ZERO, result.discountAmount());
        assertEquals(BigDecimal.ZERO, result.extraServicesTotal());

        // Subtotal = 3.000.000
        // Service fee = 150.000
        assertEquals(new BigDecimal("150000"), result.serviceFee());

        // Taxable = 3.150.000
        assertEquals(new BigDecimal("3150000"), result.taxableAmount());

        // VAT 10% = 315.000
        assertEquals(new BigDecimal("315000"), result.vatAmount());

        // Total = 3.465.000
        assertEquals(new BigDecimal("3465000"), result.totalAmount());

        // Amount Due = 3.465.000 - 1.000.000 = 2.465.000
        assertEquals(new BigDecimal("2465000"), result.amountDue());
    }

    @Test
    @DisplayName("[BR-50] Tính toán đầy đủ tất cả phụ thu, dịch vụ thêm và chiết khấu")
    void testFullSurchargesAndDiscounts() {
        var result = BillingService.calculateInvoice(
                new BigDecimal("2000000"), // roomCharge
                new BigDecimal("400000"),  // holidaySurcharge (+20%)
                new BigDecimal("300000"),  // earlyCheckIn
                new BigDecimal("300000"),  // lateCheckOut
                new BigDecimal("200000"),  // extraAdult
                new BigDecimal("100000"),  // extraChild
                new BigDecimal("500000"),  // discount
                new BigDecimal("5.00"),    // 5% service fee
                new BigDecimal("600000"),  // extraServices (minibar/laundry)
                new BigDecimal("10.00"),   // 10% VAT
                new BigDecimal("1500000")  // depositPaid
        );

        // roomSubtotal = 2.000.000 + 400.000 + 300.000 + 300.000 + 200.000 + 100.000 - 500.000 = 2.800.000
        // serviceFee = 2.800.000 * 5% = 140.000
        assertEquals(new BigDecimal("140000"), result.serviceFee());

        // taxableAmount = 2.800.000 + 140.000 + 600.000 = 3.540.000
        assertEquals(new BigDecimal("3540000"), result.taxableAmount());

        // vatAmount = 3.540.000 * 10% = 354.000
        assertEquals(new BigDecimal("354000"), result.vatAmount());

        // totalAmount = 3.540.000 + 354.000 = 3.894.000
        assertEquals(new BigDecimal("3894000"), result.totalAmount());

        // amountDue = 3.894.000 - 1.500.000 = 2.394.000
        assertEquals(new BigDecimal("2394000"), result.amountDue());
    }

    @Test
    @DisplayName("[BR-43] Trần chiết khấu không được vượt quá tiền phòng (capped at roomCharge)")
    void testDiscountCapping() {
        var result = BillingService.calculateInvoice(
                new BigDecimal("1000000"), // roomCharge
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("1500000"), // discount > roomCharge (muốn giảm 1.5M trên phòng 1M)
                new BigDecimal("5.00"),
                BigDecimal.ZERO,
                new BigDecimal("10.00"),
                BigDecimal.ZERO
        );

        // Chiết khấu bị trần tại 1.000.000
        assertEquals(new BigDecimal("1000000"), result.discountAmount());
        // roomSubtotal = 1.000.000 - 1.000.000 = 0
        assertEquals(BigDecimal.ZERO, result.serviceFee());
        assertEquals(BigDecimal.ZERO, result.taxableAmount());
        assertEquals(BigDecimal.ZERO, result.vatAmount());
        assertEquals(BigDecimal.ZERO, result.totalAmount());
        assertEquals(BigDecimal.ZERO, result.amountDue());
    }

    @Test
    @DisplayName("Xử lý an toàn khi các tham số đầu vào là null")
    void testNullParametersHandling() {
        var result = BillingService.calculateInvoice(
                null, null, null, null, null, null, null,
                new BigDecimal("5.00"),
                null,
                new BigDecimal("10.00"),
                null
        );

        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.roomCharge());
        assertEquals(BigDecimal.ZERO, result.totalAmount());
        assertEquals(BigDecimal.ZERO, result.amountDue());
    }

    @Test
    @DisplayName("Kiểm tra làm tròn HALF_UP của phí dịch vụ và VAT")
    void testRoundingHalfUp() {
        // roomSubtotal = 111.111
        // serviceFee = 111.111 * 5% = 5.555,55 -> làm tròn thành 5556
        var result = BillingService.calculateInvoice(
                new BigDecimal("111111"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("5.00"),
                BigDecimal.ZERO,
                new BigDecimal("10.00"),
                BigDecimal.ZERO
        );

        assertEquals(new BigDecimal("5556"), result.serviceFee());
        // taxable = 111.111 + 5.556 = 116.667
        // vat = 116.667 * 10% = 11.666,7 -> làm tròn thành 11667
        assertEquals(new BigDecimal("11667"), result.vatAmount());
    }

    @Test
    @DisplayName("Kiểm tra constructor và khởi tạo record BillingService")
    void testRecordAndConstructor() {
        BillingService service = new BillingService();
        assertNotNull(service);
    }
}
