package com.dukanai.controller;

import com.dukanai.dto.request.AuthRequest;
import com.dukanai.dto.response.ApiResponse;
import com.dukanai.dto.response.AuthResponse;
import com.dukanai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody AuthRequest req) {
        try {
            if (req.getEmail() == null || req.getEmail().isBlank()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email is required."));
            }
            if (req.getPassword() == null || req.getPassword().length() < 6) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Password must be at least 6 characters."));
            }
            if (req.getName() == null || req.getName().isBlank()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Owner name is required."));
            }

            AuthResponse auth = authService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully!", auth));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest req) {
        try {
            if (req.getEmail() == null || req.getEmail().isBlank()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email is required."));
            }
            if (req.getPassword() == null || req.getPassword().isBlank()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Password is required."));
            }

            AuthResponse auth = authService.login(req);
            return ResponseEntity.ok(ApiResponse.success("Logged in successfully!", auth));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
