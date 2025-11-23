package com.bharathva.feed.service;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.repository.FeedRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PostCountSyncService {
    
    private static final Logger log = LoggerFactory.getLogger(PostCountSyncService.class);
    
    @Autowired
    private FeedRepository feedRepository;
    
    @Autowired
    private PostStatsClient postStatsClient;
    
    public Map<String, Object> syncAllPostCounts() {
        log.info("========================================");
        log.info("STARTING COMPREHENSIVE POST COUNT SYNC");
        log.info("MongoDB -> NeonDB");
        log.info("========================================");
        
        Map<String, Object> result = new HashMap<>();
        int syncedUsers = 0;
        int failedUsers = 0;
        long totalPosts = 0;
        Map<String, Integer> syncDetails = new HashMap<>();
        
        try {
            // Get all feeds from MongoDB
            List<Feed> allFeeds = feedRepository.findAll();
            log.info("Retrieved {} total feeds from MongoDB", allFeeds.size());
            
            // Count posts per user
            Map<String, Long> userPostCounts = new HashMap<>();
            for (Feed feed : allFeeds) {
                String userId = feed.getUserId();
                if (userId != null && !userId.trim().isEmpty()) {
                    userPostCounts.put(userId, userPostCounts.getOrDefault(userId, 0L) + 1);
                }
            }
            
            log.info("Found {} unique users with posts in MongoDB", userPostCounts.size());
            
            // Sync each user's post count to NeonDB
            for (Map.Entry<String, Long> entry : userPostCounts.entrySet()) {
                String userId = entry.getKey();
                Long postCount = entry.getValue();
                
                try {
                    log.info("Syncing user: {} - MongoDB count: {}", userId, postCount);
                    
                    // Retry logic for reliability
                    boolean success = false;
                    int retries = 3;
                    Exception lastException = null;
                    
                    for (int attempt = 1; attempt <= retries; attempt++) {
                        try {
                            postStatsClient.setPostCount(userId, postCount.intValue());
                            success = true;
                            break;
                        } catch (Exception e) {
                            lastException = e;
                            log.warn("Attempt {} failed for user {}: {}", attempt, userId, e.getMessage());
                            if (attempt < retries) {
                                Thread.sleep(500 * attempt); // Exponential backoff
                            }
                        }
                    }
                    
                    if (success) {
                        syncedUsers++;
                        totalPosts += postCount;
                        syncDetails.put(userId, postCount.intValue());
                        log.info("✅ Successfully synced user: {} with {} posts", userId, postCount);
                    } else {
                        failedUsers++;
                        log.error("❌ Failed to sync user: {} after {} retries - {}", 
                            userId, retries, lastException != null ? lastException.getMessage() : "Unknown error");
                    }
                } catch (Exception e) {
                    failedUsers++;
                    log.error("❌ Error syncing user: {} - {}", userId, e.getMessage(), e);
                }
            }
            
            result.put("success", true);
            result.put("syncedUsers", syncedUsers);
            result.put("failedUsers", failedUsers);
            result.put("totalPosts", totalPosts);
            result.put("totalUsersInMongoDB", userPostCounts.size());
            result.put("syncDetails", syncDetails);
            result.put("message", String.format(
                "Synced post counts for %d users (%d failed). Total posts: %d", 
                syncedUsers, failedUsers, totalPosts));
            
            log.info("========================================");
            log.info("SYNC COMPLETED");
            log.info("Synced users: {}", syncedUsers);
            log.info("Failed users: {}", failedUsers);
            log.info("Total posts: {}", totalPosts);
            log.info("========================================");
            
        } catch (Exception e) {
            log.error("========================================");
            log.error("SYNC FAILED WITH ERROR");
            log.error("Error: {}", e.getMessage(), e);
            log.error("========================================");
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("syncedUsers", syncedUsers);
            result.put("failedUsers", failedUsers);
        }
        
        return result;
    }
    
    public Map<String, Object> syncUserPostCount(String userId) {
        log.info("Syncing post count for single user: {}", userId);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Count posts for this user in MongoDB
            long mongoCount = feedRepository.countByUserId(userId);
            log.info("MongoDB post count for user {}: {}", userId, mongoCount);
            
            // Sync to NeonDB with retry
            boolean success = false;
            int retries = 3;
            Exception lastException = null;
            
            for (int attempt = 1; attempt <= retries; attempt++) {
                try {
                    postStatsClient.setPostCount(userId, (int) mongoCount);
                    success = true;
                    break;
                } catch (Exception e) {
                    lastException = e;
                    log.warn("Attempt {} failed for user {}: {}", attempt, userId, e.getMessage());
                    if (attempt < retries) {
                        Thread.sleep(500 * attempt);
                    }
                }
            }
            
            if (success) {
                result.put("success", true);
                result.put("userId", userId);
                result.put("mongoCount", mongoCount);
                result.put("message", "Successfully synced post count");
                log.info("✅ Successfully synced user: {} with {} posts", userId, mongoCount);
            } else {
                result.put("success", false);
                result.put("userId", userId);
                result.put("mongoCount", mongoCount);
                result.put("error", lastException != null ? lastException.getMessage() : "Unknown error");
                log.error("❌ Failed to sync user: {} after {} retries", userId, retries);
            }
            
        } catch (Exception e) {
            log.error("Error syncing user post count: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
}


