package com.bharathva.feed.service;

import com.bharathva.feed.dto.CreateCommentRequest;
import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.model.Comment;
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
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
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
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private WebSocketService webSocketService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private PostCountSyncService postCountSyncService;
    
    @Autowired
    private RealTimePostCountSyncService realTimePostCountSyncService;
    
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
        log.info("Feed {} saved to MongoDB successfully for user: {}", savedFeed.getId(), savedFeed.getUserId());
        
        // CRITICAL: Sync post count in real-time using dedicated service
        // This ensures MongoDB and NeonDB are always in sync
        String userId = savedFeed.getUserId();
        
        // Sync synchronously first to ensure immediate consistency
        boolean syncSuccess = realTimePostCountSyncService.syncUserPostCount(userId);
        
        if (!syncSuccess) {
            log.warn("⚠️ Initial post count sync failed, but feed was created successfully.");
            log.warn("   ChangeStream will attempt to sync automatically.");
            
            // Also trigger async sync as backup
            realTimePostCountSyncService.syncUserPostCountAsync(userId)
                .thenAccept(success -> {
                    if (success) {
                        log.info("✅ Backup async sync completed successfully for user: {}", userId);
                    } else {
                        log.warn("⚠️ Backup async sync failed for user: {}", userId);
                    }
                });
        }
        
        // Notify WebSocket clients about the new feed
        try {
            webSocketService.notifyFeedCreated(savedFeed.getUserId(), savedFeed.getId(), savedFeed.getMessage());
        } catch (Exception e) {
            log.warn("⚠️ Failed to send WebSocket notification for feed creation: {}", e.getMessage());
        }
        
        log.info("Feed created successfully with ID: {} and {} images", 
                savedFeed.getId(), savedFeed.getImageUrls().size());
        FeedResponse response = new FeedResponse(savedFeed);
        // Ensure commentsCount is explicitly set (should be 0 for new feeds)
        response.setCommentsCount(savedFeed.getCommentsCount());
        return response;
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
    @Cacheable(value = "feedCache", key = "'global_' + #page + '_' + #size + (#currentUserId != null ? '_' + #currentUserId : '')")
    public Page<FeedResponse> getAllFeeds(int page, int size, String currentUserId) {
        log.info("Getting all feeds, page: {}, size: {}, currentUserId: {}", page, size, currentUserId);
        
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
        
        // Map feeds to FeedResponse with userLiked status if currentUserId is provided
        // Explicitly set commentsCount to ensure it's included in JSON response
        if (currentUserId != null && !currentUserId.trim().isEmpty()) {
            return feeds.map(feed -> {
                FeedResponse response = new FeedResponse(feed, currentUserId);
                response.setCommentsCount(feed.getCommentsCount());
                log.debug("Feed {} - commentsCount: {}, comments array size: {}", 
                    feed.getId(), response.getCommentsCount(), 
                    feed.getComments() != null ? feed.getComments().size() : 0);
                return response;
            });
        } else {
            return feeds.map(feed -> {
                FeedResponse response = new FeedResponse(feed);
                response.setCommentsCount(feed.getCommentsCount());
                return response;
            });
        }
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
        
        // Map feeds to responses and ensure commentsCount is explicitly set
        return feeds.map(feed -> {
            FeedResponse response = new FeedResponse(feed);
            // Explicitly set commentsCount to ensure it's included in JSON response
            response.setCommentsCount(feed.getCommentsCount());
            return response;
        });
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
        
        // Map feeds to responses and ensure commentsCount is explicitly set
        return feeds.stream().map(feed -> {
            FeedResponse response = new FeedResponse(feed);
            response.setCommentsCount(feed.getCommentsCount());
            return response;
        }).collect(Collectors.toList());
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
        FeedResponse response = new FeedResponse(feed);
        // Explicitly set commentsCount to ensure it's included in JSON response
        response.setCommentsCount(feed.getCommentsCount());
        return response;
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
        
        // Map feeds to responses and ensure commentsCount is explicitly set
        return feeds.map(feed -> {
            FeedResponse response = new FeedResponse(feed);
            response.setCommentsCount(feed.getCommentsCount());
            return response;
        });
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
    
    // Sync post counts from MongoDB to NeonDB for all users
    public Map<String, Object> syncPostCountsToNeonDB() {
        return postCountSyncService.syncAllPostCounts();
    }
    
    // Get PostCountSyncService for admin endpoints
    public PostCountSyncService getPostCountSyncService() {
        return postCountSyncService;
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
        String feedOwnerId = feed.getUserId();
        
        // Check if user owns the feed
        if (!feedOwnerId.equals(userId)) {
            log.warn("User {} attempted to delete feed {} owned by {}", userId, feedId, feedOwnerId);
            throw new RuntimeException("User " + userId + " is not authorized to delete feed " + feedId);
        }
        
        // Store the userId before deletion for post count update
        log.info("Preparing to delete feed {} owned by user {}", feedId, feedOwnerId);
        
        // Delete feed from MongoDB
        feedRepository.delete(feed);
        log.info("Feed {} deleted from MongoDB successfully", feedId);
        
        // CRITICAL: Sync post count in real-time using dedicated service
        // This ensures MongoDB and NeonDB are always in sync
        boolean syncSuccess = realTimePostCountSyncService.syncUserPostCount(feedOwnerId);
        
        if (!syncSuccess) {
            log.warn("⚠️ Initial post count sync failed, but feed was deleted successfully.");
            log.warn("   ChangeStream will attempt to sync automatically.");
            
            // Also trigger async sync as backup
            realTimePostCountSyncService.syncUserPostCountAsync(feedOwnerId)
                .thenAccept(success -> {
                    if (success) {
                        log.info("✅ Backup async sync completed successfully for user: {}", feedOwnerId);
                    } else {
                        log.warn("⚠️ Backup async sync failed for user: {}", feedOwnerId);
                    }
                });
        }
        
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
        
        // Map feeds to responses and ensure commentsCount is explicitly set
        return feeds.map(feed -> {
            FeedResponse response = new FeedResponse(feed);
            response.setCommentsCount(feed.getCommentsCount());
            return response;
        });
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
        
        // Create or delete notification based on like action
        // This is done asynchronously to not block the like action
        try {
            if (wasLiked) {
                // User unliked - delete notification
                log.info("🔔 User {} unliked feed {}, deleting notification", userId, feedId);
                notificationService.deleteLikeNotification(feedId, userId);
                webSocketService.notifyFeedUnliked(userId, feedId);
                log.info("✅ Notification deletion completed for feed: {} by user: {}", feedId, userId);
            } else {
                // User liked - create notification
                log.info("🔔 User {} liked feed {}, creating notification", userId, feedId);
                log.info("🔔 Feed owner userId: {}", verifiedFeed.getUserId());
                log.info("🔔 Actor userId: {}", userId);
                
                // Check if user is liking their own post
                if (userId.equals(verifiedFeed.getUserId())) {
                    log.info("ℹ️ User {} liked their own post {}, skipping notification creation", userId, feedId);
                } else {
                    notificationService.createLikeNotification(feedId, userId);
                    log.info("✅ Notification creation initiated for feed: {} by user: {}", feedId, userId);
                }
                webSocketService.notifyFeedLiked(userId, feedId);
            }
            log.info("✅ Notification handling completed successfully for feed: {} by user: {}", feedId, userId);
        } catch (Exception e) {
            log.error("❌ CRITICAL: Failed to create/delete notification for like toggle - feed: {}, user: {}, error: {}", 
                feedId, userId, e.getMessage(), e);
            log.error("❌ Exception stack trace:", e);
            // Don't break like functionality if notification fails, but log the error
            // The like action itself succeeded, so we continue
        }
        
        log.info("Like toggled successfully. Feed {} now has {} likes", feedId, verifiedFeed.getLikesCount());
        FeedResponse feedResponse = new FeedResponse(verifiedFeed, userId);
        
        // Ensure commentsCount is explicitly set in response
        feedResponse.setCommentsCount(verifiedFeed.getCommentsCount());
        
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
    
    // Add comment to a feed
    @Transactional
    @CacheEvict(value = "feedCache", key = "#feedId")
    public FeedResponse addComment(String feedId, String userId, CreateCommentRequest request) {
        log.info("Adding comment to feed: {} by user: {}", feedId, userId);
        
        // Validate parameters
        if (feedId == null || feedId.trim().isEmpty()) {
            throw new IllegalArgumentException("Feed ID cannot be null or empty");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (request == null || request.getText() == null || request.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }
        
        // Find feed
        Optional<Feed> feedOptional = feedRepository.findById(feedId);
        if (feedOptional.isEmpty()) {
            log.warn("Feed not found with ID: {}", feedId);
            throw new RuntimeException("Feed not found with ID: " + feedId);
        }
        
        Feed feed = feedOptional.get();
        
        // Store original comment info BEFORE adding new comment (to avoid index issues)
        Comment originalComment = null;
        String originalCommentText = null;
        String repliedToUserId = null;
        
        // Validate replyToCommentIndex if provided and get original comment BEFORE adding new one
        if (request.getReplyToCommentIndex() != null) {
            int replyIndex = request.getReplyToCommentIndex();
            if (replyIndex < 0 || replyIndex >= feed.getCommentsCount()) {
                log.warn("Invalid replyToCommentIndex: {} for feed with {} comments", replyIndex, feed.getCommentsCount());
                throw new IllegalArgumentException("Invalid comment index for reply");
            }
            
            // Get original comment BEFORE adding the new reply comment
            originalComment = feed.getComments().get(replyIndex);
            repliedToUserId = originalComment.getUserId();
            originalCommentText = originalComment.getText();
            log.info("📌 Retrieved original comment at index {}: userId={}, text={}", 
                replyIndex, repliedToUserId, originalCommentText);
        }
        
        // Create comment (with optional replyToCommentIndex)
        Comment comment;
        if (request.getReplyToCommentIndex() != null) {
            comment = new Comment(userId, request.getText().trim(), request.getReplyToCommentIndex());
            log.info("📝 Creating REPLY comment - replyToCommentIndex: {}, text: '{}'", 
                request.getReplyToCommentIndex(), request.getText().trim());
        } else {
            comment = new Comment(userId, request.getText().trim());
            // CRITICAL: Explicitly set replyToCommentIndex to null to ensure MongoDB stores it
            comment.setReplyToCommentIndex(null);
            log.info("📝 Creating TOP-LEVEL comment - replyToCommentIndex: null, text: '{}'", 
                request.getText().trim());
        }
        
        // CRITICAL: Log the comment state before saving
        log.info("💾 Comment state before save: userId={}, text='{}', replyToCommentIndex={}, isReply={}", 
            comment.getUserId(), 
            comment.getText(), 
            comment.getReplyToCommentIndex(), 
            comment.isReply());
        
        feed.addComment(comment);
        feed.updateTimestamp();
        
        // CRITICAL: Save using repository - MongoDB Spring Data will serialize Comment with all fields
        // The Comment object has replyToCommentIndex set (even if null), so it should be saved
        Feed savedFeed = feedRepository.save(feed);
        
        if (savedFeed == null) {
            log.error("❌ Failed to save feed - save returned null");
            throw new RuntimeException("Failed to save feed after adding comment");
        }
        
        log.info("✅ Comment added via repository save");
        
        // Reload feed to verify the save
        Optional<Feed> verifyOptional = feedRepository.findById(feedId);
        if (verifyOptional.isEmpty()) {
            log.error("❌ Feed not found after save - persistence issue");
            throw new RuntimeException("Feed not found after save");
        }
        
        Feed verifiedFeed = verifyOptional.get();
        
        // Verify the save was successful
        if (verifiedFeed == null) {
            log.error("❌ Failed to save feed - save returned null");
            throw new RuntimeException("Failed to save feed after adding comment");
        }
        int actualCommentsCount = verifiedFeed.getCommentsCount();
        log.info("✅ Comment added successfully. Feed {} now has {} comments (verified from DB)", feedId, actualCommentsCount);
        
        // CRITICAL: Verify replyToCommentIndex was saved correctly
        List<Comment> savedComments = verifiedFeed.getComments();
        if (!savedComments.isEmpty()) {
            Comment lastComment = savedComments.get(savedComments.size() - 1);
            log.info("🔍 Verification - Last saved comment: userId={}, text='{}', replyToCommentIndex={}, isReply={}", 
                lastComment.getUserId(), 
                lastComment.getText(), 
                lastComment.getReplyToCommentIndex(), 
                lastComment.isReply());
            
            if (request.getReplyToCommentIndex() != null && lastComment.getReplyToCommentIndex() == null) {
                log.error("❌ CRITICAL: replyToCommentIndex was NOT saved to MongoDB! Expected: {}, Got: null", 
                    request.getReplyToCommentIndex());
            } else if (request.getReplyToCommentIndex() == null && lastComment.getReplyToCommentIndex() != null) {
                log.warn("⚠️ Unexpected: replyToCommentIndex is set but should be null for top-level comment");
            } else {
                log.info("✅ replyToCommentIndex correctly saved: {}", lastComment.getReplyToCommentIndex());
            }
        }
        
        // Log detailed comment count information for debugging
        log.info("📊 Comment count details - Feed: {}, Comments array size: {}, CommentsCount method: {}", 
            feedId, 
            verifiedFeed.getComments() != null ? verifiedFeed.getComments().size() : 0,
            actualCommentsCount);
        
        // Create notification for comment or reply
        try {
            if (request.getReplyToCommentIndex() != null && originalComment != null) {
                // This is a reply to a comment - use the original comment info we stored BEFORE adding
                int replyToIndex = request.getReplyToCommentIndex();
                
                // Only create notification if replying to someone else's comment
                if (!userId.equals(repliedToUserId)) {
                    log.info("🔔 User {} replied to comment {} on feed {}, creating reply notification to user {}", 
                        userId, replyToIndex, feedId, repliedToUserId);
                    log.info("🔔 Original comment text: {}", originalCommentText);
                    log.info("🔔 Reply text: {}", request.getText().trim());
                    
                    notificationService.createReplyNotification(
                        feedId, 
                        userId, 
                        repliedToUserId, 
                        replyToIndex,
                        request.getText().trim(),
                        originalCommentText,
                        String.valueOf(replyToIndex) // Use comment index as commentId
                    );
                    log.info("✅ Reply notification created for feed: {} by user: {} to comment author: {}", 
                        feedId, userId, repliedToUserId);
                } else {
                    log.info("ℹ️ User {} replied to their own comment, skipping notification", userId);
                }
            } else {
                // This is a top-level comment
                if (!userId.equals(verifiedFeed.getUserId())) {
                    log.info("🔔 User {} commented on feed {}, creating notification", userId, feedId);
                    notificationService.createCommentNotification(feedId, userId, request.getText().trim());
                    log.info("✅ Comment notification created for feed: {} by user: {}", feedId, userId);
                } else {
                    log.info("ℹ️ User {} commented on their own post {}, skipping notification", userId, feedId);
                }
            }
            webSocketService.notifyFeedCommented(userId, feedId);
        } catch (Exception e) {
            log.error("❌ CRITICAL: Failed to create notification for comment/reply - feed: {}, user: {}, error: {}", 
                feedId, userId, e.getMessage(), e);
            // Log full stack trace for debugging
            log.error("❌ Full stack trace:", e);
            // Don't break comment functionality if notification fails, but log it clearly
            // The comment is already saved, so we continue
        }
        
        FeedResponse feedResponse = new FeedResponse(verifiedFeed, userId);
        // Ensure commentsCount is explicitly set in response
        feedResponse.setCommentsCount(actualCommentsCount);
        log.info("📤 Returning FeedResponse with commentsCount: {} for feed: {}", feedResponse.getCommentsCount(), feedId);
        return feedResponse;
    }
    
    // Delete comment from a feed
    @Transactional
    @CacheEvict(value = "feedCache", key = "#feedId")
    public FeedResponse deleteComment(String feedId, String userId, int commentIndex) {
        log.info("Deleting comment at index {} from feed: {} by user: {}", commentIndex, feedId, userId);
        
        // Validate parameters
        if (feedId == null || feedId.trim().isEmpty()) {
            throw new IllegalArgumentException("Feed ID cannot be null or empty");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (commentIndex < 0) {
            throw new IllegalArgumentException("Comment index cannot be negative");
        }
        
        // Find feed
        Optional<Feed> feedOptional = feedRepository.findById(feedId);
        if (feedOptional.isEmpty()) {
            log.warn("Feed not found with ID: {}", feedId);
            throw new RuntimeException("Feed not found with ID: " + feedId);
        }
        
        Feed feed = feedOptional.get();
        
        // Check if comment exists
        if (feed.getComments().size() <= commentIndex) {
            log.warn("Comment index {} out of bounds for feed {} with {} comments", commentIndex, feedId, feed.getCommentsCount());
            throw new RuntimeException("Comment not found at index " + commentIndex);
        }
        
        // Check if user owns the comment
        Comment comment = feed.getComments().get(commentIndex);
        if (!comment.getUserId().equals(userId)) {
            log.warn("User {} attempted to delete comment owned by {}", userId, comment.getUserId());
            throw new RuntimeException("User " + userId + " is not authorized to delete this comment");
        }
        
        // Use MongoDB native update to remove comment from array by index
        // This ensures the deletion is persisted correctly
        log.info("🔄 Removing comment at index {} from feed {} using MongoDB native update", commentIndex, feedId);
        
        try {
            // Build query to find the feed
            Query query = new Query(Criteria.where("_id").is(feedId));
            
            // Use $unset to remove the element at the specific index
            // MongoDB doesn't directly support removing by index, so we need to:
            // 1. Get the current comments array
            // 2. Remove the element at the index
            // 3. Set the new array
            
            // First, remove comment from in-memory object
            feed.removeComment(commentIndex);
            feed.updateTimestamp();
            
            // Use $set to update the entire comments array and updatedAt
            Update update = new Update();
            update.set("comments", feed.getComments());
            update.set("updatedAt", feed.getUpdatedAt());
            
            // Execute the update
            com.mongodb.client.result.UpdateResult updateResult = mongoTemplate.updateFirst(
                query,
                update,
                Feed.class
            );
            
            long modifiedCount = updateResult.getModifiedCount();
            long matchedCount = updateResult.getMatchedCount();
            
            log.info("📊 MongoDB update result - Matched: {}, Modified: {}", matchedCount, modifiedCount);
            
            if (matchedCount == 0) {
                log.error("❌ Feed not found in MongoDB for deletion: {}", feedId);
                throw new RuntimeException("Feed not found in MongoDB");
            }
            
            if (modifiedCount == 0) {
                log.warn("⚠️ Feed matched but not modified - comment may already be deleted or array unchanged");
                // Continue anyway - reload to verify
            }
            
        } catch (Exception e) {
            log.error("❌ Error performing MongoDB update for comment deletion: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete comment from MongoDB: " + e.getMessage(), e);
        }
        
        // Reload from database to verify the deletion
        Optional<Feed> verifyOptional = feedRepository.findById(feedId);
        if (verifyOptional.isEmpty()) {
            log.error("❌ Feed not found after update - persistence issue");
            throw new RuntimeException("Feed not found after update");
        }
        
        Feed verifiedFeed = verifyOptional.get();
        int actualCommentsCount = verifiedFeed.getCommentsCount();
        log.info("✅ Comment deleted successfully. Feed {} now has {} comments (expected: {})", 
            feedId, actualCommentsCount, feed.getCommentsCount());
        
        // Verify the comment was actually removed
        if (actualCommentsCount != feed.getCommentsCount()) {
            log.warn("⚠️ Comment count mismatch: expected {}, actual {}. This may indicate a persistence issue.", 
                feed.getCommentsCount(), actualCommentsCount);
        }
        
        // Delete associated comment notification
        try {
            notificationService.deleteCommentNotification(feedId, userId);
            log.info("✅ Comment notification deleted for feed: {} by user: {}", feedId, userId);
        } catch (Exception e) {
            log.warn("⚠️ Failed to delete comment notification: {}", e.getMessage());
            // Don't break comment deletion if notification deletion fails
        }
        
        // Notify WebSocket clients about the comment deletion
        try {
            webSocketService.notifyCommentDeleted(userId, feedId, commentIndex);
        } catch (Exception e) {
            log.warn("⚠️ Failed to send WebSocket notification for comment deletion: {}", e.getMessage());
        }
        
        FeedResponse feedResponse = new FeedResponse(verifiedFeed, userId);
        // Ensure commentsCount is explicitly set in response after deletion
        feedResponse.setCommentsCount(verifiedFeed.getCommentsCount());
        log.info("📤 Returning FeedResponse with commentsCount: {} for feed: {} (after deletion)", 
            feedResponse.getCommentsCount(), feedId);
        return feedResponse;
    }
}