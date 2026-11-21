package com.team12.hms.infrastructure.persistence.adapter;

import com.team12.hms.application.port.out.InvoicePort;
import com.team12.hms.domain.billing.Invoice;
import com.team12.hms.infrastructure.persistence.entity.InvoiceEntity;
import com.team12.hms.infrastructure.persistence.entity.ReservationEntity;
import com.team12.hms.infrastructure.persistence.repository.InvoiceRepository;
import com.team12.hms.infrastructure.persistence.repository.ReservationRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class InvoicePersistenceAdapter implements InvoicePort {

    private final InvoiceRepository invoiceRepository;
    private final ReservationRepository reservationRepository;

    public InvoicePersistenceAdapter(InvoiceRepository invoiceRepository,
                                     ReservationRepository reservationRepository) {
        this.invoiceRepository = invoiceRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public List<Invoice> findAll() {
        return invoiceRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<Invoice> findById(UUID id) {
        return invoiceRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Invoice> findByReservationId(UUID reservationId) {
        return invoiceRepository.findByReservationId(reservationId).map(this::toDomain);
    }

    @Override
    public Invoice save(Invoice invoice) {
        InvoiceEntity entity = toEntity(invoice);
        InvoiceEntity saved = invoiceRepository.save(entity);
        return toDomain(saved);
    }

    private Invoice toDomain(InvoiceEntity e) {
        if (e == null) return null;
        Invoice d = new Invoice();
        d.setId(e.getId());
        d.setInvoiceNumber(e.getInvoiceNumber());
        if (e.getReservation() != null) {
            d.setReservationId(e.getReservation().getId());
            d.setReservationCode(e.getReservation().getReservationCode());
            d.setGuestName(e.getReservation().getGuestName());
            if (e.getReservation().getRoom() != null) {
                d.setRoomNumber(e.getReservation().getRoom().getRoomNumber());
            }
        }
        d.setRoomCharge(e.getRoomCharge());
        d.setHolidaySurcharge(e.getHolidaySurcharge());
        d.setEarlyCheckInSurcharge(e.getEarlyCheckInSurcharge());
        d.setLateCheckOutSurcharge(e.getLateCheckOutSurcharge());
        d.setExtraAdultSurcharge(e.getExtraAdultSurcharge());
        d.setExtraChildSurcharge(e.getExtraChildSurcharge());
        d.setDiscount(e.getDiscount());
        d.setExtraServicesTotal(e.getExtraServicesTotal());
        d.setServiceFeeBase(e.getServiceFeeBase());
        d.setServiceFee(e.getServiceFee());
        d.setTaxableAmount(e.getTaxableAmount());
        d.setVatAmount(e.getVatAmount());
        d.setTotalAmount(e.getTotalAmount());
        d.setDepositPaid(e.getDepositPaid());
        d.setAmountDue(e.getAmountDue());
        d.setStatus(e.getStatus());
        d.setIssuedAt(e.getIssuedAt());
        d.setPaidAt(e.getPaidAt());
        d.setCreatedAt(e.getCreatedAt());
        return d;
    }

    private InvoiceEntity toEntity(Invoice d) {
        if (d == null) return null;
        InvoiceEntity e = (d.getId() != null)
                ? invoiceRepository.findById(d.getId()).orElse(new InvoiceEntity())
                : new InvoiceEntity();

        if (d.getId() != null) e.setId(d.getId());
        e.setInvoiceNumber(d.getInvoiceNumber());
        if (d.getReservationId() != null) {
            ReservationEntity res = reservationRepository.findById(d.getReservationId()).orElse(null);
            e.setReservation(res);
        }
        e.setRoomCharge(d.getRoomCharge());
        e.setHolidaySurcharge(d.getHolidaySurcharge());
        e.setEarlyCheckInSurcharge(d.getEarlyCheckInSurcharge());
        e.setLateCheckOutSurcharge(d.getLateCheckOutSurcharge());
        e.setExtraAdultSurcharge(d.getExtraAdultSurcharge());
        e.setExtraChildSurcharge(d.getExtraChildSurcharge());
        e.setDiscount(d.getDiscount());
        e.setExtraServicesTotal(d.getExtraServicesTotal());
        e.setServiceFeeBase(d.getServiceFeeBase());
        e.setServiceFee(d.getServiceFee());
        e.setTaxableAmount(d.getTaxableAmount());
        e.setVatAmount(d.getVatAmount());
        e.setTotalAmount(d.getTotalAmount());
        e.setDepositPaid(d.getDepositPaid());
        e.setAmountDue(d.getAmountDue());
        e.setStatus(d.getStatus());
        e.setIssuedAt(d.getIssuedAt());
        e.setPaidAt(d.getPaidAt());
        return e;
    }
}
