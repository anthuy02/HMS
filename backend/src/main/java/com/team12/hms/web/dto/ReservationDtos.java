package com.team12.hms.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class ReservationDtos {
    public record CreateReservationRequest(
            UUID roomTypeId,
            String bookingType,
            String guestName,
            String guestPhone,
            String guestEmail,
            String checkInDate,
            String checkOutDate
    ) {}

    public record ReservationDto(
            UUID id,
            String reservationCode,
            String bookingType,
            String guestName,
            String guestPhone,
            String guestEmail,
            UUID roomTypeId,
            String roomTypeName,
            UUID roomId,
            String roomNumber,
            String checkInDate,
            String checkOutDate,
            String status,
            BigDecimal totalPrice,
            BigDecimal depositRequired,
            BigDecimal depositPaid
    ) {}

    public record AvailabilityResponse(
            String roomTypeId,
            String checkInDate,
            String checkOutDate,
            long totalRooms,
            long bookedRooms,
            long availableCount,
            String status
    ) {}

    public record CancelReservationResponse(
            UUID reservationId,
            String status,
            double hoursRemaining,
            int refundPercent,
            BigDecimal refundAmount,
            BigDecimal forfeitedAmount
    ) {}
}
