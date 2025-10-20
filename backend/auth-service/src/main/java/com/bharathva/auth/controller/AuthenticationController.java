package com.bharathva.auth.controller;

import com.bharathva.auth.dto.LoginRequest;
import com.bharathva.auth.dto.LoginResponse;
import com.bharathva.auth.service.AuthenticationService;
import com.bharathva.auth.service.FastAuthService;
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

    @Autowired
    private FastAuthService fastAuthService;

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
            
            LoginResponse loginResponse = authenticationService.login(loginRequest, ipAddress, deviceInfo);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    loginResponse.getMessage(),
                    loginResponse,
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
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during login",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    /**
     * FAST token validation endpoint - uses stateless JWT verification.
     * This endpoint is optimized for high-frequency validation checks.
     * 
     * Performance: <10ms (no database queries)
     * 
     * For security-critical operations, use /validate-secure instead.
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateToken(@RequestHeader("Authorization") String authHeader) {
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
            boolean isValid = fastAuthService.validateTokenFast(token);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("valid", isValid);
            
            if (isValid) {
                UUID userId = fastAuthService.getUserIdFromTokenFast(token);
                String username = fastAuthService.getUsernameFromToken(token);
                String email = fastAuthService.getEmailFromToken(token);
                
                responseData.put("userId", userId.toString());
                responseData.put("username", username);
                responseData.put("email", email);
                responseData.put("message", "Token is valid");
            } else {
                responseData.put("message", "Token is invalid or expired");
            }
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Token validation completed",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during token validation",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    /**
     * SECURE token validation endpoint - verifies JWT + database session.
     * Use this ONLY for security-critical operations.
     * 
     * Performance: 50-200ms (includes database queries)
     */
    @PostMapping("/validate-secure")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateTokenSecure(@RequestHeader("Authorization") String authHeader) {
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
            boolean isValid = authenticationService.validateTokenWithSessionCheck(token);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("valid", isValid);
            responseData.put("message", isValid ? "Token and session are valid" : "Token is invalid, expired, or session not found");
            
            if (isValid) {
                UUID userId = authenticationService.getUserIdFromToken(token);
                responseData.put("userId", userId.toString());
            }
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Secure token validation completed",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Secure token validation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred during secure token validation",
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                        false,
                        "Refresh token is required",
                        null,
                        LocalDateTime.now()
                ));
            }

            LoginResponse loginResponse = authenticationService.refreshToken(refreshToken);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Token refreshed successfully",
                    loginResponse,
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
            log.error("Token refresh failed: {}", e.getMessage());
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
            log.error("Logout failed: {}", e.getMessage());
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
            log.error("Profile retrieval failed: {}", e.getMessage());
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
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
