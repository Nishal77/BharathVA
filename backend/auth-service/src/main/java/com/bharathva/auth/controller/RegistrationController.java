package com.bharathva.auth.controller;

import com.bharathva.auth.dto.*;
import com.bharathva.auth.service.RegistrationService;
import com.bharathva.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/register")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private static final Logger log = LoggerFactory.getLogger(RegistrationController.class);
    
    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerEmail(
            @Valid @RequestBody RegisterEmailRequest request) {
        RegistrationResponse response = registrationService.registerEmail(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<RegistrationResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        RegistrationResponse response = registrationService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", response));
    }

    @PostMapping("/details")
    public ResponseEntity<ApiResponse<RegistrationResponse>> saveDetails(
            @Valid @RequestBody RegisterDetailsRequest request) {
        RegistrationResponse response = registrationService.saveUserDetails(request);
        return ResponseEntity.ok(ApiResponse.success("Details saved successfully", response));
    }

    @PostMapping("/password")
    public ResponseEntity<ApiResponse<RegistrationResponse>> createPassword(
            @Valid @RequestBody CreatePasswordRequest request) {
        RegistrationResponse response = registrationService.createPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password created successfully", response));
    }

    @PostMapping("/username")
    public ResponseEntity<ApiResponse<RegistrationResponse>> createUsername(
            @Valid @RequestBody CreateUsernameRequest request) {
        RegistrationResponse response = registrationService.createUsername(request);
        return ResponseEntity.ok(ApiResponse.success("Registration completed successfully!", response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<RegistrationResponse>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {
        RegistrationResponse response = registrationService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully", response));
    }

    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUsername(
            @RequestParam String username) {
        boolean available = registrationService.checkUsernameAvailability(username);
        return ResponseEntity.ok(ApiResponse.success(
                available ? "Username is available" : "Username is taken",
                Map.of("available", available)
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Registration service is running", "OK"));
    }
}
