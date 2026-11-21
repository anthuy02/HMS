package com.team12.hms.domain.reservation;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Pure Domain Reservation entity.
 */
public class Reservation {
    private UUID id;
    private String reservationCode;
    private String bookingType;
    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private UUID roomTypeId;
    private String roomTypeName;
    private UUID roomId;
    private String roomNumber;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String status;
    private BigDecimal snapNightlyRate;
    private BigDecimal snapHourlyRateFirstHour;
    private BigDecimal snapHourlyRateAdditional;
    private BigDecimal totalPrice;
    private BigDecimal depositRequired;
    private BigDecimal depositPaid;
    private BigDecimal depositForfeited;
    private Instant actualCheckInTime;
    private Instant actualCheckOutTime;
    private Instant createdAt;

    public Reservation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getReservationCode() { return reservationCode; }
    public void setReservationCode(String reservationCode) { this.reservationCode = reservationCode; }
    public String getBookingType() { return bookingType; }
    public void setBookingType(String bookingType) { this.bookingType = bookingType; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    public UUID getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(UUID roomTypeId) { this.roomTypeId = roomTypeId; }
    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }
    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
    public LocalTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalTime checkInTime) { this.checkInTime = checkInTime; }
    public LocalTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalTime checkOutTime) { this.checkOutTime = checkOutTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getSnapNightlyRate() { return snapNightlyRate; }
    public void setSnapNightlyRate(BigDecimal snapNightlyRate) { this.snapNightlyRate = snapNightlyRate; }
    public BigDecimal getSnapHourlyRateFirstHour() { return snapHourlyRateFirstHour; }
    public void setSnapHourlyRateFirstHour(BigDecimal snapHourlyRateFirstHour) { this.snapHourlyRateFirstHour = snapHourlyRateFirstHour; }
    public BigDecimal getSnapHourlyRateAdditional() { return snapHourlyRateAdditional; }
    public void setSnapHourlyRateAdditional(BigDecimal snapHourlyRateAdditional) { this.snapHourlyRateAdditional = snapHourlyRateAdditional; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getDepositRequired() { return depositRequired; }
    public void setDepositRequired(BigDecimal depositRequired) { this.depositRequired = depositRequired; }
    public BigDecimal getDepositPaid() { return depositPaid; }
    public void setDepositPaid(BigDecimal depositPaid) { this.depositPaid = depositPaid; }
    public BigDecimal getDepositForfeited() { return depositForfeited; }
    public void setDepositForfeited(BigDecimal depositForfeited) { this.depositForfeited = depositForfeited; }
    public Instant getActualCheckInTime() { return actualCheckInTime; }
    public void setActualCheckInTime(Instant actualCheckInTime) { this.actualCheckInTime = actualCheckInTime; }
    public Instant getActualCheckOutTime() { return actualCheckOutTime; }
    public void setActualCheckOutTime(Instant actualCheckOutTime) { this.actualCheckOutTime = actualCheckOutTime; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
