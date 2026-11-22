package com.team12.hms.application.port.in;

import com.team12.hms.domain.reservation.Reservation;

import java.util.Map;
import java.util.UUID;

public interface StayUseCase {
    Reservation checkIn(UUID resId, UUID roomId);
    Map<String, Object> checkOut(UUID resId);
}
