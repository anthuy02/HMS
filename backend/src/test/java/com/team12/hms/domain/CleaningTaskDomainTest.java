package com.team12.hms.domain;

import com.team12.hms.domain.housekeeping.CleaningTask;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CleaningTaskDomainTest {

    @Test
    @DisplayName("Kiểm tra CleaningTask getters và setters")
    void testGettersAndSetters() {
        CleaningTask task = new CleaningTask();
        UUID id = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        UUID hkId = UUID.randomUUID();
        Instant now = Instant.now();

        task.setId(id);
        task.setRoomId(roomId);
        task.setRoomNumber("101");
        task.setHousekeeperId(hkId);
        task.setHousekeeperName("Cô Ba");
        task.setStatus("PENDING");
        task.setNotes("Dọn kỹ ban công");
        task.setCreatedAt(now);
        task.setCompletedAt(now);

        assertEquals(id, task.getId());
        assertEquals(roomId, task.getRoomId());
        assertEquals("101", task.getRoomNumber());
        assertEquals(hkId, task.getHousekeeperId());
        assertEquals("Cô Ba", task.getHousekeeperName());
        assertEquals("PENDING", task.getStatus());
        assertEquals("Dọn kỹ ban công", task.getNotes());
        assertEquals(now, task.getCreatedAt());
        assertEquals(now, task.getCompletedAt());
    }
}
