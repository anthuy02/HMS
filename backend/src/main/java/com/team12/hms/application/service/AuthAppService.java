package com.team12.hms.application.service;

import com.team12.hms.application.port.in.AuthUseCase;
import com.team12.hms.application.port.out.AuthTokenPort;
import com.team12.hms.application.port.out.UserPort;
import com.team12.hms.domain.auth.AuthToken;
import com.team12.hms.domain.auth.Role;
import com.team12.hms.domain.auth.User;
import com.team12.hms.domain.common.ClockProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class AuthAppService implements AuthUseCase {

    private final UserPort userPort;
    private final AuthTokenPort authTokenPort;
    private final PasswordEncoder passwordEncoder;
    private final ClockProvider clockProvider;

    public AuthAppService(UserPort userPort,
                          AuthTokenPort authTokenPort,
                          PasswordEncoder passwordEncoder,
                          ClockProvider clockProvider) {
        this.userPort = userPort;
        this.authTokenPort = authTokenPort;
        this.passwordEncoder = passwordEncoder;
        this.clockProvider = clockProvider;
    }

    @Override
    @Transactional
    public Map<String, Object> login(String usernameOrEmail, String password) {
        Optional<User> userOpt = userPort.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) {
            userOpt = userPort.findByEmail(usernameOrEmail);
        }

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        User user = userOpt.get();
        Instant now = clockProvider.now();

        // BR-71: Kiểm tra khóa 15 phút nếu nhập sai quá 5 lần
        if (user.isLocked(now)) {
            throw new IllegalArgumentException("Tài khoản đang bị tạm khóa 15 phút do nhập sai 5 lần liên tiếp (BR-71).");
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException("Tài khoản đã bị vô hiệu hóa.");
        }

        // Kiểm tra mật khẩu thuần túy bằng BCrypt (Không dùng backdoor plain password)
        boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
        if (!matches) {
            user.recordFailedLogin(now);
            userPort.save(user);
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // Reset failed attempts khi đăng nhập thành công
        user.resetFailedLogins();
        userPort.save(user);

        // Tạo token mới với thời hạn đúng 30 phút theo BR-70 & ràng buộc ck_token_ttl
        AuthToken token = new AuthToken(user.getId(), now);
        authTokenPort.saveToken(token);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token.getToken().toString());
        response.put("user", Map.of(
            "id", user.getId().toString(),
            "username", user.getUsername(),
            "fullName", user.getFullName(),
            "role", user.getRole().name(),
            "email", user.getUsername() + "@hotel.vn"
        ));
        return response;
    }

    @Override
    @Transactional
    public void logout(String tokenStr) {
        if (tokenStr != null && !tokenStr.isBlank()) {
            try {
                UUID token = UUID.fromString(tokenStr);
                authTokenPort.deleteToken(token);
            } catch (IllegalArgumentException ignored) {
            }
        }
    }

    @Override
    public List<User> getAllUsers() {
        return userPort.findAll();
    }

    @Override
    @Transactional
    public User createUser(Map<String, String> data) {
        String username = data.get("username");
        if (userPort.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại.");
        }

        Role role;
        try {
            role = Role.valueOf(data.getOrDefault("role", "RECEPTIONIST").toUpperCase());
        } catch (Exception ex) {
            role = Role.RECEPTIONIST;
        }

        String passwordHash = passwordEncoder.encode(data.getOrDefault("password", "Hotel@2026"));
        User user = new User(UUID.randomUUID(), username, passwordHash, data.get("fullName"), role);
        return userPort.save(user);
    }

    @Override
    @Transactional
    public User toggleActive(UUID userId) {
        User user = userPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        user.setActive(!user.isActive());
        return userPort.save(user);
    }

    @Override
    @Transactional
    public User updateUser(UUID userId, Map<String, String> data) {
        User user = userPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        if (data.containsKey("role")) {
            try {
                user.setRole(Role.valueOf(data.get("role").toUpperCase()));
            } catch (Exception ignored) {
            }
        }
        return userPort.save(user);
    }
}
