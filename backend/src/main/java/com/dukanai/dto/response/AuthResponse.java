package com.dukanai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private String shopName;
    private String preferredLanguage;
    private String token; // simple session token (email-based, can be replaced with JWT later)
}
