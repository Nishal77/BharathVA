package com.bharathva.feed.service;

import com.bharathva.feed.dto.FeedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service for handling WebSocket communications for real-time feed updates
 */
@Service
public class WebSocketService {
    
    private static final Logger log = LoggerFactory.getLogger(WebSocketService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send feed creation event to all connected clients
     */
    public void notifyFeedCreated(String userId, String feedId, String message) {
        try {
            FeedEvent event = new FeedEvent("FEED_CREATED", feedId, userId, message);
            messagingTemplate.convertAndSend("/topic/feeds", event);
            log.info("📤 Sent feed creation event for user: {}, feed: {}", userId, feedId);
        } catch (Exception e) {
            log.error("❌ Error sending feed creation event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send feed deletion event to all connected clients
     */
    public void notifyFeedDeleted(String userId, String feedId) {
        try {
            FeedEvent event = new FeedEvent("FEED_DELETED", feedId, userId, null);
            messagingTemplate.convertAndSend("/topic/feeds", event);
            log.info("📤 Sent feed deletion event for user: {}, feed: {}", userId, feedId);
        } catch (Exception e) {
            log.error("❌ Error sending feed deletion event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send feed update event to all connected clients
     */
    public void notifyFeedUpdated(String userId, String feedId, String message) {
        try {
            FeedEvent event = new FeedEvent("FEED_UPDATED", feedId, userId, message);
            messagingTemplate.convertAndSend("/topic/feeds", event);
            log.info("📤 Sent feed update event for user: {}, feed: {}", userId, feedId);
        } catch (Exception e) {
            log.error("❌ Error sending feed update event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send user-specific feed events
     */
    public void notifyUserFeedEvent(String userId, FeedEvent event) {
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/feeds", event);
            log.info("📤 Sent user-specific feed event to user: {}, type: {}", userId, event.getType());
        } catch (Exception e) {
            log.error("❌ Error sending user-specific feed event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send feed liked event to all connected clients
     */
    public void notifyFeedLiked(String userId, String feedId) {
        try {
            FeedEvent event = new FeedEvent("FEED_LIKED", feedId, userId, null);
            messagingTemplate.convertAndSend("/topic/feeds", event);
            log.info("📤 Sent feed liked event for user: {}, feed: {}", userId, feedId);
        } catch (Exception e) {
            log.error("❌ Error sending feed liked event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send feed unliked event to all connected clients
     */
    public void notifyFeedUnliked(String userId, String feedId) {
        try {
            FeedEvent event = new FeedEvent("FEED_UNLIKED", feedId, userId, null);
            messagingTemplate.convertAndSend("/topic/feeds", event);
            log.info("📤 Sent feed unliked event for user: {}, feed: {}", userId, feedId);
        } catch (Exception e) {
            log.error("❌ Error sending feed unliked event: {}", e.getMessage(), e);
        }
    }
}
