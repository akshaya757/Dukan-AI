package com.dukanai.controller;

import com.dukanai.dto.request.VoiceRequest;
import com.dukanai.dto.response.ApiResponse;
import com.dukanai.dto.response.VoiceResponse;
import com.dukanai.service.VoiceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceService voiceService;

    @Autowired
    public VoiceController(VoiceService voiceService) {
        this.voiceService = voiceService;
    }

    /**
     * Parse a voice command without executing it. Used for the confirmation step.
     * POST /api/voice/parse
     */
    @PostMapping("/parse")
    public ResponseEntity<ApiResponse<VoiceResponse>> parseCommand(
            @Valid @RequestBody VoiceRequest request) {
        VoiceResponse result = voiceService.processCommand(request.getText(), false);
        return ResponseEntity.ok(ApiResponse.success("Command parsed", result));
    }

    /**
     * Parse AND execute a confirmed voice command.
     * POST /api/voice/execute
     */
    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<VoiceResponse>> executeCommand(
            @Valid @RequestBody VoiceRequest request) {
        VoiceResponse result = voiceService.processCommand(request.getText(), true);
        boolean success = result.isExecuted() || result.getErrorCode() == null;
        return ResponseEntity.ok(new ApiResponse<>(success, result.getResponseText(), result));
    }

    /**
     * Legacy combined endpoint — parses and executes in one step.
     * POST /api/voice/process
     */
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<VoiceResponse>> processCommand(
            @Valid @RequestBody VoiceRequest request) {
        VoiceResponse result = voiceService.processCommand(request.getText(), true);
        return ResponseEntity.ok(ApiResponse.success(result.getResponseText(), result));
    }
}
