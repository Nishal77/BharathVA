package com.bharathva.feed.service;

import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.model.Feed;
import com.bharathva.feed.repository.FeedRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Simple service for managing feed messages
 */
@Service
public class FeedService {
    
    private static final Logger log = LoggerFactory.getLogger(FeedService.class);
    
    @Autowired
    private FeedRepository feedRepository;
    
    @Autowired
    private WebSocketService webSocketService;
    
    // Create a new feed message
    @Transactional
    @CacheEvict(value = "feedCache", allEntries = true)
    public FeedResponse createFeed(CreateFeedRequest request, String authenticatedUserId) {
        log.info("Creating feed for user: {}", authenticatedUserId);
        
        // Validate request
        validateCreateFeedRequest(request, authenticatedUserId);
        
        // Create and save feed with images
        Feed feed = new Feed(request.getUserId(), request.getMessage().trim());
        
        // Add image URLs if provided
        if (request.hasImages()) {
            validateImageUrls(request.getImageUrls());
            feed.setImageUrls(request.getImageUrls());
            log.info("Feed will include {} images", request.getImageUrls().size());
        }
        
        // Set creation timestamp
        feed.setCreatedAt(LocalDateTime.now());
        
        Feed savedFeed = feedRepository.save(feed);
        
        // Notify WebSocket clients about the new feed
        try {
            webSocketService.notifyFeedCreated(savedFeed.getUserId(), savedFeed.getId(), savedFeed.getMessage());
        } catch (Exception e) {
            log.warn("⚠️ Failed to send WebSocket notification for feed creation: {}", e.getMessage());
        }
        
        log.info("Feed created successfully with ID: {} and {} images", 
                savedFeed.getId(), savedFeed.getImageUrls().size());
        return new FeedResponse(savedFeed);
    }
    
    /**
     * Validate create feed request
     */
    private void validateCreateFeedRequest(CreateFeedRequest request, String authenticatedUserId) {
        if (request == null) {
            throw new IllegalArgumentException("Feed request cannot be null");
        }
        
        // Validate that the authenticated user matches the request user
        if (!authenticatedUserId.equals(request.getUserId())) {
            throw new IllegalArgumentException("User ID mismatch: authenticated user " + authenticatedUserId + 
                                             " cannot create feed for user " + request.getUserId());
        }
        
        // Validate message content
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }
        
        if (request.getMessage().length() > 280) {
            throw new IllegalArgumentException("Message cannot exceed 280 characters");
        }
        
