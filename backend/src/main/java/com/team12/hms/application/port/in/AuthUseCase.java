package com.team12.hms.application.port.in;

import com.team12.hms.domain.auth.User;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AuthUseCase {
    Map<String, Object> login(String usernameOrEmail, String password);
    void logout(String tokenStr);
    List<User> getAllUsers();
    User createUser(Map<String, String> data);
    User toggleActive(UUID userId);
    User updateUser(UUID userId, Map<String, String> data);
}
