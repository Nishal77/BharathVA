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
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "X-Forwarded-For", required = false) String xForwardedFor,
            @RequestHeader(value = "X-Device-Info", required = false) String xDeviceInfo,
            @RequestHeader(value = "X-IP-Address", required = false) String xIpAddress,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            String ipAddress = xIpAddress != null && !xIpAddress.isEmpty() 
                ? xIpAddress 
                : extractIpAddress(xForwardedFor, request);
            
            String deviceInfo = xDeviceInfo != null && !xDeviceInfo.isEmpty() 
                ? xDeviceInfo 
                : userAgent;
            
            log.info("===========================================");
            log.info("LOGIN REQUEST RECEIVED");
            log.info("Email: {}", loginRequest.getEmail());
            log.info("IP Address: {}", ipAddress);
            log.info("Device Info: {}", deviceInfo);
            log.info("User Agent: {}", userAgent);
            log.info("===========================================");
            
            LoginResponse loginResponse = authenticationService.login(loginRequest, ipAddress, deviceInfo);
            
            log.info("===========================================");
            log.info("LOGIN RESPONSE BEING SENT");
            log.info("===========================================");
            log.info("User ID: {}", loginResponse.getUserId());
            log.info("Email: {}", loginResponse.getEmail());
            log.info("Username: {}", loginResponse.getUsername());
            log.info("Full Name: {}", loginResponse.getFullName());
            log.info("-------------------------------------------");
            log.info("ACCESS TOKEN (JWT):");
            log.info("{}", loginResponse.getAccessToken());
            log.info("-------------------------------------------");
            log.info("REFRESH TOKEN (Session Token):");
            log.info("{}", loginResponse.getRefreshToken());
            log.info("-------------------------------------------");
            log.info("Access Token Expires In: {} ms ({} minutes)", 
                loginResponse.getExpiresIn(), 
                loginResponse.getExpiresIn() / 60000);
            log.info("Refresh Token Expires In: {} ms ({} days)", 
                loginResponse.getRefreshExpiresIn(), 
                loginResponse.getRefreshExpiresIn() / 86400000);
            log.info("-------------------------------------------");
            log.info("Session Details:");
            log.info("IP Address: {}", ipAddress);
            log.info("Device Info: {}", deviceInfo);
            log.info("===========================================");
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    loginResponse.getMessage(),
                    loginResponse,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            log.error("===========================================");
            log.error("LOGIN FAILED");
            log.error("Email: {}", loginRequest.getEmail());
            log.error("Reason: {}", e.getMessage());
            log.error("===========================================");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("===========================================");
            log.error("LOGIN ERROR");
            log.error("Email: {}", loginRequest.getEmail());
            log.error("Error: {}", e.getMessage(), e);
            log.error("===========================================");
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
            log.info("Token validation request received");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid or missing authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                        false,
                        "Invalid or missing authorization header",
                        null,
                        LocalDateTime.now()
                ));
            }

            String token = authHeader.substring(7);
            log.info("Token to validate: {}...{}", 
                     token.substring(0, Math.min(20, token.length())),
                     token.length() > 20 ? token.substring(token.length() - 10) : "");
            
            boolean isValid = authenticationService.validateToken(token);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("valid", isValid);
            
            if (isValid) {
                responseData.put("message", "Token is valid");
                log.info("Token validation: VALID");
            } else {
                responseData.put("message", "Token is invalid or expired");
                log.warn("Token validation: INVALID");
            }
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Token validation completed",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error during token validation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during token validation",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                log.warn("Refresh token request missing token");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                        false,
                        "Refresh token is required",
                        null,
                        LocalDateTime.now()
                ));
            }

            log.info("Processing token refresh");
            LoginResponse loginResponse = authenticationService.refreshToken(refreshToken);
            
            log.info("Token refreshed successfully for user: {}", loginResponse.getEmail());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Token refreshed successfully",
                    loginResponse,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Unexpected error during token refresh: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during token refresh",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, String>>> logout(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                        false,
                        "Refresh token is required",
                        null,
                        LocalDateTime.now()
                ));
            }

            authenticationService.logout(refreshToken);
            
            Map<String, String> responseData = new HashMap<>();
            responseData.put("message", "Logged out successfully");
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Logged out successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error during logout: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during logout",
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
            
            // Get full user data from database
            Map<String, Object> profileData = authenticationService.getUserProfileData(userId);
            
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

    private String extractIpAddress(String xForwardedFor, jakarta.servlet.http.HttpServletRequest request) {
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, get the first one (original client)
            return xForwardedFor.split(",")[0].trim();
        }
        // Fallback to remote address
        String remoteAddr = request.getRemoteAddr();
        log.debug("Extracted IP address: {}", remoteAddr);
        return remoteAddr;
    }
}
