package com.team12.hms.domain.housekeeping;

import java.time.Instant;
import java.util.UUID;

/**
 * Pure Domain CleaningTask entity.
 */
public class CleaningTask {
    private UUID id;
    private UUID roomId;
    private String roomNumber;
    private UUID housekeeperId;
    private String housekeeperName;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant completedAt;

    public CleaningTask() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public UUID getHousekeeperId() { return housekeeperId; }
    public void setHousekeeperId(UUID housekeeperId) { this.housekeeperId = housekeeperId; }
    public String getHousekeeperName() { return housekeeperName; }
    public void setHousekeeperName(String housekeeperName) { this.housekeeperName = housekeeperName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
