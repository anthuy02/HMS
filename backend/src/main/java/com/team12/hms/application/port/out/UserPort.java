package com.team12.hms.application.port.out;

import com.team12.hms.domain.auth.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserPort {
    List<User> findAll();
    Optional<User> findById(UUID id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    User save(User user);
}
