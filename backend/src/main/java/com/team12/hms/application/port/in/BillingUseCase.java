package com.team12.hms.application.port.in;

import com.team12.hms.domain.billing.Invoice;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface BillingUseCase {
    List<Invoice> getAllInvoices();
    Invoice getById(UUID id);
    Map<String, Object> payInvoice(UUID invoiceId, BigDecimal paymentAmount, String idempotencyKey);
}
