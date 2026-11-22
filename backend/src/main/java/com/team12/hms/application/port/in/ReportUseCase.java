package com.team12.hms.application.port.in;

import java.util.Map;

public interface ReportUseCase {
    Map<String, Long> getRoomStatusCounts();
    Map<String, Object> getTodayOperations();
    Map<String, Object> getRevenueReport(String from, String to);
}
