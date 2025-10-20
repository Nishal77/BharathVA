package com.bharathva.feed.service;

import com.bharathva.feed.model.UserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
public class UserClient {
    
    private static final Logger log = LoggerFactory.getLogger(UserClient.class);
    
    @Autowired
    private WebClient authServiceWebClient;
    
    @Cacheable(value = "userCache", key = "#userId")
    public UserInfo getUserInfo(String userId) {
        try {
            log.debug("Fetching user info for userId: {}", userId);
            
            Map<String, Object> response = authServiceWebClient
                    .get()
                    .uri("/auth/user/{userId}", userId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            
            if (response != null && response.containsKey("data")) {
                Map<String, Object> userData = (Map<String, Object>) response.get("data");
                
                UserInfo userInfo = new UserInfo();
                userInfo.setId(userData.get("id") != null ? userData.get("id").toString() : null);
                userInfo.setUsername(userData.get("username") != null ? userData.get("username").toString() : null);
                userInfo.setFullName(userData.get("fullName") != null ? userData.get("fullName").toString() : null);
                userInfo.setEmail(userData.get("email") != null ? userData.get("email").toString() : null);
                userInfo.setAvatarUrl(userData.get("avatarUrl") != null ? userData.get("avatarUrl").toString() : null);
                userInfo.setVerified(userData.get("verified") != null ? (Boolean) userData.get("verified") : false);
                
                log.debug("Successfully fetched user info for userId: {}", userId);
                return userInfo;
            }
            
            log.warn("No user data found for userId: {}", userId);
            return null;
            
        } catch (WebClientResponseException.NotFound e) {
            log.warn("User not found for userId: {}", userId);
            return null;
        } catch (Exception e) {
            log.error("Error fetching user info for userId: {} - {}", userId, e.getMessage());
            return null;
        }
    }
    
    public boolean validateUser(String userId) {
        try {
            log.debug("Validating user existence for userId: {}", userId);
            
            Map<String, Object> response = authServiceWebClient
                    .get()
                    .uri("/auth/user/{userId}", userId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            
            boolean isValid = response != null && response.containsKey("data");
            log.debug("User validation result for userId {}: {}", userId, isValid);
            return isValid;
            
        } catch (WebClientResponseException.NotFound e) {
            log.warn("User validation failed - user not found for userId: {}", userId);
            return false;
        } catch (Exception e) {
            log.error("Error validating user for userId: {} - {}", userId, e.getMessage());
            return false;
        }
    }
    
    @Cacheable(value = "userCache", key = "#username")
    public UserInfo getUserInfoByUsername(String username) {
        try {
            log.debug("Fetching user info for username: {}", username);
            
            Map<String, Object> response = authServiceWebClient
                    .get()
                    .uri("/auth/user/username/{username}", username)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            
            if (response != null && response.containsKey("data")) {
                Map<String, Object> userData = (Map<String, Object>) response.get("data");
                
                UserInfo userInfo = new UserInfo();
                userInfo.setId(userData.get("id") != null ? userData.get("id").toString() : null);
                userInfo.setUsername(userData.get("username") != null ? userData.get("username").toString() : null);
                userInfo.setFullName(userData.get("fullName") != null ? userData.get("fullName").toString() : null);
                userInfo.setEmail(userData.get("email") != null ? userData.get("email").toString() : null);
                userInfo.setAvatarUrl(userData.get("avatarUrl") != null ? userData.get("avatarUrl").toString() : null);
                userInfo.setVerified(userData.get("verified") != null ? (Boolean) userData.get("verified") : false);
                
                log.debug("Successfully fetched user info for username: {}", username);
                return userInfo;
            }
            
            log.warn("No user data found for username: {}", username);
            return null;
            
        } catch (WebClientResponseException.NotFound e) {
            log.warn("User not found for username: {}", username);
            return null;
        } catch (Exception e) {
            log.error("Error fetching user info for username: {} - {}", username, e.getMessage());
            return null;
        }
    }
}
