package com.bharathva.auth.controller;

import com.bharathva.auth.service.PostStatsService;
import com.bharathva.shared.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth/stats/posts")
@CrossOrigin(origins = "*")
public class PostStatsController {
    
    private static final Logger log = LoggerFactory.getLogger(PostStatsController.class);
    
    @Autowired
    private PostStatsService postStatsService;
    
    @PostMapping("/increment/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> incrementPostCount(
            @PathVariable String userId) {
        try {
            log.info("Incrementing post count for user: {}", userId);
            postStatsService.incrementPostCount(userId);
            
            Integer newCount = postStatsService.getPostCount(userId);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", userId);
            responseData.put("postsCount", newCount);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Post count incremented successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error incrementing post count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "Failed to increment post count: " + e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        }
    }
    
    @PostMapping("/decrement/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> decrementPostCount(
            @PathVariable String userId) {
        try {
            log.info("Decrementing post count for user: {}", userId);
            postStatsService.decrementPostCount(userId);
            
            Integer newCount = postStatsService.getPostCount(userId);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", userId);
            responseData.put("postsCount", newCount);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Post count decremented successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error decrementing post count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "Failed to decrement post count: " + e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        }
    }
    
    @PostMapping("/set/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> setPostCount(
            @PathVariable String userId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer count = request.get("count");
            if (count == null || count < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                        false,
                        "Count must be a non-negative integer",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            log.info("Setting post count to {} for user: {}", count, userId);
            postStatsService.setPostCount(userId, count);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", userId);
            responseData.put("postsCount", count);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Post count set successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error setting post count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "Failed to set post count: " + e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        }
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPostCount(
            @PathVariable String userId) {
        try {
            Integer count = postStatsService.getPostCount(userId);
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", userId);
            responseData.put("postsCount", count);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Post count retrieved successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error getting post count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "Failed to get post count: " + e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        }
    }
    
    @PostMapping("/sync/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncUserPostCount(
            @PathVariable String userId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer count = request.get("count");
            if (count == null || count < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                        false,
                        "Count must be a non-negative integer",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            log.info("Syncing post count to {} for user: {}", count, userId);
            postStatsService.setPostCount(userId, count);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", userId);
            responseData.put("postsCount", count);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Post count synced successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error syncing post count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "Failed to sync post count: " + e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        }
    }
}

