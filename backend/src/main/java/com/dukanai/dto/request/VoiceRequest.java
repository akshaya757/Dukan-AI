package com.dukanai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VoiceRequest {

    @NotBlank(message = "Voice text cannot be empty")
    private String text;

    private Long userId = 1L;
}
