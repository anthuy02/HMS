package com.team12.hms.domain.billing;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Pure Domain Invoice entity.
 */
public class Invoice {
    private UUID id;
    private String invoiceNumber;
    private UUID reservationId;
    private String reservationCode;
    private String roomNumber;
    private String guestName;
    private BigDecimal roomCharge;
    private BigDecimal holidaySurcharge;
    private BigDecimal earlyCheckInSurcharge;
    private BigDecimal lateCheckOutSurcharge;
    private BigDecimal extraAdultSurcharge;
    private BigDecimal extraChildSurcharge;
    private BigDecimal discount;
    private BigDecimal extraServicesTotal;
    private BigDecimal serviceFeeBase;
    private BigDecimal serviceFee;
    private BigDecimal taxableAmount;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private BigDecimal depositPaid;
    private BigDecimal amountDue;
    private String status;
    private Instant issuedAt;
    private Instant paidAt;
    private Instant createdAt;

    public Invoice() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public UUID getReservationId() { return reservationId; }
    public void setReservationId(UUID reservationId) { this.reservationId = reservationId; }
    public String getReservationCode() { return reservationCode; }
    public void setReservationCode(String reservationCode) { this.reservationCode = reservationCode; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public BigDecimal getRoomCharge() { return roomCharge; }
    public void setRoomCharge(BigDecimal roomCharge) { this.roomCharge = roomCharge; }
    public BigDecimal getHolidaySurcharge() { return holidaySurcharge; }
    public void setHolidaySurcharge(BigDecimal holidaySurcharge) { this.holidaySurcharge = holidaySurcharge; }
    public BigDecimal getEarlyCheckInSurcharge() { return earlyCheckInSurcharge; }
    public void setEarlyCheckInSurcharge(BigDecimal earlyCheckInSurcharge) { this.earlyCheckInSurcharge = earlyCheckInSurcharge; }
    public BigDecimal getLateCheckOutSurcharge() { return lateCheckOutSurcharge; }
    public void setLateCheckOutSurcharge(BigDecimal lateCheckOutSurcharge) { this.lateCheckOutSurcharge = lateCheckOutSurcharge; }
    public BigDecimal getExtraAdultSurcharge() { return extraAdultSurcharge; }
    public void setExtraAdultSurcharge(BigDecimal extraAdultSurcharge) { this.extraAdultSurcharge = extraAdultSurcharge; }
    public BigDecimal getExtraChildSurcharge() { return extraChildSurcharge; }
    public void setExtraChildSurcharge(BigDecimal extraChildSurcharge) { this.extraChildSurcharge = extraChildSurcharge; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public BigDecimal getExtraServicesTotal() { return extraServicesTotal; }
    public void setExtraServicesTotal(BigDecimal extraServicesTotal) { this.extraServicesTotal = extraServicesTotal; }
    public BigDecimal getServiceFeeBase() { return serviceFeeBase; }
    public void setServiceFeeBase(BigDecimal serviceFeeBase) { this.serviceFeeBase = serviceFeeBase; }
    public BigDecimal getServiceFee() { return serviceFee; }
    public void setServiceFee(BigDecimal serviceFee) { this.serviceFee = serviceFee; }
    public BigDecimal getTaxableAmount() { return taxableAmount; }
    public void setTaxableAmount(BigDecimal taxableAmount) { this.taxableAmount = taxableAmount; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getDepositPaid() { return depositPaid; }
    public void setDepositPaid(BigDecimal depositPaid) { this.depositPaid = depositPaid; }
    public BigDecimal getAmountDue() { return amountDue; }
    public void setAmountDue(BigDecimal amountDue) { this.amountDue = amountDue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getIssuedAt() { return issuedAt; }
    public void setIssuedAt(Instant issuedAt) { this.issuedAt = issuedAt; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