        // Validate message content for inappropriate content (basic check)
        String message = request.getMessage().toLowerCase();
        if (message.contains("spam") || message.contains("scam")) {
            log.warn("Potentially inappropriate content detected in feed from user: {}", authenticatedUserId);
        }
    }
    
    /**
     * Validate image URLs
     */
    private void validateImageUrls(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        
        if (imageUrls.size() > 10) {
            throw new IllegalArgumentException("Maximum 10 images allowed per feed");
        }
        
        for (String url : imageUrls) {
            if (url == null || url.trim().isEmpty()) {
                throw new IllegalArgumentException("Image URL cannot be empty");
            }
            
            // Basic URL validation
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                throw new IllegalArgumentException("Invalid image URL format: " + url);
            }
        }
    }
    
    // Get all feeds (global feed)
    @Cacheable(value = "feedCache", key = "'global_' + #page + '_' + #size")
    public Page<FeedResponse> getAllFeeds(int page, int size) {
        log.info("Getting all feeds, page: {}, size: {}", page, size);
        
        // Validate pagination parameters
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size <= 0 || size > 1000) {
            throw new IllegalArgumentException("Page size must be between 1 and 1000");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findAll(pageable);
        
        log.info("Retrieved {} feeds from database", feeds.getTotalElements());
        return feeds.map(FeedResponse::new);
    }
    
    // Get user feeds
    @Cacheable(value = "feedCache", key = "#userId + '_' + #page + '_' + #size")
    public Page<FeedResponse> getUserFeeds(String userId, int page, int size) {
        log.info("Getting feeds for user: {}, page: {}, size: {}", userId, page, size);
        
        // Validate parameters
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size <= 0 || size > 1000) {
            throw new IllegalArgumentException("Page size must be between 1 and 1000");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findByUserId(userId, pageable);
        
        log.info("Retrieved {} feeds for user {} from database", feeds.getTotalElements(), userId);
        return feeds.map(FeedResponse::new);
    }
    
    // Get user feeds as list (for profile)
    @Cacheable(value = "feedCache", key = "#userId + '_list'")
    public List<FeedResponse> getUserFeedsList(String userId) {
        log.info("Getting feeds list for user: {}", userId);
        
        // Validate parameters
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        List<Feed> feeds = feedRepository.findByUserIdOrderByCreatedAtDesc(userId);
        log.info("Retrieved {} feeds for user {} from database", feeds.size(), userId);
        
        return feeds.stream()
                .map(FeedResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get feed by ID
    @Cacheable(value = "feedCache", key = "#feedId")
    public FeedResponse getFeedById(String feedId) {
        log.info("Getting feed by ID: {}", feedId);
        
        // Validate parameters
        if (feedId == null || feedId.trim().isEmpty()) {
            throw new IllegalArgumentException("Feed ID cannot be null or empty");
        }
        
        Optional<Feed> feedOptional = feedRepository.findById(feedId);
        if (feedOptional.isEmpty()) {
            log.warn("Feed not found with ID: {}", feedId);
            throw new RuntimeException("Feed not found with ID: " + feedId);
        }
        
        Feed feed = feedOptional.get();
        log.info("Retrieved feed with ID: {} for user: {}", feedId, feed.getUserId());
        return new FeedResponse(feed);
    }
    
    // Search feeds
    @Cacheable(value = "feedCache", key = "'search_' + #query + '_' + #page + '_' + #size")
    public Page<FeedResponse> searchFeeds(String query, int page, int size) {
        log.info("Searching feeds with query: {}, page: {}, size: {}", query, page, size);
        
        // Validate parameters
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Search query cannot be null or empty");
        }
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size <= 0 || size > 1000) {
            throw new IllegalArgumentException("Page size must be between 1 and 1000");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findByMessageContainingIgnoreCase(query.trim(), pageable);
        
        log.info("Found {} feeds matching query: {}", feeds.getTotalElements(), query);
        return feeds.map(FeedResponse::new);
    }
    
    // Count feeds by user
    public long countFeedsByUser(String userId) {
        log.info("Counting feeds for user: {}", userId);
        
        // Validate parameters
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        long count = feedRepository.countByUserId(userId);
        log.info("User {} has {} feeds", userId, count);
        return count;
    }
    
    // Delete feed
    @Transactional
    @CacheEvict(value = "feedCache", allEntries = true)
    public void deleteFeed(String feedId, String userId) {
        log.info("Deleting feed: {} for user: {}", feedId, userId);
        
        // Validate parameters
        if (feedId == null || feedId.trim().isEmpty()) {
            throw new IllegalArgumentException("Feed ID cannot be null or empty");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        Optional<Feed> feedOptional = feedRepository.findById(feedId);
        if (feedOptional.isEmpty()) {
            log.warn("Feed not found with ID: {}", feedId);
            throw new RuntimeException("Feed not found with ID: " + feedId);
        }
        
        Feed feed = feedOptional.get();
        
        // Check if user owns the feed
        if (!feed.getUserId().equals(userId)) {
            log.warn("User {} attempted to delete feed {} owned by {}", userId, feedId, feed.getUserId());
            throw new RuntimeException("User " + userId + " is not authorized to delete feed " + feedId);
        }
        
        feedRepository.delete(feed);
        
        // Notify WebSocket clients about the feed deletion
        try {
            webSocketService.notifyFeedDeleted(userId, feedId);
        } catch (Exception e) {
            log.warn("⚠️ Failed to send WebSocket notification for feed deletion: {}", e.getMessage());
        }
        
        log.info("Feed deleted successfully: {} by user: {}", feedId, userId);
    }
    
    // Get recent feeds (last 24 hours)
    @Cacheable(value = "feedCache", key = "'recent_' + #page + '_' + #size")
    public Page<FeedResponse> getRecentFeeds(int page, int size) {
        log.info("Getting recent feeds, page: {}, size: {}", page, size);
        
        // Validate pagination parameters
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size <= 0 || size > 1000) {
            throw new IllegalArgumentException("Page size must be between 1 and 1000");
        }
        
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findByCreatedAtAfter(yesterday, pageable);
        
        log.info("Retrieved {} recent feeds from database", feeds.getTotalElements());
        return feeds.map(FeedResponse::new);
    }
    
    // Get feed statistics
    public Map<String, Object> getFeedStatistics() {
        log.info("Getting feed statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFeeds", feedRepository.count());
        stats.put("totalUsers", feedRepository.countDistinctUsers());
        stats.put("feedsWithImages", feedRepository.countByImageUrlsIsNotNull());
        stats.put("averageFeedsPerUser", feedRepository.count() / Math.max(1, feedRepository.countDistinctUsers()));
        
        log.info("Feed statistics: {}", stats);
        return stats;
    }
    
    // Toggle like on a feed
    @Transactional
    @CacheEvict(value = "feedCache", allEntries = true)
    public FeedResponse toggleLike(String feedId, String userId) {
        log.info("Toggling like for feed: {} by user: {}", feedId, userId);
        
        // Validate parameters
        if (feedId == null || feedId.trim().isEmpty()) {
            throw new IllegalArgumentException("Feed ID cannot be null or empty");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        // Find feed
        Optional<Feed> feedOptional = feedRepository.findById(feedId);
        if (feedOptional.isEmpty()) {
            log.warn("Feed not found with ID: {}", feedId);
            throw new RuntimeException("Feed not found with ID: " + feedId);
        }
        
        Feed feed = feedOptional.get();
        boolean wasLiked = feed.hasLiked(userId);
        
        // Toggle like
        if (wasLiked) {
            feed.removeLike(userId);
            log.info("User {} unliked feed {}", userId, feedId);
        } else {
            feed.addLike(userId);
            log.info("User {} liked feed {}", userId, feedId);
        }
        
        // Update timestamp
        feed.updateTimestamp();
        
        // Save feed
        Feed savedFeed = feedRepository.save(feed);
        
        // Verify the save was successful
        if (savedFeed == null) {
            log.error("❌ Failed to save feed - save returned null");
            throw new RuntimeException("Failed to save feed after like toggle");
        }
        
        // Double-check by reloading from database
        Optional<Feed> verifyOptional = feedRepository.findById(feedId);
        if (verifyOptional.isEmpty()) {
            log.error("❌ Feed not found after save - persistence issue");
            throw new RuntimeException("Feed not found after save");
        }
        
        Feed verifiedFeed = verifyOptional.get();
        List<String> verifiedLikes = verifiedFeed.getLikes();
        boolean verifiedUserLiked = verifiedFeed.hasLiked(userId);
        
        log.info("✅ Like toggle verified:");
        log.info("   - Feed ID: {}", feedId);
        log.info("   - User ID: {}", userId);
        log.info("   - Likes count: {}", verifiedFeed.getLikesCount());
        log.info("   - User liked: {}", verifiedUserLiked);
        log.info("   - Likes list: {}", verifiedLikes);
        
        if (wasLiked && verifiedFeed.hasLiked(userId)) {
            log.error("❌ CRITICAL: User {} should have been removed from likes but still present!", userId);
            throw new RuntimeException("Like removal failed - user still in likes list");
        } else if (!wasLiked && !verifiedFeed.hasLiked(userId)) {
            log.error("❌ CRITICAL: User {} should have been added to likes but not present!", userId);
            throw new RuntimeException("Like addition failed - user not in likes list");
        }
        
        // Notify WebSocket clients about the like change
        try {
            if (wasLiked) {
                webSocketService.notifyFeedUnliked(userId, feedId);
            } else {
                webSocketService.notifyFeedLiked(userId, feedId);
            }
        } catch (Exception e) {
            log.warn("⚠️ Failed to send WebSocket notification for like toggle: {}", e.getMessage());
        }
        
        log.info("Like toggled successfully. Feed {} now has {} likes", feedId, verifiedFeed.getLikesCount());
        FeedResponse feedResponse = new FeedResponse(verifiedFeed, userId);
        
        // Ensure likes array is set correctly - explicitly set it from verified feed
        // The constructor should already set it, but we'll double-check and ensure it's not null
        List<String> feedLikes = verifiedFeed.getLikes();
        if (feedLikes == null) {
            feedLikes = new ArrayList<>();
        }
        // Always set a copy to ensure it's included in JSON serialization
        feedResponse.setLikes(new ArrayList<>(feedLikes));
        
        // Log the response to verify likes array is included
        log.info("FeedResponse created with {} likes: {}", feedResponse.getLikesCount(), feedResponse.getLikes());
        log.info("FeedResponse JSON will include likes array with {} elements", feedResponse.getLikes().size());
        
        return feedResponse;
    }
    
    // Check if user has liked a feed
    public boolean hasUserLiked(String feedId, String userId) {
        log.info("Checking if user {} has liked feed {}", userId, feedId);
        
        // Validate parameters
        if (feedId == null || feedId.trim().isEmpty()) {
            throw new IllegalArgumentException("Feed ID cannot be null or empty");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        Optional<Feed> feedOptional = feedRepository.findById(feedId);
        if (feedOptional.isEmpty()) {
            log.warn("Feed not found with ID: {}", feedId);
            return false;
        }
        
        Feed feed = feedOptional.get();
        return feed.hasLiked(userId);
    }
}