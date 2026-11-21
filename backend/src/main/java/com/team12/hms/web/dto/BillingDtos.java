package com.team12.hms.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class BillingDtos {
    public record InvoiceDto(
            UUID id,
            String invoiceNumber,
            UUID reservationId,
            String reservationCode,
            String roomNumber,
            String guestName,
            BigDecimal roomCharge,
            BigDecimal totalAmount,
            BigDecimal depositPaid,
            BigDecimal amountDue,
            String status
    ) {}

    public record PayInvoiceRequest(
            BigDecimal amount,
            String method,
            String note
    ) {}

    public record PayInvoiceResponse(
            String invoiceNumber,
            String status,
            BigDecimal amountPaid,
            BigDecimal amountDue,
            String idempotencyKey
    ) {}
}
