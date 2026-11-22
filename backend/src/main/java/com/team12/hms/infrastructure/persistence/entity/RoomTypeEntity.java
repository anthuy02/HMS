package com.team12.hms.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "room_types")
public class RoomTypeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String name;

    @Column(name = "max_capacity", nullable = false)
    private int maxCapacity;

    @Column(name = "base_nightly_rate", nullable = false, precision = 15, scale = 0)
    private BigDecimal baseNightlyRate;

    public RoomTypeEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
    public BigDecimal getBaseNightlyRate() { return baseNightlyRate; }
    public void setBaseNightlyRate(BigDecimal baseNightlyRate) { this.baseNightlyRate = baseNightlyRate; }
}
