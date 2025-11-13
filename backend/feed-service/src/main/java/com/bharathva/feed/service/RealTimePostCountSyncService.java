package com.bharathva.feed.service;

import com.bharathva.feed.repository.FeedRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Real-time post count synchronization service
 * Ensures MongoDB and NeonDB post counts are always in sync
 */
@Service
public class RealTimePostCountSyncService {
    
    private static final Logger log = LoggerFactory.getLogger(RealTimePostCountSyncService.class);
    
    @Autowired
    private FeedRepository feedRepository;
    
    @Autowired
    private PostStatsClient postStatsClient;
    
    /**
     * Sync post count for a specific user immediately after operation
     * This is called asynchronously to not block the main operation
     */
    @Async("postCountSyncExecutor")
    public CompletableFuture<Boolean> syncUserPostCountAsync(String userId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return syncUserPostCount(userId);
            } catch (Exception e) {
                log.error("Error in async post count sync for user: {}", userId, e);
                return false;
            }
        });
    }
    
    /**
     * Sync post count for a specific user synchronously
     * Counts actual posts from MongoDB and updates NeonDB
     */
    public boolean syncUserPostCount(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Cannot sync post count: userId is null or empty");
            return false;
        }
        
        try {
            log.info("🔄 [RealTimeSync] Syncing post count for user: {}", userId);
            
            // Count actual posts from MongoDB (source of truth)
            long mongoDbCount = feedRepository.countByUserId(userId);
            log.info("📊 [RealTimeSync] MongoDB count for user {}: {}", userId, mongoDbCount);
            
            // Sync to NeonDB with retry logic
            int maxRetries = 3;
            boolean success = false;
            
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    postStatsClient.setPostCount(userId, (int) mongoDbCount);
                    success = true;
                    log.info("✅ [RealTimeSync] Successfully synced post count for user: {} - Count: {}", 
                        userId, mongoDbCount);
                    break;
                } catch (Exception e) {
                    log.warn("⚠️ [RealTimeSync] Attempt {} failed for user {}: {}", 
                        attempt, userId, e.getMessage());
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(200 * attempt); // Exponential backoff
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    } else {
                        log.error("❌ [RealTimeSync] Failed to sync post count for user {} after {} attempts", 
                            userId, maxRetries);
                    }
                }
            }
            
            return success;
        } catch (Exception e) {
            log.error("❌ [RealTimeSync] Error syncing post count for user: {} - {}", 
                userId, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Verify and fix post count for a user if mismatch detected
     */
    public boolean verifyAndFixPostCount(String userId, Integer expectedNeonDbCount) {
        try {
            long mongoDbCount = feedRepository.countByUserId(userId);
            
            if (expectedNeonDbCount != null && expectedNeonDbCount.intValue() != mongoDbCount) {
                log.warn("⚠️ [RealTimeSync] Post count mismatch detected for user: {} - MongoDB: {}, NeonDB: {}", 
                    userId, mongoDbCount, expectedNeonDbCount);
                
                // Fix the mismatch by syncing from MongoDB (source of truth)
                return syncUserPostCount(userId);
            }
            
            return true;
        } catch (Exception e) {
            log.error("❌ [RealTimeSync] Error verifying post count for user: {}", userId, e);
            return false;
        }
    }
}

