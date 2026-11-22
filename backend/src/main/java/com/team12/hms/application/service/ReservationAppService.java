package com.team12.hms.application.service;

import com.team12.hms.application.port.in.ReservationUseCase;
import com.team12.hms.application.port.out.ReservationPort;
import com.team12.hms.application.port.out.RoomPort;
import com.team12.hms.domain.common.ClockProvider;
import com.team12.hms.domain.reservation.CancellationPolicy;
import com.team12.hms.domain.reservation.Reservation;
import com.team12.hms.domain.room.RoomType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ReservationAppService implements ReservationUseCase {

    private final ReservationPort reservationPort;
    private final RoomPort roomPort;
    private final ClockProvider clockProvider;

    public ReservationAppService(ReservationPort reservationPort,
                                 RoomPort roomPort,
                                 ClockProvider clockProvider) {
        this.reservationPort = reservationPort;
        this.roomPort = roomPort;
        this.clockProvider = clockProvider;
    }

    @Override
    public List<Reservation> getAllReservations() {
        return reservationPort.findAll();
    }

    @Override
    public Optional<Reservation> getById(UUID id) {
        return reservationPort.findById(id);
    }

    @Override
    public Map<String, Object> checkAvailability(UUID roomTypeId, LocalDate checkIn, LocalDate checkOut) {
        final LocalDate effCheckIn = checkIn != null ? checkIn : clockProvider.today();
        final LocalDate effCheckOut = checkOut != null ? checkOut : effCheckIn.plusDays(1);

        long totalEligibleRooms;
        long bookedRooms;

        if (roomTypeId != null) {
            totalEligibleRooms = roomPort.countAvailableRoomsByTypeId(roomTypeId);
            bookedRooms = reservationPort.countOverlappingReservations(roomTypeId, effCheckIn, effCheckOut);
        } else {
            totalEligibleRooms = roomPort.findAllRooms().stream()
                    .filter(r -> !"OUT_OF_SERVICE".equalsIgnoreCase(r.getStatus().name()))
                    .count();
            bookedRooms = reservationPort.findAll().stream()
                    .filter(r -> ("CONFIRMED".equals(r.getStatus()) || "CHECKED_IN".equals(r.getStatus()))
                            && r.getCheckInDate().isBefore(effCheckOut)
                            && r.getCheckOutDate().isAfter(effCheckIn))
                    .count();
        }

        long availableCount = Math.max(0, totalEligibleRooms - bookedRooms);
        return Map.of(
            "roomTypeId", roomTypeId != null ? roomTypeId.toString() : "ALL",
            "checkInDate", effCheckIn.toString(),
            "checkOutDate", effCheckOut.toString(),
            "totalRooms", totalEligibleRooms,
            "bookedRooms", bookedRooms,
            "availableCount", availableCount,
            "status", availableCount > 0 ? "AVAILABLE" : "FULL"
        );
    }

    @Override
    @Transactional
    public Reservation createReservation(Map<String, Object> data) {
        UUID typeId = UUID.fromString((String) data.get("roomTypeId"));
        RoomType roomType = roomPort.findRoomTypeById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Loại phòng không tồn tại."));

        String bookingType = (String) data.getOrDefault("bookingType", "NIGHTLY");
        LocalDate checkIn = LocalDate.parse((String) data.get("checkInDate"));
        LocalDate checkOut = LocalDate.parse((String) data.get("checkOutDate"));

        long nights = Math.max(1, ChronoUnit.DAYS.between(checkIn, checkOut));
        BigDecimal totalPrice = roomType.getBaseNightlyRate().multiply(BigDecimal.valueOf(nights));
        BigDecimal depositRequired = totalPrice.multiply(new BigDecimal("0.30")).setScale(0, RoundingMode.HALF_UP);

        Reservation res = new Reservation();
        res.setReservationCode("DP" + (10000 + new Random().nextInt(90000)));
        res.setBookingType(bookingType);
        res.setGuestName((String) data.get("guestName"));
        res.setGuestPhone((String) data.get("guestPhone"));
        res.setGuestEmail((String) data.get("guestEmail"));
        res.setRoomTypeId(roomType.getId());
        res.setRoomTypeName(roomType.getName());
        res.setCheckInDate(checkIn);
        res.setCheckOutDate(checkOut);
        res.setStatus("CONFIRMED");
        res.setSnapNightlyRate(roomType.getBaseNightlyRate());
        res.setTotalPrice(totalPrice);
        res.setDepositRequired(depositRequired);
        res.setDepositPaid(depositRequired); // Đã thu cọc

        return reservationPort.save(res);
    }

    @Override
    @Transactional
    public Map<String, Object> cancelReservation(UUID id) {
        Reservation res = reservationPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt phòng."));

        if ("CANCELLED".equals(res.getStatus())) {
            throw new IllegalStateException("Đơn đặt phòng này đã được hủy trước đó.");
        }

        // BR-21, BR-22: Tính toán chính xác thời gian còn lại H đến giờ nhận phòng (14:00 ngày check-in, múi giờ VN)
        ZonedDateTime checkInStandardTime = res.getCheckInDate().atTime(14, 0).atZone(ClockProvider.ZONE_VN);
        ZonedDateTime nowZoned = clockProvider.nowZoned();

        long secondsDiff = Duration.between(nowZoned, checkInStandardTime).getSeconds();
        double hoursRemaining = Math.max(0.0, (double) secondsDiff / 3600.0);

        var refundCalc = CancellationPolicy.calculateRefund(res.getDepositPaid(), hoursRemaining);

        res.setStatus("CANCELLED");
        res.setDepositForfeited(refundCalc.forfeitedAmount());
        reservationPort.save(res);

        return Map.of(
            "reservationId", res.getId(),
            "status", "CANCELLED",
            "hoursRemaining", Math.round(hoursRemaining * 100.0) / 100.0,
            "refundPercent", refundCalc.refundPercentage(),
            "refundAmount", refundCalc.refundAmount(),
            "forfeitedAmount", refundCalc.forfeitedAmount()
        );
    }
}
