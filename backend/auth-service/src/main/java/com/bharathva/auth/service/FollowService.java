package com.bharathva.auth.service;

import com.bharathva.auth.entity.User;
import com.bharathva.auth.entity.UserFollows;
import com.bharathva.auth.entity.UserStats;
import com.bharathva.auth.repository.UserFollowsRepository;
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
public class FollowService {
    
    private static final Logger log = LoggerFactory.getLogger(FollowService.class);
    
    @Autowired
    private UserFollowsRepository userFollowsRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserStatsRepository userStatsRepository;
    
    @Transactional
    public boolean followUser(UUID followerId, UUID followingId) {
        try {
            if (followerId.equals(followingId)) {
                log.warn("User {} attempted to follow themselves", followerId);
                throw new IllegalArgumentException("Cannot follow yourself");
            }
            
            if (userFollowsRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
                log.info("User {} already follows user {}", followerId, followingId);
                return false;
            }
            
            Optional<User> followerOptional = userRepository.findById(followerId);
            Optional<User> followingOptional = userRepository.findById(followingId);
            
            if (followerOptional.isEmpty()) {
                log.error("Follower user not found: {}", followerId);
                throw new IllegalArgumentException("Follower user not found");
            }
            
            if (followingOptional.isEmpty()) {
                log.error("Following user not found: {}", followingId);
                throw new IllegalArgumentException("Following user not found");
            }
            
            User follower = followerOptional.get();
            User following = followingOptional.get();
            
            UserFollows userFollows = new UserFollows(follower, following);
            userFollowsRepository.save(userFollows);
            
            log.info("User {} successfully followed user {}", followerId, followingId);
            
            ensureUserStatsExist(followerId);
            ensureUserStatsExist(followingId);
            
            return true;
        } catch (Exception e) {
            log.error("Error following user: followerId={}, followingId={}, error={}", 
                     followerId, followingId, e.getMessage(), e);
            throw e;
        }
    }
    
    @Transactional
    public boolean unfollowUser(UUID followerId, UUID followingId) {
        try {
            Optional<UserFollows> userFollowsOptional = 
                userFollowsRepository.findByFollowerIdAndFollowingId(followerId, followingId);
            
            if (userFollowsOptional.isEmpty()) {
                log.info("User {} does not follow user {}", followerId, followingId);
                return false;
            }
            
            userFollowsRepository.delete(userFollowsOptional.get());
            
            log.info("User {} successfully unfollowed user {}", followerId, followingId);
            
            ensureUserStatsExist(followerId);
            ensureUserStatsExist(followingId);
            
            return true;
        } catch (Exception e) {
            log.error("Error unfollowing user: followerId={}, followingId={}, error={}", 
                     followerId, followingId, e.getMessage(), e);
            throw e;
        }
    }
    
    public boolean isFollowing(UUID followerId, UUID followingId) {
        return userFollowsRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
    
    private void ensureUserStatsExist(UUID userId) {
        Optional<UserStats> statsOptional = userStatsRepository.findByUserId(userId);
        if (statsOptional.isEmpty()) {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                UserStats userStats = new UserStats(userOptional.get());
                userStatsRepository.save(userStats);
                log.debug("Created UserStats for user {}", userId);
            }
        }
    }
    
    public UserStats getUserStats(UUID userId) {
        Optional<UserStats> statsOptional = userStatsRepository.findByUserId(userId);
        if (statsOptional.isPresent()) {
            return statsOptional.get();
        }
        
        ensureUserStatsExist(userId);
        return userStatsRepository.findByUserId(userId).orElse(null);
    }
}


