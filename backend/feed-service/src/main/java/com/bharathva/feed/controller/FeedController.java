package com.bharathva.feed.controller;

import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.service.FeedService;
import com.bharathva.shared.dto.ApiResponse;
import com.bharathva.shared.exception.BusinessException;
import com.bharathva.shared.exception.ResourceNotFoundException;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "*")
public class FeedController {
    
    private static final Logger log = LoggerFactory.getLogger(FeedController.class);
    
    @Autowired
    private FeedService feedService;
    
    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Feed service is healthy", "OK"));
    }
    
    // Create a new feed
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<FeedResponse>> createFeed(
            @Valid @RequestBody CreateFeedRequest request,
            Authentication authentication) {
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            log.info("Creating feed for user: {}", userId);
            
            FeedResponse feed = feedService.createFeed(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Feed created successfully", feed));
            
        } catch (BusinessException e) {
            log.error("Business error creating feed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating feed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create feed"));
        }
    }
    
    // Get feed by ID
    @GetMapping("/{feedId}")
    public ResponseEntity<ApiResponse<FeedResponse>> getFeedById(@PathVariable String feedId) {
        try {
            log.debug("Fetching feed by ID: {}", feedId);
            
            FeedResponse feed = feedService.getFeedById(feedId);
            return ResponseEntity.ok(ApiResponse.success("Feed retrieved successfully", feed));
            
        } catch (ResourceNotFoundException e) {
            log.warn("Feed not found: {}", feedId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching feed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch feed"));
        }
    }
    
    // Get user's feeds
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getUserFeeds(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.debug("Fetching feeds for user: {}, page: {}, size: {}", userId, page, size);
            
            Page<FeedResponse> feeds = feedService.getUserFeeds(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("User feeds retrieved successfully", feeds));
            
        } catch (Exception e) {
            log.error("Error fetching user feeds: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch user feeds"));
        }
    }
    
    // Get public feeds (home timeline)
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getPublicFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.debug("Fetching public feeds, page: {}, size: {}", page, size);
            
            Page<FeedResponse> feeds = feedService.getPublicFeeds(page, size);
            return ResponseEntity.ok(ApiResponse.success("Public feeds retrieved successfully", feeds));
            
        } catch (Exception e) {
            log.error("Error fetching public feeds: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch public feeds"));
        }
    }
    
    // Get following feeds
    @PostMapping("/following")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getFollowingFeeds(
            @RequestBody Map<String, List<String>> request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            List<String> followingUserIds = request.get("followingUserIds");
            
            log.debug("Fetching following feeds for user: {}, page: {}, size: {}", userId, page, size);
            
            Page<FeedResponse> feeds = feedService.getFollowingFeeds(userId, followingUserIds, page, size);
            return ResponseEntity.ok(ApiResponse.success("Following feeds retrieved successfully", feeds));
            
        } catch (Exception e) {
            log.error("Error fetching following feeds: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch following feeds"));
        }
    }
    
    // Get replies to a feed
    @GetMapping("/{feedId}/replies")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getFeedReplies(
            @PathVariable String feedId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.debug("Fetching replies for feed: {}, page: {}, size: {}", feedId, page, size);
            
            Page<FeedResponse> feeds = feedService.getFeedReplies(feedId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Feed replies retrieved successfully", feeds));
            
        } catch (Exception e) {
            log.error("Error fetching feed replies: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch feed replies"));
        }
    }
    
    // Like/Unlike a feed
    @PostMapping("/{feedId}/like")
    public ResponseEntity<ApiResponse<FeedResponse>> toggleLike(
            @PathVariable String feedId,
            Authentication authentication) {
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            log.info("Toggling like for feed: {} by user: {}", feedId, userId);
            
            FeedResponse feed = feedService.toggleLike(feedId, userId);
            return ResponseEntity.ok(ApiResponse.success("Like toggled successfully", feed));
            
        } catch (ResourceNotFoundException e) {
            log.warn("Feed not found for like: {}", feedId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error toggling like: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to toggle like"));
        }
    }
    
    // Retweet/Unretweet a feed
    @PostMapping("/{feedId}/retweet")
    public ResponseEntity<ApiResponse<FeedResponse>> toggleRetweet(
            @PathVariable String feedId,
            Authentication authentication) {
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            log.info("Toggling retweet for feed: {} by user: {}", feedId, userId);
            
            FeedResponse feed = feedService.toggleRetweet(feedId, userId);
            return ResponseEntity.ok(ApiResponse.success("Retweet toggled successfully", feed));
            
        } catch (ResourceNotFoundException e) {
            log.warn("Feed not found for retweet: {}", feedId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error toggling retweet: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to toggle retweet"));
        }
    }
    
    // Bookmark/Unbookmark a feed
    @PostMapping("/{feedId}/bookmark")
    public ResponseEntity<ApiResponse<FeedResponse>> toggleBookmark(
            @PathVariable String feedId,
            Authentication authentication) {
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            log.info("Toggling bookmark for feed: {} by user: {}", feedId, userId);
            
            FeedResponse feed = feedService.toggleBookmark(feedId, userId);
            return ResponseEntity.ok(ApiResponse.success("Bookmark toggled successfully", feed));
            
        } catch (ResourceNotFoundException e) {
            log.warn("Feed not found for bookmark: {}", feedId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error toggling bookmark: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to toggle bookmark"));
        }
    }
    
    // Delete a feed
    @DeleteMapping("/{feedId}")
    public ResponseEntity<ApiResponse<Void>> deleteFeed(
            @PathVariable String feedId,
            Authentication authentication) {
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            log.info("Deleting feed: {} by user: {}", feedId, userId);
            
            feedService.deleteFeed(feedId, userId);
            return ResponseEntity.ok(ApiResponse.success("Feed deleted successfully", null));
            
        } catch (ResourceNotFoundException e) {
            log.warn("Feed not found for deletion: {}", feedId);
            return ResponseEntity.notFound().build();
        } catch (BusinessException e) {
            log.error("Business error deleting feed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting feed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete feed"));
        }
    }
    
    // Search feeds
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> searchFeeds(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.debug("Searching feeds with query: {}, page: {}, size: {}", q, page, size);
            
            Page<FeedResponse> feeds = feedService.searchFeeds(q, page, size);
            return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", feeds));
            
        } catch (Exception e) {
            log.error("Error searching feeds: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search feeds"));
        }
    }
    
    // Get trending feeds
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getTrendingFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.debug("Fetching trending feeds, page: {}, size: {}", page, size);
            
            Page<FeedResponse> feeds = feedService.getTrendingFeeds(page, size);
            return ResponseEntity.ok(ApiResponse.success("Trending feeds retrieved successfully", feeds));
            
        } catch (Exception e) {
            log.error("Error fetching trending feeds: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch trending feeds"));
        }
    }
    
    // Utility method to extract user ID from JWT
    private String getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
            throw new BusinessException("Invalid authentication");
        }
        
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String userId = jwt.getClaimAsString("userId");
        
        if (userId == null || userId.isEmpty()) {
            throw new BusinessException("User ID not found in token");
        }
        
        return userId;
    }
}
