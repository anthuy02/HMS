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

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Transient
    private BigDecimal extraAdultSurcharge = BigDecimal.ZERO;

    @Transient
    private BigDecimal extraChildSurcharge = BigDecimal.ZERO;

    @Transient
    private BigDecimal serviceFeeBase = BigDecimal.ZERO;

    @Transient
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Transient
    private Instant paidAt;

    public InvoiceEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public ReservationEntity getReservation() { return reservation; }
    public void setReservation(ReservationEntity reservation) { this.reservation = reservation; }
    public BigDecimal getRoomCharge() { return roomCharge; }
    public void setRoomCharge(BigDecimal roomCharge) { this.roomCharge = roomCharge; }
    public BigDecimal getHolidaySurcharge() { return holidaySurcharge; }
    public void setHolidaySurcharge(BigDecimal holidaySurcharge) { this.holidaySurcharge = holidaySurcharge; }
    public BigDecimal getEarlyCheckInSurcharge() { return earlyCheckInSurcharge; }
    public void setEarlyCheckInSurcharge(BigDecimal earlyCheckInSurcharge) { this.earlyCheckInSurcharge = earlyCheckInSurcharge; }
    public BigDecimal getLateCheckOutSurcharge() { return lateCheckOutSurcharge; }
    public void setLateCheckOutSurcharge(BigDecimal lateCheckOutSurcharge) { this.lateCheckOutSurcharge = lateCheckOutSurcharge; }
    public BigDecimal getExtraPersonSurcharge() { return extraPersonSurcharge; }
    public void setExtraPersonSurcharge(BigDecimal extraPersonSurcharge) { this.extraPersonSurcharge = extraPersonSurcharge; }
    public BigDecimal getExtraAdultSurcharge() { return extraAdultSurcharge != null ? extraAdultSurcharge : extraPersonSurcharge; }
    public void setExtraAdultSurcharge(BigDecimal extraAdultSurcharge) {
        this.extraAdultSurcharge = extraAdultSurcharge;
        this.extraPersonSurcharge = (extraAdultSurcharge != null ? extraAdultSurcharge : BigDecimal.ZERO)
                .add(extraChildSurcharge != null ? extraChildSurcharge : BigDecimal.ZERO);
    }
    public BigDecimal getExtraChildSurcharge() { return extraChildSurcharge != null ? extraChildSurcharge : BigDecimal.ZERO; }
    public void setExtraChildSurcharge(BigDecimal extraChildSurcharge) {
        this.extraChildSurcharge = extraChildSurcharge;
        this.extraPersonSurcharge = (extraAdultSurcharge != null ? extraAdultSurcharge : BigDecimal.ZERO)
                .add(extraChildSurcharge != null ? extraChildSurcharge : BigDecimal.ZERO);
    }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getDiscount() { return discountAmount; }
    public void setDiscount(BigDecimal discount) { this.discountAmount = discount; }
    public BigDecimal getServiceFee() { return serviceFee; }
    public void setServiceFee(BigDecimal serviceFee) { this.serviceFee = serviceFee; }
    public BigDecimal getServiceFeeBase() { return serviceFeeBase; }
    public void setServiceFeeBase(BigDecimal serviceFeeBase) { this.serviceFeeBase = serviceFeeBase; }
    public BigDecimal getServicesTotal() { return servicesTotal; }
    public void setServicesTotal(BigDecimal servicesTotal) { this.servicesTotal = servicesTotal; }
    public BigDecimal getExtraServicesTotal() { return servicesTotal; }
    public void setExtraServicesTotal(BigDecimal extraServicesTotal) { this.servicesTotal = extraServicesTotal; }
    public BigDecimal getTaxableAmount() { return taxableAmount; }
    public void setTaxableAmount(BigDecimal taxableAmount) { this.taxableAmount = taxableAmount; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getDepositDeducted() { return depositDeducted; }
    public void setDepositDeducted(BigDecimal depositDeducted) { this.depositDeducted = depositDeducted; }
    public BigDecimal getDepositPaid() { return depositDeducted; }
    public void setDepositPaid(BigDecimal depositPaid) { this.depositDeducted = depositPaid; }
    public BigDecimal getAmountDue() { return amountDue; }
    public void setAmountDue(BigDecimal amountDue) { this.amountDue = amountDue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getIssuedAt() { return issuedAt; }
    public void setIssuedAt(Instant issuedAt) { this.issuedAt = issuedAt; }
    public Instant getPaidAt() { return paidAt != null ? paidAt : issuedAt; }
    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
        if (this.issuedAt == null && paidAt != null) {
            this.issuedAt = paidAt;
        }
    }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
