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

    /**
     * Step 1: Register with email
     * POST /auth/register/email
     */
    @PostMapping("/email")
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerEmail(
            @Valid @RequestBody RegisterEmailRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        RegistrationResponse response = registrationService.registerEmail(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", response));
    }

    /**
     * Step 2: Verify OTP
     * POST /auth/register/verify-otp
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<RegistrationResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        log.info("OTP verification request received");
        RegistrationResponse response = registrationService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", response));
    }

    /**
     * Step 3: Save user details
     * POST /auth/register/details
     */
    @PostMapping("/details")
    public ResponseEntity<ApiResponse<RegistrationResponse>> saveDetails(
            @Valid @RequestBody RegisterDetailsRequest request) {
        log.info("User details submission received");
        RegistrationResponse response = registrationService.saveUserDetails(request);
        return ResponseEntity.ok(ApiResponse.success("Details saved successfully", response));
    }

    /**
     * Step 4: Create password
     * POST /auth/register/password
     */
    @PostMapping("/password")
    public ResponseEntity<ApiResponse<RegistrationResponse>> createPassword(
            @Valid @RequestBody CreatePasswordRequest request) {
        log.info("Password creation request received");
        RegistrationResponse response = registrationService.createPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password created successfully", response));
    }

    /**
     * Step 5: Create username and complete registration
     * POST /auth/register/username
     */
    @PostMapping("/username")
    public ResponseEntity<ApiResponse<RegistrationResponse>> createUsername(
            @Valid @RequestBody CreateUsernameRequest request) {
        log.info("Username creation request received");
        RegistrationResponse response = registrationService.createUsername(request);
        return ResponseEntity.ok(ApiResponse.success("Registration completed successfully!", response));
    }

    /**
     * Resend OTP
     * POST /auth/register/resend-otp
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<RegistrationResponse>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {
        log.info("OTP resend request received");
        RegistrationResponse response = registrationService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully", response));
    }

    /**
     * Check username availability
     * GET /auth/register/check-username?username=test
     */
    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUsername(
            @RequestParam String username) {
        log.info("Username availability check for: {}", username);
        boolean available = registrationService.checkUsernameAvailability(username);
        return ResponseEntity.ok(ApiResponse.success(
                available ? "Username is available" : "Username is taken",
                Map.of("available", available)
        ));
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Registration service is running", "OK"));
    }
}

