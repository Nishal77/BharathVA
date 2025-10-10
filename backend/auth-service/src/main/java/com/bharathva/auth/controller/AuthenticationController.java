package com.bharathva.auth.controller;

import com.bharathva.auth.dto.LoginRequest;
import com.bharathva.auth.dto.LoginResponse;
import com.bharathva.auth.service.AuthenticationService;
import com.bharathva.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            log.info("🔑 Login attempt for email: {}", loginRequest.getEmail());
            LoginResponse loginResponse = authenticationService.login(loginRequest);
            
            log.info("✅ Login successful for: {}", loginRequest.getEmail());
            log.info("🎫 JWT Token: {}", loginResponse.getToken());
            log.info("👤 User ID: {}", loginResponse.getUserId());
            log.info("📧 Email: {}", loginResponse.getEmail());
            log.info("👤 Username: {}", loginResponse.getUsername());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    loginResponse.getMessage(),
                    loginResponse,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            log.error("❌ Login failed for {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("❌ Unexpected error during login for {}: {}", loginRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during login",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            log.info("🔍 Token validation request received");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("❌ Invalid or missing authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                        false,
                        "Invalid or missing authorization header",
                        null,
                        LocalDateTime.now()
                ));
            }

            String token = authHeader.substring(7);
            log.info("📋 Token to validate: {}...{}", 
                     token.substring(0, Math.min(20, token.length())),
                     token.length() > 20 ? token.substring(token.length() - 10) : "");
            
            boolean isValid = authenticationService.validateToken(token);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("valid", isValid);
            
            if (isValid) {
                responseData.put("message", "Token is valid");
                log.info("✅ Token validation: VALID");
            } else {
                responseData.put("message", "Token is invalid or expired");
                log.warn("❌ Token validation: INVALID");
            }
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Token validation completed",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("❌ Error during token validation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during token validation",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                        false,
                        "Invalid or missing authorization header",
                        null,
                        LocalDateTime.now()
                ));
            }

            String token = authHeader.substring(7);
            String newToken = authenticationService.refreshToken(token);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", newToken);
            responseData.put("tokenType", "Bearer");
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Token refreshed successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during token refresh",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                        false,
                        "Invalid or missing authorization header",
                        null,
                        LocalDateTime.now()
                ));
            }

            String token = authHeader.substring(7);
            UUID userId = authenticationService.getUserIdFromToken(token);
            
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("userId", userId);
            profileData.put("message", "Profile retrieved successfully");
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Profile retrieved successfully",
                    profileData,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred while retrieving profile",
                    null,
                    LocalDateTime.now()
            ));
        }
    }
}
