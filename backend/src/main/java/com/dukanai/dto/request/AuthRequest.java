package com.dukanai.dto.request;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String name;       // signup only
    private String shopName;   // signup only
    private String phone;      // signup only
    private String preferredLanguage; // signup only
}
