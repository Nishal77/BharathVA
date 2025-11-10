package com.bharathva.feed.service;

import com.bharathva.feed.dto.FeedEvent;
import com.bharathva.feed.dto.NotificationEvent;
import com.bharathva.feed.dto.NotificationResponse;
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
    
    /**
     * Notify WebSocket clients when a feed is commented
     */
    public void notifyFeedCommented(String userId, String feedId) {
        try {
            FeedEvent event = new FeedEvent("FEED_COMMENTED", feedId, userId, null);
            messagingTemplate.convertAndSend("/topic/feeds", event);
            log.info("📤 Sent feed commented event for user: {}, feed: {}", userId, feedId);
        } catch (Exception e) {
            log.error("❌ Error sending feed commented event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Notify WebSocket clients when a comment is deleted
     */
    public void notifyCommentDeleted(String userId, String feedId, int commentIndex) {
        try {
            FeedEvent event = new FeedEvent("COMMENT_DELETED", feedId, userId, String.valueOf(commentIndex));
            messagingTemplate.convertAndSend("/topic/feeds", event);
            log.info("📤 Sent comment deletion event for user: {}, feed: {}, commentIndex: {}", userId, feedId, commentIndex);
        } catch (Exception e) {
            log.error("❌ Error sending comment deletion event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send notification creation event to specific user
     * Uses topic-based approach with recipientUserId in the event for frontend filtering
     */
    public void notifyNotificationCreated(String notificationId, String recipientUserId, String senderId, String postId, String notificationType, Long unreadCount) {
        try {
            if (recipientUserId == null || recipientUserId.trim().isEmpty()) {
                log.warn("⚠️ Cannot send notification: recipientUserId is null or empty");
                return;
            }
            
            NotificationEvent event = NotificationEvent.created(notificationId, recipientUserId, senderId, postId, notificationType, unreadCount);
            // Send to topic - frontend will filter by recipientUserId
            messagingTemplate.convertAndSend("/topic/notifications", event);
            log.info("📤 Sent notification created event to topic: recipientUserId={}, notificationId: {}, type: {}, unreadCount: {}", 
                recipientUserId, notificationId, notificationType, unreadCount);
        } catch (Exception e) {
            log.error("❌ Error sending notification created event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send notification creation event with full notification data for instant display
     * Uses topic-based approach with recipientUserId in the event for frontend filtering
     * This works even if WebSocket authentication isn't fully configured
     */
    public void notifyNotificationCreated(NotificationResponse notification, Long unreadCount) {
        try {
            String recipientUserId = notification.getRecipientUserId();
            if (recipientUserId == null || recipientUserId.trim().isEmpty()) {
                log.warn("⚠️ Cannot send notification: recipientUserId is null or empty");
                return;
            }
            
            NotificationEvent event = NotificationEvent.created(notification, unreadCount);
            // Send to topic - frontend will filter by recipientUserId
            // This is more reliable than user-specific queues which require WebSocket authentication
            messagingTemplate.convertAndSend("/topic/notifications", event);
            log.info("📤 Sent notification created event to topic: recipientUserId={}, notificationId: {}, type: {}, unreadCount: {}", 
                recipientUserId,
                notification.getId(),
                notification.getType(),
                unreadCount);
        } catch (Exception e) {
            log.error("❌ Error sending notification created event with full data: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send notification count update to specific user
     * Uses topic-based approach with recipientUserId in the event for frontend filtering
     */
    public void notifyNotificationCountUpdated(String recipientUserId, Long unreadCount) {
        try {
            if (recipientUserId == null || recipientUserId.trim().isEmpty()) {
                log.warn("⚠️ Cannot send notification count update: recipientUserId is null or empty");
                return;
            }
            
            NotificationEvent event = NotificationEvent.countUpdated(recipientUserId, unreadCount);
            // Send to topic - frontend will filter by recipientUserId
            messagingTemplate.convertAndSend("/topic/notifications", event);
            log.info("📤 Sent notification count update to topic: recipientUserId={}, unreadCount: {}", recipientUserId, unreadCount);
        } catch (Exception e) {
            log.error("❌ Error sending notification count update: {}", e.getMessage(), e);
        }
    }
}
