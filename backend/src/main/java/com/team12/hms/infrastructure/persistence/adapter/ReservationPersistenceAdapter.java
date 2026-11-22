package com.team12.hms.infrastructure.persistence.adapter;

import com.team12.hms.application.port.out.ReservationPort;
import com.team12.hms.domain.reservation.Reservation;
import com.team12.hms.infrastructure.persistence.entity.ReservationEntity;
import com.team12.hms.infrastructure.persistence.entity.RoomEntity;
import com.team12.hms.infrastructure.persistence.entity.RoomTypeEntity;
import com.team12.hms.infrastructure.persistence.repository.ReservationRepository;
import com.team12.hms.infrastructure.persistence.repository.RoomRepository;
import com.team12.hms.infrastructure.persistence.repository.RoomTypeRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class ReservationPersistenceAdapter implements ReservationPort {

    private final ReservationRepository reservationRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;

    public ReservationPersistenceAdapter(ReservationRepository reservationRepository,
                                         RoomTypeRepository roomTypeRepository,
                                         RoomRepository roomRepository) {
        this.reservationRepository = reservationRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public List<Reservation> findAll() {
        return reservationRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<Reservation> findById(UUID id) {
        return reservationRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Reservation> findByReservationCode(String code) {
        return reservationRepository.findByReservationCode(code).map(this::toDomain);
    }

    @Override
    public Reservation save(Reservation reservation) {
        ReservationEntity entity = toEntity(reservation);
        ReservationEntity saved = reservationRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public long countOverlappingReservations(UUID roomTypeId, LocalDate checkIn, LocalDate checkOut) {
        return reservationRepository.countOverlappingReservations(roomTypeId, checkIn, checkOut);
    }

    @Override
    public List<Reservation> findByCheckInDate(LocalDate date) {
        return reservationRepository.findByCheckInDate(date).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Reservation> findByCheckOutDate(LocalDate date) {
        return reservationRepository.findByCheckOutDate(date).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public long countByStatus(String status) {
        return reservationRepository.countByStatus(status);
    }

    private Reservation toDomain(ReservationEntity e) {
        if (e == null) return null;
        Reservation d = new Reservation();
        d.setId(e.getId());
        d.setReservationCode(e.getReservationCode());
        d.setBookingType(e.getBookingType());
        d.setGuestName(e.getGuestName());
        d.setGuestPhone(e.getGuestPhone());
        d.setGuestEmail(e.getGuestEmail());
        if (e.getRoomType() != null) {
            d.setRoomTypeId(e.getRoomType().getId());
            d.setRoomTypeName(e.getRoomType().getName());
        }
        if (e.getRoom() != null) {
            d.setRoomId(e.getRoom().getId());
            d.setRoomNumber(e.getRoom().getRoomNumber());
        }
        d.setCheckInDate(e.getCheckInDate());
        d.setCheckOutDate(e.getCheckOutDate());
        d.setCheckInTime(e.getCheckInTime());
        d.setCheckOutTime(e.getCheckOutTime());
        d.setStatus(e.getStatus());
        d.setSnapNightlyRate(e.getSnapNightlyRate());
        d.setSnapHourlyRateFirstHour(e.getSnapHourlyRateFirstHour());
        d.setSnapHourlyRateAdditional(e.getSnapHourlyRateAdditional());
        d.setTotalPrice(e.getTotalPrice());
        d.setDepositRequired(e.getDepositRequired());
        d.setDepositPaid(e.getDepositPaid());
        d.setDepositForfeited(e.getDepositForfeited());
        d.setActualCheckInTime(e.getActualCheckInTime());
        d.setActualCheckOutTime(e.getActualCheckOutTime());
        d.setCreatedAt(e.getCreatedAt());
        return d;
    }

    private ReservationEntity toEntity(Reservation d) {
        if (d == null) return null;
        ReservationEntity e = (d.getId() != null)
                ? reservationRepository.findById(d.getId()).orElse(new ReservationEntity())
                : new ReservationEntity();

        if (d.getId() != null) e.setId(d.getId());
        e.setReservationCode(d.getReservationCode());
        e.setBookingType(d.getBookingType());
        e.setGuestName(d.getGuestName());
        e.setGuestPhone(d.getGuestPhone());
        e.setGuestEmail(d.getGuestEmail());
        if (d.getRoomTypeId() != null) {
            RoomTypeEntity rt = roomTypeRepository.findById(d.getRoomTypeId()).orElse(null);
            e.setRoomType(rt);
        }
        if (d.getRoomId() != null) {
            RoomEntity rm = roomRepository.findById(d.getRoomId()).orElse(null);
            e.setRoom(rm);
        }
        e.setCheckInDate(d.getCheckInDate());
        e.setCheckOutDate(d.getCheckOutDate());
        e.setCheckInTime(d.getCheckInTime());
        e.setCheckOutTime(d.getCheckOutTime());
        e.setStatus(d.getStatus());
        e.setSnapNightlyRate(d.getSnapNightlyRate());
        e.setSnapHourlyRateFirstHour(d.getSnapHourlyRateFirstHour());
        e.setSnapHourlyRateAdditional(d.getSnapHourlyRateAdditional());
        e.setTotalPrice(d.getTotalPrice());
        e.setDepositRequired(d.getDepositRequired());
        e.setDepositPaid(d.getDepositPaid());
        e.setDepositForfeited(d.getDepositForfeited());
        e.setActualCheckInTime(d.getActualCheckInTime());
        e.setActualCheckOutTime(d.getActualCheckOutTime());
        return e;
    }
}
