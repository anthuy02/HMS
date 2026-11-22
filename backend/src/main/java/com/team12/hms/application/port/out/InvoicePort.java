package com.team12.hms.application.port.out;

import com.team12.hms.domain.billing.Invoice;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoicePort {
    List<Invoice> findAll();
    Optional<Invoice> findById(UUID id);
    Optional<Invoice> findByReservationId(UUID reservationId);
    Invoice save(Invoice invoice);
}
