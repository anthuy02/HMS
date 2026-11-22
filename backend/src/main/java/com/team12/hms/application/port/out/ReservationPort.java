package com.team12.hms.application.port.out;

import com.team12.hms.domain.reservation.Reservation;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationPort {
    List<Reservation> findAll();
    Optional<Reservation> findById(UUID id);
    Optional<Reservation> findByReservationCode(String code);
    Reservation save(Reservation reservation);
    long countOverlappingReservations(UUID roomTypeId, LocalDate checkIn, LocalDate checkOut);
    List<Reservation> findByCheckInDate(LocalDate date);
    List<Reservation> findByCheckOutDate(LocalDate date);
    long countByStatus(String status);
}
