package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.ReservationUseCase;
import com.team12.hms.domain.reservation.Reservation;
import com.team12.hms.web.dto.ReservationDtos;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationUseCase reservationUseCase;

    public ReservationController(ReservationUseCase reservationUseCase) {
        this.reservationUseCase = reservationUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ReservationDtos.ReservationDto>> getReservations() {
        List<ReservationDtos.ReservationDto> dtoList = reservationUseCase.getAllReservations().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDtos.ReservationDto> getById(@PathVariable UUID id) {
        return reservationUseCase.getById(id)
                .map(r -> ResponseEntity.ok(toDto(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReservationDtos.ReservationDto> createReservation(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody ReservationDtos.CreateReservationRequest req) {

        Map<String, Object> data = new HashMap<>();
        data.put("roomTypeId", req.roomTypeId().toString());
        data.put("bookingType", req.bookingType());
        data.put("guestName", req.guestName());
        data.put("guestPhone", req.guestPhone());
        data.put("guestEmail", req.guestEmail());
        data.put("checkInDate", req.checkInDate());
        data.put("checkOutDate", req.checkOutDate());

        Reservation created = reservationUseCase.createReservation(data);
        return ResponseEntity.status(201).body(toDto(created));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReservationDtos.CancelReservationResponse> cancelReservation(@PathVariable UUID id) {
        Map<String, Object> result = reservationUseCase.cancelReservation(id);
        ReservationDtos.CancelReservationResponse resp = new ReservationDtos.CancelReservationResponse(
                (UUID) result.get("reservationId"),
                (String) result.get("status"),
                ((Number) result.get("hoursRemaining")).doubleValue(),
                ((Number) result.get("refundPercent")).intValue(),
                (BigDecimal) result.get("refundAmount"),
                (BigDecimal) result.get("forfeitedAmount")
        );
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/check-availability")
    public ResponseEntity<ReservationDtos.AvailabilityResponse> checkAvailability(
            @RequestParam(required = false) UUID roomTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {

        Map<String, Object> result = reservationUseCase.checkAvailability(roomTypeId, checkInDate, checkOutDate);
        ReservationDtos.AvailabilityResponse resp = new ReservationDtos.AvailabilityResponse(
                (String) result.get("roomTypeId"),
                (String) result.get("checkInDate"),
                (String) result.get("checkOutDate"),
                ((Number) result.get("totalRooms")).longValue(),
                ((Number) result.get("bookedRooms")).longValue(),
                ((Number) result.get("availableCount")).longValue(),
                (String) result.get("status")
        );
        return ResponseEntity.ok(resp);
    }

    private ReservationDtos.ReservationDto toDto(Reservation r) {
        return new ReservationDtos.ReservationDto(
                r.getId(),
                r.getReservationCode(),
                r.getBookingType(),
                r.getGuestName(),
                r.getGuestPhone(),
                r.getGuestEmail(),
                r.getRoomTypeId(),
                r.getRoomTypeName(),
                r.getRoomId(),
                r.getRoomNumber(),
                r.getCheckInDate() != null ? r.getCheckInDate().toString() : null,
                r.getCheckOutDate() != null ? r.getCheckOutDate().toString() : null,
                r.getStatus(),
                r.getTotalPrice(),
                r.getDepositRequired(),
                r.getDepositPaid()
        );
    }
}
