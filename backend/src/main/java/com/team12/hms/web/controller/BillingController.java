package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.BillingUseCase;
import com.team12.hms.domain.billing.Invoice;
import com.team12.hms.web.dto.BillingDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/invoices")
public class BillingController {

    private final BillingUseCase billingUseCase;

    public BillingController(BillingUseCase billingUseCase) {
        this.billingUseCase = billingUseCase;
    }

    @GetMapping
    public ResponseEntity<List<BillingDtos.InvoiceDto>> getAllInvoices() {
        List<BillingDtos.InvoiceDto> dtoList = billingUseCase.getAllInvoices().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingDtos.InvoiceDto> getInvoice(@PathVariable UUID id) {
        Invoice invoice = billingUseCase.getById(id);
        return ResponseEntity.ok(toDto(invoice));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<BillingDtos.PayInvoiceResponse> payInvoice(
            @PathVariable UUID id,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody BillingDtos.PayInvoiceRequest req) {

        Map<String, Object> result = billingUseCase.payInvoice(id, req.amount(), idempotencyKey);
        BillingDtos.PayInvoiceResponse resp = new BillingDtos.PayInvoiceResponse(
                (String) result.get("invoiceNumber"),
                (String) result.get("status"),
                (BigDecimal) result.get("amountPaid"),
                (BigDecimal) result.get("amountDue"),
                (String) result.get("idempotencyKey")
        );
        return ResponseEntity.ok(resp);
    }

    private BillingDtos.InvoiceDto toDto(Invoice inv) {
        return new BillingDtos.InvoiceDto(
                inv.getId(),
                inv.getInvoiceNumber(),
                inv.getReservationId(),
                inv.getReservationCode(),
                inv.getRoomNumber(),
                inv.getGuestName(),
                inv.getRoomCharge(),
                inv.getTotalAmount(),
                inv.getDepositPaid(),
                inv.getAmountDue(),
                inv.getStatus()
        );
    }
}
