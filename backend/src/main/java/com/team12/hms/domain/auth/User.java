package com.team12.hms.domain.auth;

import java.time.Instant;
import java.util.UUID;

/**
 * [BR-71, BR-93, BR-94] User entity & account security invariants.
 */
public class User {
    private UUID id;
    private String username;
    private String passwordHash;
    private String fullName;
    private Role role;
    private String phone;
    private String email;
    private boolean active;
    private int failedAttempts;
    private Instant lockedUntil;

    public User() {}

    public User(UUID id, String username, String passwordHash, String fullName, Role role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
        this.active = true;
        this.failedAttempts = 0;
    }

    public boolean isLocked(Instant now) {
        return lockedUntil != null && now.isBefore(lockedUntil);
    }

    public void recordFailedLogin(Instant now) {
        this.failedAttempts++;
        if (this.failedAttempts >= 5) {
            // BR-71: Khóa 15 phút sau 5 lần sai liên tiếp
            this.lockedUntil = now.plusSeconds(15 * 60);
        }
    }

    public void resetFailedLogins() {
        this.failedAttempts = 0;
        this.lockedUntil = null;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }
    public Instant getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(Instant lockedUntil) { this.lockedUntil = lockedUntil; }
}
