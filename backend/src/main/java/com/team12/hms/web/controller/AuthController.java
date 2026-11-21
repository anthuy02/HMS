package com.team12.hms.web.controller;

import com.team12.hms.application.port.in.AuthUseCase;
import com.team12.hms.domain.auth.User;
import com.team12.hms.web.dto.AuthDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthUseCase authUseCase;

    public AuthController(AuthUseCase authUseCase) {
        this.authUseCase = authUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.LoginResponse> login(@RequestBody AuthDtos.LoginRequest req) {
        String username = req.username() != null ? req.username() : req.email();
        Map<String, Object> result = authUseCase.login(username, req.password());

        String token = (String) result.get("token");
        Map<String, Object> uMap = (Map<String, Object>) result.get("user");
        AuthDtos.UserDto userDto = new AuthDtos.UserDto(
                UUID.fromString((String) uMap.get("id")),
                (String) uMap.get("username"),
                (String) uMap.get("fullName"),
                (String) uMap.get("role"),
                true
        );

        return ResponseEntity.ok(new AuthDtos.LoginResponse(token, userDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authUseCase.logout(authHeader.substring(7).trim());
        }
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công."));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AuthDtos.UserDto>> getUsers() {
        List<AuthDtos.UserDto> dtoList = authUseCase.getAllUsers().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/users")
    public ResponseEntity<AuthDtos.UserDto> createUser(@RequestBody AuthDtos.CreateUserRequest req) {
        Map<String, String> data = new HashMap<>();
        data.put("username", req.username());
        data.put("fullName", req.fullName());
        data.put("role", req.role());
        data.put("email", req.email());
        data.put("phone", req.phone());
        if (req.password() != null) data.put("password", req.password());

        User user = authUseCase.createUser(data);
        return ResponseEntity.status(201).body(toDto(user));
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<AuthDtos.UserDto> toggleActive(@PathVariable UUID id) {
        User user = authUseCase.toggleActive(id);
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<AuthDtos.UserDto> updateUser(@PathVariable UUID id, @RequestBody AuthDtos.UpdateUserRequest req) {
        Map<String, String> data = new HashMap<>();
        if (req.role() != null) data.put("role", req.role());
        if (req.fullName() != null) data.put("fullName", req.fullName());
        if (req.phone() != null) data.put("phone", req.phone());
        if (req.email() != null) data.put("email", req.email());

        User user = authUseCase.updateUser(id, data);
        return ResponseEntity.ok(toDto(user));
    }

    private AuthDtos.UserDto toDto(User u) {
        return new AuthDtos.UserDto(
                u.getId(),
                u.getUsername(),
                u.getFullName(),
                u.getRole() != null ? u.getRole().name() : "RECEPTIONIST",
                u.isActive()
        );
    }
}
