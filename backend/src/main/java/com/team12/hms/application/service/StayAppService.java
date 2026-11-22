package com.team12.hms.application.service;

import com.team12.hms.application.port.in.StayUseCase;
import com.team12.hms.application.port.out.CleaningTaskPort;
import com.team12.hms.application.port.out.InvoicePort;
import com.team12.hms.application.port.out.ReservationPort;
import com.team12.hms.application.port.out.RoomPort;
import com.team12.hms.domain.billing.BillingService;
import com.team12.hms.domain.billing.Invoice;
import com.team12.hms.domain.common.ClockProvider;
import com.team12.hms.domain.housekeeping.CleaningTask;
import com.team12.hms.domain.reservation.Reservation;
import com.team12.hms.domain.room.Room;
import com.team12.hms.domain.room.RoomStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class StayAppService implements StayUseCase {

    private final ReservationPort reservationPort;
    private final RoomPort roomPort;
    private final InvoicePort invoicePort;
    private final CleaningTaskPort cleaningTaskPort;
    private final ClockProvider clockProvider;

    public StayAppService(
            ReservationPort reservationPort,
            RoomPort roomPort,
            InvoicePort invoicePort,
            CleaningTaskPort cleaningTaskPort,
            ClockProvider clockProvider) {
        this.reservationPort = reservationPort;
        this.roomPort = roomPort;
        this.invoicePort = invoicePort;
        this.cleaningTaskPort = cleaningTaskPort;
        this.clockProvider = clockProvider;
    }

    @Override
    @Transactional
    public Reservation checkIn(UUID resId, UUID roomId) {
        Reservation res = reservationPort.findById(resId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt phòng."));

        Room room = (roomId != null)
                ? roomPort.findRoomById(roomId).orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại."))
                : (res.getRoomId() != null ? roomPort.findRoomById(res.getRoomId()).orElse(null) : null);

        if (room == null) {
            throw new IllegalArgumentException("Chưa chỉ định phòng cụ thể để Check-in.");
        }

        // BR-80, BR-81: Chuyển phòng sang OCCUPIED & đơn sang CHECKED_IN
        room.setStatus(RoomStatus.OCCUPIED);
        roomPort.saveRoom(room);

        res.setRoomId(room.getId());
        res.setRoomNumber(room.getRoomNumber());
        res.setStatus("CHECKED_IN");
        res.setActualCheckInTime(clockProvider.now());
        return reservationPort.save(res);
    }

    @Override
    @Transactional
    public Map<String, Object> checkOut(UUID resId) {
        Reservation res = reservationPort.findById(resId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt phòng."));

        if (res.getRoomId() == null) {
            throw new IllegalArgumentException("Đơn không có phòng hợp lệ.");
        }

        Room room = roomPort.findRoomById(res.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại."));

        // BR-83: Đổi phòng sang CLEANING
        room.setStatus(RoomStatus.CLEANING);
        roomPort.saveRoom(room);

        // BR-111: Tạo task dọn phòng PENDING
        CleaningTask task = new CleaningTask();
        task.setRoomId(room.getId());
        task.setRoomNumber(room.getRoomNumber());
        task.setStatus("PENDING");
        task.setNotes("Dọn dẹp sau khi khách check-out " + res.getReservationCode());
        task.setCreatedAt(clockProvider.now());
        cleaningTaskPort.save(task);

        // BR-50, BR-54: Xuất hóa đơn ISSUED
        var calc = BillingService.calculateInvoice(
                res.getTotalPrice(),
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, new BigDecimal("5.00"), BigDecimal.ZERO, new BigDecimal("10.00"),
                res.getDepositPaid()
        );

        Invoice invoice = invoicePort.findByReservationId(res.getId()).orElse(new Invoice());
        invoice.setInvoiceNumber("HD" + res.getReservationCode().replace("DP", ""));
        invoice.setReservationId(res.getId());
        invoice.setReservationCode(res.getReservationCode());
        invoice.setGuestName(res.getGuestName());
        invoice.setRoomNumber(room.getRoomNumber());
        invoice.setRoomCharge(calc.roomCharge());
        invoice.setTotalAmount(calc.totalAmount());
        invoice.setAmountDue(calc.amountDue());
        invoice.setStatus("ISSUED");
        invoice.setIssuedAt(clockProvider.now());
        invoicePort.save(invoice);

        res.setStatus("CHECKED_OUT");
        res.setActualCheckOutTime(clockProvider.now());
        reservationPort.save(res);

        return Map.of(
            "reservationCode", res.getReservationCode(),
            "status", "CHECKED_OUT",
            "invoiceNumber", invoice.getInvoiceNumber(),
            "totalAmount", calc.totalAmount(),
            "amountDue", calc.amountDue(),
            "roomStatus", "CLEANING"
        );
    }
}
