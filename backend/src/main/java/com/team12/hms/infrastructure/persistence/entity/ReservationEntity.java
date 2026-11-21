package com.team12.hms.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reservations")
public class ReservationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "reservation_code", unique = true, nullable = false, length = 20)
    private String reservationCode;

    @Column(name = "booking_type", nullable = false, length = 10)
    private String bookingType;

    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;

    @Column(name = "guest_phone", nullable = false, length = 20)
    private String guestPhone;

    @Column(name = "guest_email", length = 100)
    private String guestEmail;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomTypeEntity roomType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private RoomEntity room;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "adult_count", nullable = false)
    private int adultCount = 1;

    @Column(name = "child_count", nullable = false)
    private int childCount = 0;

    @Column(nullable = false, length = 20)
    private String status = "CONFIRMED";

    @Column(name = "total_price", nullable = false, precision = 15, scale = 0)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "deposit_required", nullable = false, precision = 15, scale = 0)
    private BigDecimal depositRequired = BigDecimal.ZERO;

    @Column(name = "deposit_paid", nullable = false, precision = 15, scale = 0)
    private BigDecimal depositPaid = BigDecimal.ZERO;

    @Column(name = "deposit_forfeited", nullable = false, precision = 15, scale = 0)
    private BigDecimal depositForfeited = BigDecimal.ZERO;

    @Column(name = "snap_nightly_rate", nullable = false, precision = 15, scale = 0)
    private BigDecimal snapNightlyRate;

    @Column(name = "actual_check_in_time")
    private Instant actualCheckInTime;

    @Column(name = "actual_check_out_time")
    private Instant actualCheckOutTime;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Transient
    private java.time.LocalTime checkInTime;

    @Transient
    private java.time.LocalTime checkOutTime;

    @Transient
    private BigDecimal snapHourlyRateFirstHour = BigDecimal.ZERO;

    @Transient
    private BigDecimal snapHourlyRateAdditional = BigDecimal.ZERO;

    public ReservationEntity() {}

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
    public RoomTypeEntity getRoomType() { return roomType; }
    public void setRoomType(RoomTypeEntity roomType) { this.roomType = roomType; }
    public RoomEntity getRoom() { return room; }
    public void setRoom(RoomEntity room) { this.room = room; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
    public int getAdultCount() { return adultCount; }
    public void setAdultCount(int adultCount) { this.adultCount = adultCount; }
    public int getChildCount() { return childCount; }
    public void setChildCount(int childCount) { this.childCount = childCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getDepositRequired() { return depositRequired; }
    public void setDepositRequired(BigDecimal depositRequired) { this.depositRequired = depositRequired; }
    public BigDecimal getDepositPaid() { return depositPaid; }
    public void setDepositPaid(BigDecimal depositPaid) { this.depositPaid = depositPaid; }
    public BigDecimal getDepositForfeited() { return depositForfeited; }
    public void setDepositForfeited(BigDecimal depositForfeited) { this.depositForfeited = depositForfeited; }
    public BigDecimal getSnapNightlyRate() { return snapNightlyRate; }
    public void setSnapNightlyRate(BigDecimal snapNightlyRate) { this.snapNightlyRate = snapNightlyRate; }
    public Instant getActualCheckInTime() { return actualCheckInTime; }
    public void setActualCheckInTime(Instant actualCheckInTime) { this.actualCheckInTime = actualCheckInTime; }
    public Instant getActualCheckOutTime() { return actualCheckOutTime; }
    public void setActualCheckOutTime(Instant actualCheckOutTime) { this.actualCheckOutTime = actualCheckOutTime; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public java.time.LocalTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(java.time.LocalTime checkInTime) { this.checkInTime = checkInTime; }
    public java.time.LocalTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(java.time.LocalTime checkOutTime) { this.checkOutTime = checkOutTime; }
    public BigDecimal getSnapHourlyRateFirstHour() { return snapHourlyRateFirstHour; }
    public void setSnapHourlyRateFirstHour(BigDecimal snapHourlyRateFirstHour) { this.snapHourlyRateFirstHour = snapHourlyRateFirstHour; }
    public BigDecimal getSnapHourlyRateAdditional() { return snapHourlyRateAdditional; }
    public void setSnapHourlyRateAdditional(BigDecimal snapHourlyRateAdditional) { this.snapHourlyRateAdditional = snapHourlyRateAdditional; }
}
