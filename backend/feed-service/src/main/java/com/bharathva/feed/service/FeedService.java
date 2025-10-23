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
import org.springframework.stereotype.Service;

import java.util.List;
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
    private UserClient userClient;
    
    // Create a new feed message
    @CacheEvict(value = "feedCache", allEntries = true)
    public FeedResponse createFeed(CreateFeedRequest request, String authenticatedUserId) {
        log.info("Creating feed for user: {}", authenticatedUserId);
        
        // Validate that the authenticated user matches the request user
        if (!authenticatedUserId.equals(request.getUserId())) {
            throw new RuntimeException("User ID mismatch: authenticated user " + authenticatedUserId + 
                                     " cannot create feed for user " + request.getUserId());
        }
        
        // Validate message content
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }
        
        if (request.getMessage().length() > 280) {
            throw new IllegalArgumentException("Message cannot exceed 280 characters");
        }
        
        // Skip user validation since JWT token already validates the user
        // The JWT token contains the userId and is validated by Spring Security
        log.info("Skipping user validation - JWT token already validates user: {}", request.getUserId());
        
        // Create and save feed with images
        Feed feed = new Feed(request.getUserId(), request.getMessage().trim());
        
        // Add image IDs if provided
        if (request.hasImages()) {
            feed.setImageIds(request.getImageIds());
            log.info("Feed will include {} images", request.getImageIds().size());
        }
        
        Feed savedFeed = feedRepository.save(feed);
        
        log.info("Feed created successfully with ID: {} and {} images", 
                savedFeed.getId(), savedFeed.getImageIds().size());
        return new FeedResponse(savedFeed);
    }
    
    // Get all feeds (global feed)
    @Cacheable(value = "feedCache", key = "'global_' + #page + '_' + #size")
    public Page<FeedResponse> getAllFeeds(int page, int size) {
        log.info("Getting all feeds, page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Feed> feeds = feedRepository.findAll(pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Get user feeds
    @Cacheable(value = "feedCache", key = "#userId + '_' + #page + '_' + #size")
    public Page<FeedResponse> getUserFeeds(String userId, int page, int size) {
        log.info("Getting feeds for user: {}, page: {}, size: {}", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Feed> feeds = feedRepository.findByUserId(userId, pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Get user feeds as list (for profile)
    @Cacheable(value = "feedCache", key = "#userId + '_list'")
    public List<FeedResponse> getUserFeedsList(String userId) {
        log.info("Getting feeds list for user: {}", userId);
        
        List<Feed> feeds = feedRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return feeds.stream()
                .map(FeedResponse::new)
                .collect(Collectors.toList());
    }
    
    // Get feed by ID
    @Cacheable(value = "feedCache", key = "#feedId")
    public FeedResponse getFeedById(String feedId) {
        log.info("Getting feed by ID: {}", feedId);
        
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new RuntimeException("Feed not found with ID: " + feedId));
        
        return new FeedResponse(feed);
    }
    
    // Search feeds
    @Cacheable(value = "feedCache", key = "'search_' + #query + '_' + #page + '_' + #size")
    public Page<FeedResponse> searchFeeds(String query, int page, int size) {
        log.info("Searching feeds with query: {}, page: {}, size: {}", query, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Feed> feeds = feedRepository.findByMessageContainingIgnoreCase(query, pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Count feeds by user
    public long countFeedsByUser(String userId) {
        log.info("Counting feeds for user: {}", userId);
        return feedRepository.countByUserId(userId);
    }
    
    // Delete feed
    @CacheEvict(value = "feedCache", allEntries = true)
    public void deleteFeed(String feedId, String userId) {
        log.info("Deleting feed: {} for user: {}", feedId, userId);
        
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new RuntimeException("Feed not found with ID: " + feedId));
        
        // Check if user owns the feed
        if (!feed.getUserId().equals(userId)) {
            throw new RuntimeException("User " + userId + " is not authorized to delete feed " + feedId);
        }
        
        feedRepository.delete(feed);
        log.info("Feed deleted successfully: {}", feedId);
    }
}