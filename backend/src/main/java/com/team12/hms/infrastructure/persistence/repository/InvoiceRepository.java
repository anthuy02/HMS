package com.team12.hms.infrastructure.persistence.repository;

import com.team12.hms.infrastructure.persistence.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {
    Optional<InvoiceEntity> findByInvoiceNumber(String invoiceNumber);
    Optional<InvoiceEntity> findByReservationId(UUID reservationId);
}
