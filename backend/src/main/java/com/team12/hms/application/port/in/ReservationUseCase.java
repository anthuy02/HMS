package com.team12.hms.application.port.in;

import com.team12.hms.domain.reservation.Reservation;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface ReservationUseCase {
    List<Reservation> getAllReservations();
    Optional<Reservation> getById(UUID id);
    Map<String, Object> checkAvailability(UUID roomTypeId, LocalDate checkIn, LocalDate checkOut);
    Reservation createReservation(Map<String, Object> data);
    Map<String, Object> cancelReservation(UUID id);
}
