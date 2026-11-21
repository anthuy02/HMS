package com.team12.hms.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invoices")
public class InvoiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "invoice_number", unique = true, nullable = false, length = 20)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private ReservationEntity reservation;

    @Column(name = "room_charge", precision = 15, scale = 0)
    private BigDecimal roomCharge = BigDecimal.ZERO;

    @Column(name = "holiday_surcharge", precision = 15, scale = 0)
    private BigDecimal holidaySurcharge = BigDecimal.ZERO;

    @Column(name = "early_checkin_surcharge", precision = 15, scale = 0)
    private BigDecimal earlyCheckInSurcharge = BigDecimal.ZERO;

    @Column(name = "late_checkout_surcharge", precision = 15, scale = 0)
    private BigDecimal lateCheckOutSurcharge = BigDecimal.ZERO;

    @Column(name = "extra_person_surcharge", precision = 15, scale = 0)
    private BigDecimal extraPersonSurcharge = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 0)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "service_fee", precision = 15, scale = 0)
    private BigDecimal serviceFee = BigDecimal.ZERO;

    @Column(name = "services_total", precision = 15, scale = 0)
    private BigDecimal servicesTotal = BigDecimal.ZERO;

    @Column(name = "vat_amount", precision = 15, scale = 0)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 15, scale = 0)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "deposit_deducted", precision = 15, scale = 0)
    private BigDecimal depositDeducted = BigDecimal.ZERO;

    @Column(name = "amount_due", precision = 15, scale = 0)
    private BigDecimal amountDue = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "issued_at")
    private Instant issuedAt;

    public InvoiceEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public ReservationEntity getReservation() { return reservation; }
    public void setReservation(ReservationEntity reservation) { this.reservation = reservation; }
    public BigDecimal getRoomCharge() { return roomCharge; }
    public void setRoomCharge(BigDecimal roomCharge) { this.roomCharge = roomCharge; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getAmountDue() { return amountDue; }
    public void setAmountDue(BigDecimal amountDue) { this.amountDue = amountDue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getIssuedAt() { return issuedAt; }
    public void setIssuedAt(Instant issuedAt) { this.issuedAt = issuedAt; }
}
