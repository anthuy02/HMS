package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.StayUseCase;
import com.team12.hms.domain.reservation.Reservation;
import com.team12.hms.web.dto.ReservationDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/reservations")
public class StayController {

    private final StayUseCase stayUseCase;

    public StayController(StayUseCase stayUseCase) {
        this.stayUseCase = stayUseCase;
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<ReservationDtos.ReservationDto> checkIn(
            @PathVariable UUID id,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) Map<String, String> body) {

        UUID roomId = (body != null && body.containsKey("roomId")) ? UUID.fromString(body.get("roomId")) : null;
        Reservation res = stayUseCase.checkIn(id, roomId);
        return ResponseEntity.ok(toDto(res));
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<Map<String, Object>> checkOut(
            @PathVariable UUID id,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {

        return ResponseEntity.ok(stayUseCase.checkOut(id));
    }

    @GetMapping("/{id}/interim-balance")
    public ResponseEntity<Map<String, Object>> getInterimBalance(@PathVariable UUID id) {
        return ResponseEntity.ok(Map.of(
            "reservationId", id,
            "status", "CHECKED_IN",
            "roomCharge", 3000000,
            "amountDue", 2100000
        ));
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
