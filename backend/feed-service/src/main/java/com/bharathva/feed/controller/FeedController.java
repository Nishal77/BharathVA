package com.bharathva.feed.controller;

import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.service.FeedService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Simple REST controller for feed messages
 */
@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "*")
public class FeedController {
    
    private static final Logger log = LoggerFactory.getLogger(FeedController.class);
    
    @Autowired
    private FeedService feedService;
    
    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Health check requested");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "feed-service");
        response.put("message", "Feed service is running");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }
    
    // Create a new feed message
    @PostMapping("/create")
    public ResponseEntity<FeedResponse> createFeed(
            @Valid @RequestBody CreateFeedRequest request,
            Authentication authentication) {
        
        log.info("Creating feed for user: {}", request.getUserId());
        
        try {
            // Extract user ID from JWT token
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            log.info("Authenticated user ID: {}", authenticatedUserId);
            
            // Validate that the authenticated user matches the request user
            if (!authenticatedUserId.equals(request.getUserId())) {
                log.warn("User ID mismatch: authenticated user {} cannot create feed for user {}", 
                        authenticatedUserId, request.getUserId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            FeedResponse response = feedService.createFeed(request, authenticatedUserId);
            log.info("Feed created successfully with ID: {}", response.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Error creating feed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all feeds (global feed)
    @GetMapping("/all")
    public ResponseEntity<Page<FeedResponse>> getAllFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting all feeds, page: {}, size: {}", page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.getAllFeeds(page, size);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error getting all feeds: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get feeds by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<FeedResponse>> getUserFeeds(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting feeds for user: {}, page: {}, size: {}", userId, page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.getUserFeeds(userId, page, size);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error getting user feeds: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get feeds by user ID as list (for profile)
    @GetMapping("/user/{userId}/list")
    public ResponseEntity<List<FeedResponse>> getUserFeedsList(@PathVariable String userId) {
        log.info("Getting feeds list for user: {}", userId);
        
        try {
            List<FeedResponse> feeds = feedService.getUserFeedsList(userId);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error getting user feeds list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get feed by ID
    @GetMapping("/{feedId}")
    public ResponseEntity<FeedResponse> getFeedById(@PathVariable String feedId) {
        log.info("Getting feed by ID: {}", feedId);
        
        try {
            FeedResponse feed = feedService.getFeedById(feedId);
            return ResponseEntity.ok(feed);
        } catch (Exception e) {
            log.error("Error getting feed by ID: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    // Search feeds
    @GetMapping("/search")
    public ResponseEntity<Page<FeedResponse>> searchFeeds(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching feeds with query: {}, page: {}, size: {}", query, page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.searchFeeds(query, page, size);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error searching feeds: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Count feeds by user
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> countFeedsByUser(@PathVariable String userId) {
        log.info("Counting feeds for user: {}", userId);
        
        try {
            long count = feedService.countFeedsByUser(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error counting feeds for user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Delete feed
    @DeleteMapping("/{feedId}")
    public ResponseEntity<Void> deleteFeed(
            @PathVariable String feedId,
            Authentication authentication) {
        
        log.info("Deleting feed: {}", feedId);
        
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            feedService.deleteFeed(feedId, authenticatedUserId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting feed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Helper method to extract user ID from JWT token
    private String getUserIdFromAuthentication(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("userId");
        }
        throw new RuntimeException("Unable to extract user ID from authentication");
    }
}