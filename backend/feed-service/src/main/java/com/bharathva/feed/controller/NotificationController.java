package com.bharathva.feed.controller;

import com.bharathva.feed.dto.NotificationResponse;
import com.bharathva.feed.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feed/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get all notifications for the authenticated user
     * Latest notifications appear first
     */
    @GetMapping(value = "", produces = "application/json")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        log.info("Getting notifications, page: {}, size: {}", page, size);
        
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthenticated request to notifications endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            log.info("Fetching notifications for user: {}", authenticatedUserId);
            
            Page<NotificationResponse> notifications = notificationService.getNotificationsForUser(authenticatedUserId, page, size);
            log.info("Successfully retrieved {} notifications for user: {}", notifications.getTotalElements(), authenticatedUserId);
            
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            log.error("Authentication error getting notifications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting notifications: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Health check endpoint for notifications
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Notifications health check requested");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "notification-controller");
        response.put("message", "Notification controller is running");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthenticated request to unread count endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            long count = notificationService.getUnreadCount(authenticatedUserId);
            log.info("Unread count for user {}: {}", authenticatedUserId, count);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (RuntimeException e) {
            log.error("Authentication error getting unread count: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting unread count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Mark a notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String notificationId,
            Authentication authentication) {
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            notificationService.markAsRead(notificationId, authenticatedUserId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            notificationService.markAllAsRead(authenticatedUserId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking all notifications as read: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private String getUserIdFromAuthentication(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("userId");
        }
        throw new RuntimeException("Unable to extract user ID from authentication");
    }
}
