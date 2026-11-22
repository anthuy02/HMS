package com.team12.hms.domain.room;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * [BR-101, BR-103] maxCapacity 1..6, baseNightlyRate 1..100M VNĐ.
 */
public class RoomType {
    private UUID id;
    private String name;
    private int maxCapacity;
    private BigDecimal baseNightlyRate;

    public RoomType() {}

    public RoomType(UUID id, String name, int maxCapacity, BigDecimal baseNightlyRate) {
        if (maxCapacity < 1 || maxCapacity > 6) {
            throw new IllegalArgumentException("[BR-101] Sức chứa tối đa phải từ 1 đến 6 người.");
        }
        if (baseNightlyRate.compareTo(BigDecimal.ONE) < 0 || baseNightlyRate.compareTo(new BigDecimal("100000000")) > 0) {
            throw new IllegalArgumentException("[BR-101] Đơn giá đêm phải từ 1 đến 100.000.000 VNĐ.");
        }
        this.id = id;
        this.name = name;
        this.maxCapacity = maxCapacity;
        this.baseNightlyRate = baseNightlyRate;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public int getMaxCapacity() { return maxCapacity; }
    public BigDecimal getBaseNightlyRate() { return baseNightlyRate; }
}
