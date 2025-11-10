package com.bharathva.feed.service;

import com.bharathva.feed.service.UserClient;
import com.bharathva.feed.dto.NotificationResponse;
import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.Notification;
import com.bharathva.feed.model.UserInfo;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.feed.repository.NotificationRepository;
import com.bharathva.feed.service.WebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing notifications
 * Handles creation, retrieval, and updates of user notifications
 */
@Service
public class NotificationService {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private FeedRepository feedRepository;
    
    @Autowired
    private WebSocketService webSocketService;
    
    /**
     * Get all notifications for a user, ordered by creation date (newest first)
     */
    public Page<Notification> getNotificationsByReceiverId(String receiverId, Pageable pageable) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId, pageable);
    }
    
    /**
     * Get notifications for a user with pagination (legacy method for backward compatibility)
     * Returns NotificationResponse DTOs for API responses
     */
    public Page<NotificationResponse> getNotificationsForUser(String receiverId, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<Notification> notifications = getNotificationsByReceiverId(receiverId, pageable);
        // Convert to NotificationResponse DTOs
        return notifications.map(NotificationResponse::new);
    }
    
    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(String receiverId) {
        return notificationRepository.countByReceiverIdAndIsReadFalse(receiverId);
    }
    
    /**
     * Mark all notifications as read for a user
     * @return The updated unread count (should be 0 after marking all as read)
     */
    @Transactional
    @CacheEvict(value = "notifications", allEntries = true)
    public long markAllAsRead(String receiverId) {
        List<Notification> unreadNotifications = notificationRepository.findByReceiverIdAndIsReadFalse(receiverId);
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.updateTimestamp();
        });
        notificationRepository.saveAll(unreadNotifications);
        log.info("✅ Marked {} notifications as read for user: {}", unreadNotifications.size(), receiverId);
        
        // Return the updated unread count (should be 0)
        return getUnreadCount(receiverId);
    }
    
    /**
     * Mark a specific notification as read
     */
    @Transactional
    @CacheEvict(value = "notifications", allEntries = true)
    public void markAsRead(String notificationId, String receiverId) {
        Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
        if (notificationOptional.isPresent()) {
            Notification notification = notificationOptional.get();
            // Verify the notification belongs to the receiver
            if (notification.getReceiverId().equals(receiverId)) {
                notification.setRead(true);
                notification.updateTimestamp();
                notificationRepository.save(notification);
                log.info("✅ Marked notification {} as read for user: {}", notificationId, receiverId);
            } else {
                log.warn("⚠️ Attempted to mark notification {} as read, but it doesn't belong to user: {}", notificationId, receiverId);
            }
        } else {
            log.warn("⚠️ Notification not found: {}", notificationId);
        }
    }
    
    /**
     * Create a like notification when a user likes a post
     */
    @Transactional
    public void createLikeNotification(String feedId, String actorUserId) {
        try {
            log.info("🔔 Creating like notification for feed: {} by user: {}", feedId, actorUserId);
            
            // Validate inputs
            if (feedId == null || feedId.trim().isEmpty()) {
                log.error("❌ Cannot create like notification: feedId is null or empty");
                return;
            }
            if (actorUserId == null || actorUserId.trim().isEmpty()) {
                log.error("❌ Cannot create like notification: actorUserId is null or empty");
                return;
            }
            
            // Get feed to find post owner
            Optional<Feed> feedOptional = feedRepository.findById(feedId);
            if (feedOptional.isEmpty()) {
                log.error("❌ Cannot create like notification: feed not found: {}", feedId);
                return;
            }
            
            Feed feed = feedOptional.get();
            String postOwnerId = feed.getUserId();
            
            // Don't create notification if user liked their own post
            if (actorUserId.equals(postOwnerId)) {
                log.info("ℹ️ User {} liked their own post, skipping notification", actorUserId);
                return;
            }
            
            // Check if notification already exists (prevent duplicates)
            List<Notification> existingNotifications = notificationRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(postOwnerId);
            boolean alreadyExists = existingNotifications.stream()
                .anyMatch(n -> n.getSenderId().equals(actorUserId) 
                    && n.getPostId().equals(feedId) 
                    && n.getType() == Notification.NotificationType.LIKE
                    && !n.isRead());
            
            if (alreadyExists) {
                log.info("ℹ️ Like notification already exists for user {} on feed {}, skipping", actorUserId, feedId);
                return;
            }
            
            // Get actor user info from auth service
            UserInfo actorInfo = null;
            try {
                actorInfo = userClient.getUserInfo(actorUserId);
                if (actorInfo != null) {
                    log.info("Successfully fetched user info for actor: {} - username: {}, fullName: {}", 
                        actorUserId, actorInfo.getUsername(), actorInfo.getFullName());
                } else {
                    log.warn("User info returned null for actor: {}, will create notification without user details", actorUserId);
                }
            } catch (Exception e) {
                log.error("Error fetching user info for actor: {} - {}", actorUserId, e.getMessage(), e);
                // Continue to create notification even if user info fetch fails
            }
            
            // Create notification
            Notification notification = new Notification(
                actorUserId,           // senderId: who liked
                postOwnerId,           // receiverId: post owner
                feedId,                // postId: which post
                Notification.NotificationType.LIKE
            );
            
            // Generate message dynamically based on actor info
            String notificationMessage = generateLikeNotificationMessage(actorInfo);
            notification.setMessage(notificationMessage);
            
            // Set actor details
            if (actorInfo != null) {
                notification.setActorUsername(actorInfo.getUsername());
                notification.setActorFullName(actorInfo.getFullName());
                String profileImageUrl = actorInfo.getAvatarUrl();
                if (profileImageUrl != null && !profileImageUrl.trim().isEmpty()) {
                    notification.setActorProfileImageUrl(profileImageUrl.trim());
                }
            }
            
            // Try to get feed image for thumbnail
            try {
                if (feed.hasImages() && !feed.getImageUrls().isEmpty()) {
                    notification.setFeedImageUrl(feed.getImageUrls().get(0));
                }
            } catch (Exception e) {
                log.warn("Failed to fetch feed image for like notification: {}", e.getMessage());
            }
            
            notification.setRead(false);
            
            log.info("💾 Saving like notification to MongoDB: senderId={}, receiverId={}, postId={}, type={}, message={}",
                actorUserId, postOwnerId, feedId, Notification.NotificationType.LIKE, notification.getMessage());
            
            Notification savedNotification = notificationRepository.save(notification);
            
            if (savedNotification == null) {
                log.error("❌ CRITICAL: Like notification save returned null for feed: {} by user: {}", feedId, actorUserId);
            } else {
                log.info("✅ Like notification saved successfully with ID: {}", savedNotification.getId());
                
                // Send WebSocket notification to recipient
                try {
                    long unreadCount = getUnreadCount(postOwnerId);
                    NotificationResponse notificationResponse = new NotificationResponse(savedNotification);
                    webSocketService.notifyNotificationCreated(notificationResponse, unreadCount);
                    log.info("📤 Sent WebSocket notification for like: notificationId={}, recipient={}", savedNotification.getId(), postOwnerId);
                } catch (Exception wsError) {
                    log.warn("⚠️ Failed to send WebSocket notification (non-critical): {}", wsError.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("❌ Error creating like notification for feed: {} by user: {}", feedId, actorUserId, e);
            // Don't throw - notification failure shouldn't break like functionality
        }
    }
    
    /**
     * Generate like notification message
     */
    private String generateLikeNotificationMessage(UserInfo actorInfo) {
        String actorName = "Someone";
        
        if (actorInfo != null) {
            if (actorInfo.getFullName() != null && !actorInfo.getFullName().trim().isEmpty()) {
                actorName = actorInfo.getFullName().trim();
            } else if (actorInfo.getUsername() != null && !actorInfo.getUsername().trim().isEmpty()) {
                actorName = actorInfo.getUsername().trim();
            }
        }
        
        return actorName + " liked your post";
    }
    
    /**
     * Create a comment notification when a user comments on a post
     */
    @Transactional
    public void createCommentNotification(String feedId, String actorUserId, String commentText) {
        try {
            log.info("🔔 Creating comment notification for feed: {} by user: {}", feedId, actorUserId);
            
            // Validate inputs
            if (feedId == null || feedId.trim().isEmpty()) {
                log.error("❌ Cannot create comment notification: feedId is null or empty");
                return;
            }
            if (actorUserId == null || actorUserId.trim().isEmpty()) {
                log.error("❌ Cannot create comment notification: actorUserId is null or empty");
                return;
            }
            
            // Get feed to find post owner
            Optional<Feed> feedOptional = feedRepository.findById(feedId);
            if (feedOptional.isEmpty()) {
                log.error("❌ Cannot create comment notification: feed not found: {}", feedId);
                return;
            }
            
            Feed feed = feedOptional.get();
            String postOwnerId = feed.getUserId();
            
            // Don't create notification if user commented on their own post
            if (actorUserId.equals(postOwnerId)) {
                log.info("ℹ️ User {} commented on their own post, skipping notification", actorUserId);
                return;
            }
            
            // Get actor user info from auth service
            UserInfo actorInfo = null;
            try {
                actorInfo = userClient.getUserInfo(actorUserId);
                if (actorInfo != null) {
                    log.info("Successfully fetched user info for actor: {} - username: {}, fullName: {}", 
                        actorUserId, actorInfo.getUsername(), actorInfo.getFullName());
                } else {
                    log.warn("User info returned null for actor: {}, will create notification without user details", actorUserId);
                }
            } catch (Exception e) {
                log.error("Error fetching user info for actor: {} - {}", actorUserId, e.getMessage(), e);
                // Continue to create notification even if user info fetch fails
            }
            
            // Create notification
            Notification notification = new Notification(
                actorUserId,           // senderId: who commented
                postOwnerId,           // receiverId: post owner
                feedId,                // postId: which post
                Notification.NotificationType.COMMENT
            );
            
            // Generate message dynamically based on actor info
            String notificationMessage = generateCommentNotificationMessage(actorInfo);
            notification.setMessage(notificationMessage);
            
            // Set comment text
            if (commentText != null && !commentText.trim().isEmpty()) {
                notification.setCommentText(commentText.trim());
            }
            
            // Set actor details
            if (actorInfo != null) {
                notification.setActorUsername(actorInfo.getUsername());
                notification.setActorFullName(actorInfo.getFullName());
                String profileImageUrl = actorInfo.getAvatarUrl();
                if (profileImageUrl != null && !profileImageUrl.trim().isEmpty()) {
                    notification.setActorProfileImageUrl(profileImageUrl.trim());
                }
            }
            
            // Try to get feed image for thumbnail
            try {
                if (feed.hasImages() && !feed.getImageUrls().isEmpty()) {
                    notification.setFeedImageUrl(feed.getImageUrls().get(0));
                }
            } catch (Exception e) {
                log.warn("Failed to fetch feed image for comment notification: {}", e.getMessage());
            }
            
            notification.setRead(false);
            
            log.info("💾 Saving comment notification to MongoDB: senderId={}, receiverId={}, postId={}, type={}, message={}, commentText={}",
                actorUserId, postOwnerId, feedId, Notification.NotificationType.COMMENT, notification.getMessage(), notification.getCommentText());
            
            try {
                Notification savedNotification = notificationRepository.save(notification);
                
                if (savedNotification == null) {
                    log.error("❌ CRITICAL: Comment notification save returned null for feed: {} by user: {}", feedId, actorUserId);
                    throw new RuntimeException("Notification save returned null");
                } else {
                    log.info("✅ Comment notification saved successfully with ID: {} to MongoDB", savedNotification.getId());
                    
                    // Verify notification exists in database
                    Optional<Notification> verifyOptional = notificationRepository.findById(savedNotification.getId());
                    if (verifyOptional.isPresent()) {
                        log.info("✅ Verified comment notification exists in MongoDB database");
                    } else {
                        log.error("❌ CRITICAL: Comment notification not found in database after save - persistence issue!");
                    }
                    
                    // Send WebSocket notification to recipient
                    try {
                        long unreadCount = getUnreadCount(postOwnerId);
                        NotificationResponse notificationResponse = new NotificationResponse(savedNotification);
                        webSocketService.notifyNotificationCreated(notificationResponse, unreadCount);
                        log.info("📤 Sent WebSocket notification for comment: notificationId={}, recipient={}", savedNotification.getId(), postOwnerId);
                    } catch (Exception wsError) {
                        log.warn("⚠️ Failed to send WebSocket notification (non-critical): {}", wsError.getMessage());
                    }
                }
            } catch (Exception saveError) {
                log.error("❌ CRITICAL: Failed to save comment notification to MongoDB: {}", saveError.getMessage(), saveError);
                throw saveError; // Re-throw to ensure we know if save fails
            }
            
        } catch (Exception e) {
            log.error("❌ Error creating comment notification for feed: {} by user: {}", feedId, actorUserId, e);
            // Don't throw - notification failure shouldn't break comment functionality
        }
    }
    
    /**
     * Generate comment notification message
     */
    private String generateCommentNotificationMessage(UserInfo actorInfo) {
        String actorName = "Someone";
        
        if (actorInfo != null) {
            if (actorInfo.getFullName() != null && !actorInfo.getFullName().trim().isEmpty()) {
                actorName = actorInfo.getFullName().trim();
            } else if (actorInfo.getUsername() != null && !actorInfo.getUsername().trim().isEmpty()) {
                actorName = actorInfo.getUsername().trim();
            }
        }
        
        return actorName + " commented on your post";
    }
    
    /**
     * Generate reply notification message with comment text
     * Format: "{User1 name} replied to your comment: {comment message}"
     */
    private String generateReplyNotificationMessage(UserInfo actorInfo, String replyText) {
        String actorName = "Someone";
        
        if (actorInfo != null) {
            // Prefer full name, fallback to username
            if (actorInfo.getFullName() != null && !actorInfo.getFullName().trim().isEmpty()) {
                actorName = actorInfo.getFullName().trim();
            } else if (actorInfo.getUsername() != null && !actorInfo.getUsername().trim().isEmpty()) {
                actorName = actorInfo.getUsername().trim();
            }
        }
        
        // Truncate reply text if too long (max 100 chars for message)
        String displayText = replyText;
        if (displayText != null && displayText.length() > 100) {
            displayText = displayText.substring(0, 97) + "...";
        }
        
        return actorName + " replied to your comment: " + (displayText != null ? displayText : "");
    }
    
    /**
     * Create a reply notification when a user replies to a comment
     * 
     * Flow: User2 posts a comment on User1's post -> User1 gets COMMENT notification
     *       User1 replies to User2's comment -> User2 gets REPLY notification
     * 
     * @param feedId The ID of the feed/post
     * @param actorUserId The user who replied (User1 in the example above)
     * @param commentAuthorUserId The user whose comment was replied to (User2 in the example above)
     * @param commentIndex The index of the comment being replied to
     * @param replyText The text of the reply
     * @param originalCommentText The text of the original comment that was replied to
     * @param commentId The ID/index of the comment being replied to
     */
    @Transactional
    public void createReplyNotification(String feedId, String actorUserId, String commentAuthorUserId, int commentIndex, String replyText, String originalCommentText, String commentId) {
        try {
            log.info("🔔 Creating reply notification - feedId: {}, actorUserId: {}, commentAuthorUserId: {}, commentIndex: {}, commentId: {}", 
                feedId, actorUserId, commentAuthorUserId, commentIndex, commentId);
            log.info("🔔 Reply text: '{}', Original comment text: '{}'", replyText, originalCommentText);
            
            // Validate inputs with detailed error messages
            if (feedId == null || feedId.trim().isEmpty()) {
                log.error("❌ Cannot create reply notification: feedId is null or empty");
                return;
            }
            if (actorUserId == null || actorUserId.trim().isEmpty()) {
                log.error("❌ Cannot create reply notification: actorUserId is null or empty");
                return;
            }
            if (commentAuthorUserId == null || commentAuthorUserId.trim().isEmpty()) {
                log.error("❌ Cannot create reply notification: commentAuthorUserId is null or empty");
                return;
            }
            
            // Don't create notification if user replied to their own comment
            if (actorUserId.equals(commentAuthorUserId)) {
                log.info("ℹ️ User {} replied to their own comment, skipping notification", actorUserId);
                return;
            }
            
            log.info("✅ Validation passed - proceeding with notification creation");
            
            // Get actor user info from auth service
            UserInfo actorInfo = null;
            try {
                log.info("📞 Fetching user info for actor: {} from auth service", actorUserId);
                actorInfo = userClient.getUserInfo(actorUserId);
                if (actorInfo != null) {
                    log.info("✅ Successfully fetched user info for actor: {} - username: '{}', fullName: '{}'", 
                        actorUserId, actorInfo.getUsername(), actorInfo.getFullName());
                } else {
                    log.warn("⚠️ User info returned null for actor: {}, will create notification without user details", actorUserId);
                }
            } catch (Exception e) {
                log.error("❌ Error fetching user info for actor: {} - {}", actorUserId, e.getMessage(), e);
                // Continue to create notification even if user info fetch fails
            }
            
            // Create notification using REPLY type
            Notification notification = new Notification(
                actorUserId,           // senderId: who replied (User1)
                commentAuthorUserId,   // receiverId: comment author (User2) - this is who gets the notification
                feedId,                // postId: which post
                Notification.NotificationType.REPLY
            );
            
            // Generate message dynamically based on actor info with comment text
            // Format: "{User1 name} replied to your comment: {comment message}"
            String notificationMessage = generateReplyNotificationMessage(actorInfo, replyText);
            notification.setMessage(notificationMessage);
            log.info("📝 Generated reply notification message: '{}'", notificationMessage);
            
            // Set actor details
            if (actorInfo != null) {
                notification.setActorUsername(actorInfo.getUsername());
                notification.setActorFullName(actorInfo.getFullName());
                String profileImageUrl = actorInfo.getAvatarUrl();
                if (profileImageUrl != null && !profileImageUrl.trim().isEmpty()) {
                    notification.setActorProfileImageUrl(profileImageUrl.trim());
                    log.debug("Set actor profile image URL: {}", profileImageUrl);
                }
            }
            
            // Set reply text for display (the actual reply message from User1)
            if (replyText != null && !replyText.trim().isEmpty()) {
                notification.setCommentText(replyText.trim());
                log.debug("Set reply text (commentText): '{}'", replyText.trim());
            } else {
                log.warn("⚠️ Reply text is null or empty for notification");
            }
            
            // Store original comment text that was replied to (User2's original comment)
            if (originalCommentText != null && !originalCommentText.trim().isEmpty()) {
                notification.setOriginalCommentText(originalCommentText.trim());
                log.debug("Set original comment text: '{}'", originalCommentText.trim());
            } else {
                log.warn("⚠️ Original comment text is null or empty for notification");
            }
            
            // Store commentId (index of the comment being replied to)
            if (commentId != null && !commentId.trim().isEmpty()) {
                notification.setCommentId(commentId.trim());
                log.debug("Set commentId: {}", commentId);
            }
            
            // Try to get feed image for thumbnail
            try {
                Optional<Feed> feedOptional = feedRepository.findById(feedId);
                if (feedOptional.isPresent()) {
                    Feed feed = feedOptional.get();
                    if (feed.hasImages() && !feed.getImageUrls().isEmpty()) {
                        notification.setFeedImageUrl(feed.getImageUrls().get(0));
                        log.debug("Set feed image URL: {}", feed.getImageUrls().get(0));
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to fetch feed image for reply notification: {}", e.getMessage());
            }
            
            notification.setRead(false);
            
            // Log all notification fields before saving
            log.info("💾 Saving reply notification to MongoDB:");
            log.info("   - senderId: {}", notification.getSenderId());
            log.info("   - receiverId: {}", notification.getReceiverId());
            log.info("   - postId: {}", notification.getPostId());
            log.info("   - type: {}", notification.getType());
            log.info("   - message: '{}'", notification.getMessage());
            log.info("   - commentText: '{}'", notification.getCommentText());
            log.info("   - originalCommentText: '{}'", notification.getOriginalCommentText());
            log.info("   - commentId: {}", notification.getCommentId());
            
            try {
                Notification savedNotification = notificationRepository.save(notification);
                
                if (savedNotification == null) {
                    log.error("❌ CRITICAL: Reply notification save returned null for feed: {} by user: {}", feedId, actorUserId);
                    throw new RuntimeException("Notification save returned null");
                } else {
                    log.info("✅ Reply notification saved successfully with ID: {} to MongoDB", savedNotification.getId());
                    log.info("✅ Verification - saved notification type: {}, receiverId: {}, message: '{}'", 
                        savedNotification.getType(), savedNotification.getReceiverId(), savedNotification.getMessage());
                    
                    // Verify notification exists in database
                    Optional<Notification> verifyOptional = notificationRepository.findById(savedNotification.getId());
                    if (verifyOptional.isPresent()) {
                        log.info("✅ Verified notification exists in MongoDB database");
                    } else {
                        log.error("❌ CRITICAL: Notification not found in database after save - persistence issue!");
                    }
                    
                    // Send WebSocket notification to recipient with full notification data for instant display
                    try {
                        long unreadCount = getUnreadCount(commentAuthorUserId);
                        NotificationResponse notificationResponse = new NotificationResponse(savedNotification);
                        webSocketService.notifyNotificationCreated(notificationResponse, unreadCount);
                        log.info("📤 Sent WebSocket notification with full data for reply: notificationId={}, recipient={}, unreadCount={}", 
                            savedNotification.getId(), commentAuthorUserId, unreadCount);
                    } catch (Exception wsError) {
                        log.error("❌ Failed to send WebSocket notification: {}", wsError.getMessage(), wsError);
                        // Don't throw - WebSocket failure shouldn't break notification creation
                    }
                }
            } catch (Exception saveError) {
                log.error("❌ CRITICAL: Failed to save reply notification to MongoDB: {}", saveError.getMessage(), saveError);
                throw saveError; // Re-throw to ensure we know if save fails
            }
            
        } catch (Exception e) {
            log.error("❌ Error creating reply notification for feed: {} by user: {} to comment author: {}", 
                feedId, actorUserId, commentAuthorUserId, e);
            // Don't throw - notification failure shouldn't break reply functionality
        }
    }
    
    /**
     * Create a reply notification when a user replies to a comment (overloaded method)
     */
    @Transactional
    public void createReplyNotification(String feedId, String actorUserId, String commentAuthorUserId, int commentIndex, String replyText, String originalCommentText) {
        createReplyNotification(feedId, actorUserId, commentAuthorUserId, commentIndex, replyText, originalCommentText, String.valueOf(commentIndex));
    }
    
    /**
     * Delete like notification when a user unlikes a post
     */
    @Transactional
    @CacheEvict(value = "notifications", allEntries = true)
    public void deleteLikeNotification(String feedId, String actorUserId) {
        try {
            notificationRepository.deleteBySenderIdAndPostIdAndType(actorUserId, feedId, Notification.NotificationType.LIKE);
            log.info("✅ Deleted like notification for feed: {} by user: {}", feedId, actorUserId);
        } catch (Exception e) {
            log.error("❌ Error deleting like notification: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Delete comment notification when a comment is deleted
     */
    @Transactional
    @CacheEvict(value = "notifications", allEntries = true)
    public void deleteCommentNotification(String feedId, String actorUserId) {
        try {
            notificationRepository.deleteBySenderIdAndPostIdAndType(actorUserId, feedId, Notification.NotificationType.COMMENT);
            log.info("✅ Deleted comment notification for feed: {} by user: {}", feedId, actorUserId);
        } catch (Exception e) {
            log.error("❌ Error deleting comment notification: {}", e.getMessage(), e);
        }
    }
}
