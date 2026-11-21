package com.team12.hms.domain;

import com.team12.hms.domain.billing.BillingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
}
