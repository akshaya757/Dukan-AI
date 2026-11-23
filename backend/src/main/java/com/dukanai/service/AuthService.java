package com.dukanai.service;

import com.dukanai.dto.request.AuthRequest;
import com.dukanai.dto.response.AuthResponse;
import com.dukanai.entity.User;
import com.dukanai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ── Register ──────────────────────────────────────────────────────────────
    public AuthResponse register(AuthRequest req) {
        // Reject if email already registered
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPhone(req.getPhone());
        user.setShopName(req.getShopName());
        user.setPreferredLanguage(
            req.getPreferredLanguage() != null ? req.getPreferredLanguage() : "en"
        );
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));

        user = userRepository.save(user);
        return buildResponse(user);
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public AuthResponse login(AuthRequest req) {
        Optional<User> found = userRepository.findByEmail(req.getEmail().trim().toLowerCase());

        if (found.isEmpty()) {
            throw new IllegalArgumentException("No account found with that email.");
        }

        User user = found.get();

        // Handle legacy/demo users that have no password set yet
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Password not set. Please sign up again.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password. Please try again.");
        }

        return buildResponse(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private AuthResponse buildResponse(User user) {
        // Simple opaque token: base64(userId:uuid) — replace with JWT for production
        String token = java.util.Base64.getEncoder()
            .encodeToString((user.getId() + ":" + UUID.randomUUID()).getBytes());

        return new AuthResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getShopName(),
            user.getPreferredLanguage(),
            token
        );
    }
}
