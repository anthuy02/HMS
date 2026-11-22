package com.team12.hms.infrastructure.persistence.adapter;

import com.team12.hms.application.port.out.UserPort;
import com.team12.hms.domain.auth.Role;
import com.team12.hms.domain.auth.User;
import com.team12.hms.infrastructure.persistence.entity.UserEntity;
import com.team12.hms.infrastructure.persistence.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class UserPersistenceAdapter implements UserPort {

    private final UserRepository userRepository;

    public UserPersistenceAdapter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public User save(User user) {
        UserEntity entity = toEntity(user);
        UserEntity saved = userRepository.save(entity);
        return toDomain(saved);
    }

    private User toDomain(UserEntity e) {
        if (e == null) return null;
        Role r;
        try {
            r = Role.valueOf(e.getRole().toUpperCase());
        } catch (Exception ex) {
            r = Role.RECEPTIONIST;
        }
        User u = new User(e.getId(), e.getUsername(), e.getPasswordHash(), e.getFullName(), r);
        u.setPhone(e.getPhone());
        u.setEmail(e.getEmail());
        u.setActive(e.isActive());
        u.setFailedAttempts(e.getFailedAttempts());
        u.setLockedUntil(e.getLockedUntil());
        return u;
    }

    private UserEntity toEntity(User d) {
        if (d == null) return null;
        UserEntity e = (d.getId() != null)
                ? userRepository.findById(d.getId()).orElse(new UserEntity())
                : new UserEntity();

        if (d.getId() != null) e.setId(d.getId());
        e.setUsername(d.getUsername());
        if (d.getPasswordHash() != null) e.setPasswordHash(d.getPasswordHash());
        e.setFullName(d.getFullName());
        if (d.getRole() != null) e.setRole(d.getRole().name());
        e.setPhone(d.getPhone());
        e.setEmail(d.getEmail());
        e.setActive(d.isActive());
        e.setFailedAttempts(d.getFailedAttempts());
        e.setLockedUntil(d.getLockedUntil());
        return e;
    }
}
