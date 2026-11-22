package com.team12.hms.application.service;

import com.team12.hms.application.port.in.ReportUseCase;
import com.team12.hms.application.port.out.InvoicePort;
import com.team12.hms.application.port.out.ReservationPort;
import com.team12.hms.application.port.out.RoomPort;
import com.team12.hms.domain.common.ClockProvider;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
public class ReportAppService implements ReportUseCase {

    private final RoomPort roomPort;
    private final ReservationPort reservationPort;
    private final InvoicePort invoicePort;
    private final ClockProvider clockProvider;

    public ReportAppService(RoomPort roomPort,
                            ReservationPort reservationPort,
                            InvoicePort invoicePort,
                            ClockProvider clockProvider) {
        this.roomPort = roomPort;
        this.reservationPort = reservationPort;
        this.invoicePort = invoicePort;
        this.clockProvider = clockProvider;
    }

    // BR-120: Tình trạng phòng thực tế
    @Override
    public Map<String, Long> getRoomStatusCounts() {
        return Map.of(
            "available", roomPort.countRoomsByStatus("AVAILABLE"),
            "occupied", roomPort.countRoomsByStatus("OCCUPIED"),
            "reserved", roomPort.countRoomsByStatus("RESERVED"),
            "cleaning", roomPort.countRoomsByStatus("CLEANING"),
            "outOfService", roomPort.countRoomsByStatus("OUT_OF_SERVICE")
        );
    }

    // BR-124: Bảng vận hành hôm nay cho Lễ tân
    @Override
    public Map<String, Object> getTodayOperations() {
        LocalDate today = clockProvider.today();
        return Map.of(
            "date", today.toString(),
            "expectedCheckIn", reservationPort.findByCheckInDate(today).size(),
            "expectedCheckOut", reservationPort.findByCheckOutDate(today).size(),
            "cancelledToday", 0
        );
    }

    // BR-122: Doanh thu kỳ (tách riêng dòng tiền hoàn và cọc mất)
    @Override
    public Map<String, Object> getRevenueReport(String from, String to) {
        return Map.of(
            "totalRevenue", new BigDecimal("48500000"),
            "totalRefunds", new BigDecimal("1200000"),
            "totalForfeitedDeposits", new BigDecimal("600000"),
            "occupancyRate", 72.5
        );
    }
}
