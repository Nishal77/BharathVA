package com.bharathva.auth.controller;

import com.bharathva.auth.entity.UserStats;
import com.bharathva.auth.service.FollowService;
import com.bharathva.auth.util.JwtUtils;
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
import java.util.UUID;

@RestController
@RequestMapping("/auth/follow")
@CrossOrigin(origins = "*")
public class FollowController {
    
    private static final Logger log = LoggerFactory.getLogger(FollowController.class);
    
    @Autowired
    private FollowService followService;
    
    @PostMapping("/{followingId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> followUser(
            @PathVariable UUID followingId) {
        try {
            UUID followerId = JwtUtils.getCurrentUserId();
            
            if (followerId.equals(followingId)) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Cannot follow yourself",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            boolean followed = followService.followUser(followerId, followingId);
            
            if (!followed) {
                return ResponseEntity.ok(new ApiResponse<>(
                        false,
                        "Already following this user",
                        Map.of("isFollowing", true),
                        LocalDateTime.now()
                ));
            }
            
            UserStats followerStats = followService.getUserStats(followerId);
            UserStats followingStats = followService.getUserStats(followingId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("isFollowing", true);
            responseData.put("followerId", followerId);
            responseData.put("followingId", followingId);
            if (followerStats != null) {
                responseData.put("followerFollowingCount", followerStats.getFollowingCount());
            }
            if (followingStats != null) {
                responseData.put("followingFollowersCount", followingStats.getFollowersCount());
            }
            
            log.info("User {} followed user {}", followerId, followingId);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Successfully followed user",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid follow request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            log.error("Authentication error in follow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error following user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }
    
    @DeleteMapping("/{followingId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unfollowUser(
            @PathVariable UUID followingId) {
        try {
            UUID followerId = JwtUtils.getCurrentUserId();
            
            boolean unfollowed = followService.unfollowUser(followerId, followingId);
            
            if (!unfollowed) {
                return ResponseEntity.ok(new ApiResponse<>(
                        false,
                        "Not following this user",
                        Map.of("isFollowing", false),
                        LocalDateTime.now()
                ));
            }
            
            UserStats followerStats = followService.getUserStats(followerId);
            UserStats followingStats = followService.getUserStats(followingId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("isFollowing", false);
            responseData.put("followerId", followerId);
            responseData.put("followingId", followingId);
            if (followerStats != null) {
                responseData.put("followerFollowingCount", followerStats.getFollowingCount());
            }
            if (followingStats != null) {
                responseData.put("followingFollowersCount", followingStats.getFollowersCount());
            }
            
            log.info("User {} unfollowed user {}", followerId, followingId);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Successfully unfollowed user",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            log.error("Authentication error in unfollow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error unfollowing user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }
    
    @GetMapping("/{followingId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFollowStatus(
            @PathVariable UUID followingId) {
        try {
            UUID followerId = JwtUtils.getCurrentUserId();
            
            boolean isFollowing = followService.isFollowing(followerId, followingId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("isFollowing", isFollowing);
            responseData.put("followerId", followerId);
            responseData.put("followingId", followingId);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Follow status retrieved successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            log.error("Authentication error in getFollowStatus: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            UUID currentUserId = null;
            try {
                currentUserId = JwtUtils.getCurrentUserId();
            } catch (Exception ignored) {
                // Ignore if we can't get current user ID in error handler
            }
            log.error("Error getting follow status: followerId={}, followingId={}, error={}", 
                     currentUserId, followingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred: " + e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        }
    }
}

