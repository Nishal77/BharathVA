package com.bharathva.auth.service;

import com.bharathva.auth.entity.User;
import com.bharathva.auth.entity.UserStats;
import com.bharathva.auth.repository.UserRepository;
import com.bharathva.auth.repository.UserStatsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PostStatsService {
    
    private static final Logger log = LoggerFactory.getLogger(PostStatsService.class);
    
    @Autowired
    private UserStatsRepository userStatsRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public void incrementPostCount(String userId) {
        try {
            UUID userUuid = UUID.fromString(userId);
            ensureUserStatsExist(userUuid);
            
            // Get current count before incrementing for logging
            Optional<UserStats> statsBefore = userStatsRepository.findByUserId(userUuid);
            Integer countBefore = statsBefore.map(UserStats::getPostsCount).orElse(0);
            
            log.info("Incrementing post count for user: {} - current count: {}", userId, countBefore);
            
            // Increment the count
            userStatsRepository.incrementPostsCount(userUuid, 1);
            
            // Verify the increment worked
            Optional<UserStats> statsAfter = userStatsRepository.findByUserId(userUuid);
            Integer countAfter = statsAfter.map(UserStats::getPostsCount).orElse(0);
            
            log.info("Successfully incremented post count for user: {} - previous: {}, new: {}", 
                userId, countBefore, countAfter);
            
            if (countAfter <= countBefore) {
                log.warn("Post count did not increase as expected for user: {} - before: {}, after: {}", 
                    userId, countBefore, countAfter);
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", userId, e);
            throw new IllegalArgumentException("Invalid user ID format: " + userId);
        } catch (Exception e) {
            log.error("Error incrementing post count for user: {}, error: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to increment post count: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public void decrementPostCount(String userId) {
        try {
            UUID userUuid = UUID.fromString(userId);
            ensureUserStatsExist(userUuid);
            
            // Get current count before decrementing for logging
            Optional<UserStats> statsBefore = userStatsRepository.findByUserId(userUuid);
            Integer countBefore = statsBefore.map(UserStats::getPostsCount).orElse(0);
            
            log.info("Decrementing post count for user: {} - current count: {}", userId, countBefore);
            
            // Decrement the count (GREATEST ensures it never goes below 0)
            userStatsRepository.decrementPostsCount(userUuid, 1);
            
            // Verify the decrement worked
            Optional<UserStats> statsAfter = userStatsRepository.findByUserId(userUuid);
            Integer countAfter = statsAfter.map(UserStats::getPostsCount).orElse(0);
            
            log.info("Successfully decremented post count for user: {} - previous: {}, new: {}", 
                userId, countBefore, countAfter);
            
            if (countAfter >= countBefore) {
                log.warn("Post count did not decrease as expected for user: {} - before: {}, after: {}", 
                    userId, countBefore, countAfter);
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", userId, e);
            throw new IllegalArgumentException("Invalid user ID format: " + userId);
        } catch (Exception e) {
            log.error("Error decrementing post count for user: {}, error: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to decrement post count: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public void setPostCount(String userId, Integer count) {
        try {
            UUID userUuid = UUID.fromString(userId);
            ensureUserStatsExist(userUuid);
            userStatsRepository.updatePostsCount(userUuid, count != null ? count : 0);
            log.info("Set post count to {} for user: {}", count, userId);
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", userId, e);
            throw new IllegalArgumentException("Invalid user ID format: " + userId);
        } catch (Exception e) {
            log.error("Error setting post count for user: {}, error: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to set post count: " + e.getMessage(), e);
        }
    }
    
    public Integer getPostCount(String userId) {
        try {
            UUID userUuid = UUID.fromString(userId);
            Optional<UserStats> statsOptional = userStatsRepository.findByUserId(userUuid);
            if (statsOptional.isPresent()) {
                return statsOptional.get().getPostsCount();
            }
            return 0;
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", userId, e);
            return 0;
        } catch (Exception e) {
            log.error("Error getting post count for user: {}, error: {}", userId, e.getMessage(), e);
            return 0;
        }
    }
    
    private void ensureUserStatsExist(UUID userId) {
        Optional<UserStats> statsOptional = userStatsRepository.findByUserId(userId);
        if (statsOptional.isEmpty()) {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                UserStats userStats = new UserStats(userOptional.get());
                userStatsRepository.save(userStats);
                log.debug("Created UserStats for user {}", userId);
            } else {
                log.warn("User not found: {}", userId);
                throw new IllegalArgumentException("User not found: " + userId);
            }
        }
    }
}

