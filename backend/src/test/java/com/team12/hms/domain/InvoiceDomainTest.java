package com.team12.hms.domain;

import com.team12.hms.domain.billing.Invoice;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InvoiceDomainTest {

    @Test
    @DisplayName("Kiểm tra Invoice getters và setters")
    void testGettersAndSetters() {
        Invoice inv = new Invoice();
        UUID id = UUID.randomUUID();
        UUID resId = UUID.randomUUID();
        Instant now = Instant.now();

        inv.setId(id);
        inv.setInvoiceNumber("INV-001");
        inv.setReservationId(resId);
        inv.setReservationCode("RES-001");
        inv.setRoomNumber("101");
        inv.setGuestName("Khách A");
        inv.setRoomCharge(new BigDecimal("1000000"));
        inv.setHolidaySurcharge(new BigDecimal("200000"));
        inv.setEarlyCheckInSurcharge(new BigDecimal("150000"));
        inv.setLateCheckOutSurcharge(new BigDecimal("150000"));
        inv.setExtraAdultSurcharge(new BigDecimal("100000"));
        inv.setExtraChildSurcharge(new BigDecimal("50000"));
        inv.setDiscount(new BigDecimal("100000"));
        inv.setExtraServicesTotal(new BigDecimal("300000"));
        inv.setServiceFeeBase(new BigDecimal("1550000"));
        inv.setServiceFee(new BigDecimal("77500"));
        inv.setTaxableAmount(new BigDecimal("1927500"));
        inv.setVatAmount(new BigDecimal("192750"));
        inv.setTotalAmount(new BigDecimal("2120250"));
        inv.setDepositPaid(new BigDecimal("500000"));
        inv.setAmountDue(new BigDecimal("1620250"));
        inv.setStatus("UNPAID");
        inv.setIssuedAt(now);
        inv.setPaidAt(now);
        inv.setCreatedAt(now);

        assertEquals(id, inv.getId());
        assertEquals("INV-001", inv.getInvoiceNumber());
        assertEquals(resId, inv.getReservationId());
        assertEquals("RES-001", inv.getReservationCode());
        assertEquals("101", inv.getRoomNumber());
        assertEquals("Khách A", inv.getGuestName());
        assertEquals(new BigDecimal("1000000"), inv.getRoomCharge());
        assertEquals(new BigDecimal("200000"), inv.getHolidaySurcharge());
        assertEquals(new BigDecimal("150000"), inv.getEarlyCheckInSurcharge());
        assertEquals(new BigDecimal("150000"), inv.getLateCheckOutSurcharge());
        assertEquals(new BigDecimal("100000"), inv.getExtraAdultSurcharge());
        assertEquals(new BigDecimal("50000"), inv.getExtraChildSurcharge());
        assertEquals(new BigDecimal("100000"), inv.getDiscount());
        assertEquals(new BigDecimal("300000"), inv.getExtraServicesTotal());
        assertEquals(new BigDecimal("1550000"), inv.getServiceFeeBase());
        assertEquals(new BigDecimal("77500"), inv.getServiceFee());
        assertEquals(new BigDecimal("1927500"), inv.getTaxableAmount());
        assertEquals(new BigDecimal("192750"), inv.getVatAmount());
        assertEquals(new BigDecimal("2120250"), inv.getTotalAmount());
        assertEquals(new BigDecimal("500000"), inv.getDepositPaid());
        assertEquals(new BigDecimal("1620250"), inv.getAmountDue());
        assertEquals("UNPAID", inv.getStatus());
        assertEquals(now, inv.getIssuedAt());
        assertEquals(now, inv.getPaidAt());
        assertEquals(now, inv.getCreatedAt());
    }
}
