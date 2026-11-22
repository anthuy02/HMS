package com.team12.hms.domain;

import com.team12.hms.domain.reservation.Reservation;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ReservationDomainTest {

    @Test
    @DisplayName("Kiểm tra Reservation getters và setters")
    void testGettersAndSetters() {
        Reservation r = new Reservation();
        UUID id = UUID.randomUUID();
        UUID typeId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();
        Instant now = Instant.now();

        r.setId(id);
        r.setReservationCode("RES-001");
        r.setBookingType("NIGHTLY");
        r.setGuestName("Khách A");
        r.setGuestPhone("0901234567");
        r.setGuestEmail("khach@gmail.com");
        r.setRoomTypeId(typeId);
        r.setRoomTypeName("Standard");
        r.setRoomId(roomId);
        r.setRoomNumber("101");
        r.setCheckInDate(today);
        r.setCheckOutDate(today.plusDays(2));
        r.setCheckInTime(nowTime);
        r.setCheckOutTime(nowTime);
        r.setStatus("CONFIRMED");
        r.setSnapNightlyRate(new BigDecimal("1000000"));
        r.setSnapHourlyRateFirstHour(new BigDecimal("200000"));
        r.setSnapHourlyRateAdditional(new BigDecimal("100000"));
        r.setTotalPrice(new BigDecimal("2000000"));
        r.setDepositRequired(new BigDecimal("600000"));
        r.setDepositPaid(new BigDecimal("600000"));
        r.setDepositForfeited(BigDecimal.ZERO);
        r.setActualCheckInTime(now);
        r.setActualCheckOutTime(now);
        r.setCreatedAt(now);

        assertEquals(id, r.getId());
        assertEquals("RES-001", r.getReservationCode());
        assertEquals("NIGHTLY", r.getBookingType());
        assertEquals("Khách A", r.getGuestName());
        assertEquals("0901234567", r.getGuestPhone());
        assertEquals("khach@gmail.com", r.getGuestEmail());
        assertEquals(typeId, r.getRoomTypeId());
        assertEquals("Standard", r.getRoomTypeName());
        assertEquals(roomId, r.getRoomId());
        assertEquals("101", r.getRoomNumber());
        assertEquals(today, r.getCheckInDate());
        assertEquals(today.plusDays(2), r.getCheckOutDate());
        assertEquals(nowTime, r.getCheckInTime());
        assertEquals(nowTime, r.getCheckOutTime());
        assertEquals("CONFIRMED", r.getStatus());
        assertEquals(new BigDecimal("1000000"), r.getSnapNightlyRate());
        assertEquals(new BigDecimal("200000"), r.getSnapHourlyRateFirstHour());
        assertEquals(new BigDecimal("100000"), r.getSnapHourlyRateAdditional());
        assertEquals(new BigDecimal("2000000"), r.getTotalPrice());
        assertEquals(new BigDecimal("600000"), r.getDepositRequired());
        assertEquals(new BigDecimal("600000"), r.getDepositPaid());
        assertEquals(BigDecimal.ZERO, r.getDepositForfeited());
        assertEquals(now, r.getActualCheckInTime());
        assertEquals(now, r.getActualCheckOutTime());
        assertEquals(now, r.getCreatedAt());
    }
}
