package com.team12.hms.web.dto;

import java.util.UUID;

public class AuthDtos {
    public record LoginRequest(String username, String email, String password) {}

    public record UserDto(
            UUID id,
            String username,
            String fullName,
            String role,
            boolean active
    ) {}

    public record LoginResponse(
            String token,
            UserDto user
    ) {}

    public record CreateUserRequest(
            String username,
            String fullName,
            String role,
            String email,
            String phone,
            String password
    ) {}

    public record UpdateUserRequest(
            String role,
            String fullName,
            String phone,
            String email
    ) {}
}
