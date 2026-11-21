package com.team12.hms.infrastructure.persistence.repository;

import com.team12.hms.infrastructure.persistence.entity.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, UUID> {
    Optional<ReservationEntity> findByReservationCode(String reservationCode);
    List<ReservationEntity> findByCheckInDate(LocalDate date);
    List<ReservationEntity> findByCheckOutDate(LocalDate date);
    long countByStatus(String status);

    @Query("SELECT COUNT(r) FROM ReservationEntity r WHERE r.roomType.id = :roomTypeId AND r.status IN ('CONFIRMED', 'CHECKED_IN') AND r.checkInDate < :checkOut AND r.checkOutDate > :checkIn")
    long countOverlappingReservations(@Param("roomTypeId") UUID roomTypeId, @Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut);
}
