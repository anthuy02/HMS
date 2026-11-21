package com.team12.hms.domain.room;

import com.team12.hms.domain.common.DomainExceptions.IllegalStateTransitionException;

import java.util.UUID;

/**
 * [BR-65, BR-104] Room state transitions & maintenance reason.
 */
public class Room {
    private UUID id;
    private String roomNumber;
    private int floor;
    private UUID roomTypeId;
    private RoomStatus status;
    private String maintenanceReason;
    private boolean deleted;

    public Room() {}

    public Room(UUID id, String roomNumber, int floor, UUID roomTypeId) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.roomTypeId = roomTypeId;
        this.status = RoomStatus.AVAILABLE;
        this.deleted = false;
    }

    public void setOutOfService(String reason) {
        if (reason == null || reason.trim().isEmpty() || reason.trim().length() > 200) {
            throw new IllegalArgumentException("[BR-104] Lý do bảo trì bắt buộc từ 1 đến 200 ký tự.");
        }
        if (this.status != RoomStatus.AVAILABLE && this.status != RoomStatus.CLEANING) {
            throw new IllegalStateTransitionException("[BR-69] Chỉ đưa phòng AVAILABLE hoặc CLEANING sang OUT_OF_SERVICE.");
        }
        this.status = RoomStatus.OUT_OF_SERVICE;
        this.maintenanceReason = reason.trim();
    }

    public void returnToAvailable() {
        if (this.status != RoomStatus.OUT_OF_SERVICE && this.status != RoomStatus.CLEANING) {
            throw new IllegalStateTransitionException("[BR-65] Chỉ chuyển về AVAILABLE từ CLEANING hoặc OUT_OF_SERVICE.");
        }
        this.status = RoomStatus.AVAILABLE;
        this.maintenanceReason = null;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }
    public UUID getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(UUID roomTypeId) { this.roomTypeId = roomTypeId; }
    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }
    public String getMaintenanceReason() { return maintenanceReason; }
    public void setMaintenanceReason(String maintenanceReason) { this.maintenanceReason = maintenanceReason; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
