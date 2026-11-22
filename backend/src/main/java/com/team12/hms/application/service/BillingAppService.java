package com.team12.hms.application.service;

import com.team12.hms.application.port.in.BillingUseCase;
import com.team12.hms.application.port.out.InvoicePort;
import com.team12.hms.domain.billing.Invoice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BillingAppService implements BillingUseCase {

    private final InvoicePort invoicePort;

    public BillingAppService(InvoicePort invoicePort) {
        this.invoicePort = invoicePort;
    }

    @Override
    public List<Invoice> getAllInvoices() {
        return invoicePort.findAll();
    }

    @Override
    public Invoice getById(UUID id) {
        return invoicePort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn."));
    }

    @Override
    @Transactional
    public Map<String, Object> payInvoice(UUID invoiceId, BigDecimal paymentAmount, String idempotencyKey) {
        Invoice invoice = getById(invoiceId);

        // BR-84..86: Thanh toán quyết toán
        if (paymentAmount.compareTo(invoice.getAmountDue()) != 0) {
            throw new IllegalArgumentException("[BR-84] Số tiền thanh toán (" + paymentAmount + ") phải bằng đúng số dư nợ (" + invoice.getAmountDue() + ").");
        }

        invoice.setAmountDue(BigDecimal.ZERO);
        invoice.setStatus("PAID");
        invoicePort.save(invoice);

        return Map.of(
            "invoiceNumber", invoice.getInvoiceNumber(),
            "status", "PAID",
            "amountPaid", paymentAmount,
            "amountDue", BigDecimal.ZERO,
            "idempotencyKey", idempotencyKey != null ? idempotencyKey : ""
        );
    }
}
