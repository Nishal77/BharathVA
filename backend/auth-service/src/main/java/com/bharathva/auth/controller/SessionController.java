package com.bharathva.auth.controller;

import com.bharathva.auth.dto.UserSessionResponse;
import com.bharathva.auth.service.SessionManagementService;
import com.bharathva.shared.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private static final Logger log = LoggerFactory.getLogger(SessionController.class);

    @Autowired
    private SessionManagementService sessionManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> getActiveSessions(
            @RequestHeader("Authorization") String authHeader) {
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
            List<UserSessionResponse> sessions = sessionManagementService.getActiveSessions(token);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Active sessions retrieved successfully",
                    sessions,
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
            log.error("Failed to fetch active sessions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, String>>> logoutSession(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                        false,
                        "Invalid or missing authorization header",
                        null,
                        LocalDateTime.now()
                ));
            }

            String sessionId = request.get("sessionId");
            if (sessionId == null || sessionId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                        false,
                        "Session ID is required",
                        null,
                        LocalDateTime.now()
                ));
            }

            String token = authHeader.substring(7);
            sessionManagementService.logoutSession(UUID.fromString(sessionId), token);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Session logged out successfully",
                    Map.of("message", "Session terminated"),
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to logout session: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/logout-all-other")
    public ResponseEntity<ApiResponse<Map<String, String>>> logoutAllOtherSessions(
            @RequestHeader("Authorization") String authHeader) {
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
            int loggedOutCount = sessionManagementService.logoutAllOtherSessions(token);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "All other sessions logged out successfully",
                    Map.of("message", loggedOutCount + " sessions terminated"),
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
            log.error("Failed to logout other sessions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @GetMapping("/current-refresh-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCurrentRefreshToken(
            @RequestHeader("Authorization") String authHeader) {
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
            String refreshToken = sessionManagementService.getCurrentSessionRefreshToken(token);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Current refresh token retrieved successfully",
                    Map.of("refreshToken", refreshToken),
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
            log.error("Failed to get current refresh token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }
}
