package com.bharathva.feed.service;

import com.bharathva.feed.dto.NotificationResponse;
import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.Notification;
import com.bharathva.feed.model.UserInfo;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.feed.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing notifications
 */
@Service
public class NotificationService {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private FeedRepository feedRepository;
    
    @Autowired
    private UserClient userClient;
    
    /**
     * Create a like notification when a user likes a post
     * Only creates notification if the actor is not the post owner
     */
    @Transactional
    public void createLikeNotification(String feedId, String actorUserId) {
        try {
            log.info("Creating like notification for feed: {} by user: {}", feedId, actorUserId);
            
            // Find the feed
            Optional<Feed> feedOptional = feedRepository.findById(feedId);
            if (feedOptional.isEmpty()) {
                log.warn("Feed not found for notification: {}", feedId);
                return;
            }
            
            Feed feed = feedOptional.get();
            String recipientUserId = feed.getUserId();
            
            // Don't create notification if user liked their own post
            if (actorUserId.equals(recipientUserId)) {
                log.debug("User {} liked their own post, skipping notification", actorUserId);
                return;
            }
            
            // Check if notification already exists (prevent duplicates)
            // Only check unread notifications to prevent duplicates
            // This allows users to re-like after unliking
            List<Notification> unreadNotifications = notificationRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(recipientUserId);
            
            boolean notificationExists = unreadNotifications.stream()
                .anyMatch(n -> n.getPostId().equals(feedId) 
                    && n.getSenderId().equals(actorUserId) 
                    && n.getType() == Notification.NotificationType.LIKE);
            
            if (notificationExists) {
                log.info("Like notification already exists (unread) for feed: {} by user: {}, skipping creation", feedId, actorUserId);
                return;
            }
            
            log.info("Fetching user info for actor: {} from auth service", actorUserId);
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
            
            // Create notification using new schema (senderId, receiverId, postId, type)
            Notification notification = new Notification(
                actorUserId,    // senderId: who liked the post
                recipientUserId, // receiverId: post owner
                feedId,         // postId: which post
                Notification.NotificationType.LIKE
            );
            
            // Generate message dynamically based on actor info
            String notificationMessage = generateNotificationMessage(
                Notification.NotificationType.LIKE,
                actorInfo
            );
            notification.setMessage(notificationMessage);
            log.debug("Generated notification message: {}", notificationMessage);
            
            // Set actor details - try to get from cache or fetch again
            if (actorInfo != null) {
                notification.setActorUsername(actorInfo.getUsername());
                notification.setActorFullName(actorInfo.getFullName());
                // Get profile image URL - UserClient returns avatarUrl which comes from NeonDB profile_image_url
                String profileImageUrl = actorInfo.getAvatarUrl();
                if (profileImageUrl != null && !profileImageUrl.trim().isEmpty()) {
                    notification.setActorProfileImageUrl(profileImageUrl.trim());
                    log.debug("Set actor profile image URL: {}", profileImageUrl);
                }
            } else {
                // If user info fetch failed, still create notification
                // Frontend can fetch username separately using the senderId
                log.warn("Creating notification without actor details for actor: {}. Frontend will fetch username separately.", actorUserId);
                // Set a placeholder so we know to fetch it later
                notification.setActorUsername(null);
                notification.setActorFullName(null);
                // Update message to use generic format
                notification.setMessage(generateNotificationMessage(Notification.NotificationType.LIKE, null));
            }
            
            // Set feed image URL (first image if available)
            if (feed.getImageUrls() != null && !feed.getImageUrls().isEmpty()) {
                notification.setFeedImageUrl(feed.getImageUrls().get(0));
                log.debug("Set feed image URL: {}", feed.getImageUrls().get(0));
            }
            
            notification.setCreatedAt(LocalDateTime.now());
            notification.setUpdatedAt(LocalDateTime.now());
            notification.setRead(false);
            
            log.info("💾 Saving notification to MongoDB: senderId={}, receiverId={}, postId={}, type={}, message={}, hasActorInfo={}", 
                actorUserId, recipientUserId, feedId, Notification.NotificationType.LIKE, notification.getMessage(), actorInfo != null);
            
            Notification savedNotification = notificationRepository.save(notification);
            
            if (savedNotification == null) {
                log.error("❌ CRITICAL: Notification save returned null for feed: {} by user: {}", feedId, actorUserId);
                // Don't throw - try fallback creation
                throw new RuntimeException("Failed to save notification - save returned null");
            }
            
            // Verify the notification was saved (non-blocking check)
            try {
                Optional<Notification> verifyNotification = notificationRepository.findById(savedNotification.getId());
                if (verifyNotification.isEmpty()) {
                    log.warn("⚠️ Notification not found after save - ID: {} (may be a timing issue)", savedNotification.getId());
                } else {
                    log.info("✅ Notification verified in database: id={}", savedNotification.getId());
                }
            } catch (Exception verifyError) {
                log.warn("⚠️ Verification check failed (non-critical): {}", verifyError.getMessage());
                // Continue - notification was saved, verification is just a double-check
            }
            
            log.info("✅ Like notification created successfully: id={}, senderId={}, receiverId={}, postId={}, message={}, actorUsername={}", 
                savedNotification.getId(), 
                savedNotification.getSenderId(),
                savedNotification.getReceiverId(),
                savedNotification.getPostId(),
                savedNotification.getMessage(),
                savedNotification.getActorUsername() != null ? savedNotification.getActorUsername() : "null");
            
        } catch (Exception e) {
            log.error("❌ CRITICAL ERROR creating like notification for feed: {} by user: {} - {}", feedId, actorUserId, e.getMessage(), e);
            log.error("❌ Exception details: {}", e.getClass().getName());
            if (e.getCause() != null) {
                log.error("❌ Caused by: {}", e.getCause().getMessage());
            }
            // Don't throw - create notification anyway without user details if needed
            // Try to create a minimal notification even if user info fetch failed
            try {
                Feed feed = feedRepository.findById(feedId).orElse(null);
                if (feed != null) {
                    String recipientUserId = feed.getUserId();
                    if (!actorUserId.equals(recipientUserId)) {
                        Notification minimalNotification = new Notification(
                            actorUserId,        // senderId
                            recipientUserId,    // receiverId
                            feedId,            // postId
                            Notification.NotificationType.LIKE
                        );
                        minimalNotification.setMessage("Someone liked your post");
                        minimalNotification.setCreatedAt(LocalDateTime.now());
                        minimalNotification.setUpdatedAt(LocalDateTime.now());
                        minimalNotification.setRead(false);
                        
                        if (feed.getImageUrls() != null && !feed.getImageUrls().isEmpty()) {
                            minimalNotification.setFeedImageUrl(feed.getImageUrls().get(0));
                        }
                        
                        Notification saved = notificationRepository.save(minimalNotification);
                        log.warn("⚠️ Created minimal notification (without actor details) due to error: {}", saved.getId());
                    }
                }
            } catch (Exception fallbackError) {
                log.error("❌ Failed to create minimal notification: {}", fallbackError.getMessage());
            }
            // Don't re-throw - notification failure shouldn't break like functionality
        }
    }
    
    /**
     * Generate human-readable notification message based on type and actor info
     * @param type Notification type
     * @param actorInfo Actor user information (can be null)
     * @return Formatted notification message
     */
    private String generateNotificationMessage(Notification.NotificationType type, UserInfo actorInfo) {
        String actorName = "Someone";
        
        if (actorInfo != null) {
            // Prefer full name, fallback to username
            if (actorInfo.getFullName() != null && !actorInfo.getFullName().trim().isEmpty()) {
                actorName = actorInfo.getFullName().trim();
            } else if (actorInfo.getUsername() != null && !actorInfo.getUsername().trim().isEmpty()) {
                actorName = actorInfo.getUsername().trim();
            }
        }
        
        switch (type) {
            case LIKE:
                return actorName + " liked your post";
            case COMMENT:
                return actorName + " commented on your post";
            case REPLY:
                return actorName + " replied to your comment";
            case FOLLOW:
                return actorName + " is now following you";
            case MENTION:
                return actorName + " mentioned you in a post";
            default:
                return actorName + " interacted with your post";
        }
    }
    
    /**
     * Create a comment notification when a user comments on a post
     * Only creates notification if the actor is not the post owner
     */
    @Transactional
    public void createCommentNotification(String feedId, String actorUserId, String commentText) {
        try {
            log.info("Creating comment notification for feed: {} by user: {}", feedId, actorUserId);
            
            // Find the feed
            Optional<Feed> feedOptional = feedRepository.findById(feedId);
            if (feedOptional.isEmpty()) {
                log.warn("Feed not found for notification: {}", feedId);
                return;
            }
            
            Feed feed = feedOptional.get();
            String recipientUserId = feed.getUserId();
            
            // Don't create notification if user commented on their own post
            if (actorUserId.equals(recipientUserId)) {
                log.debug("User {} commented on their own post, skipping notification", actorUserId);
                return;
            }
            
            // REMOVED: Duplicate notification check
            // Each comment should create its own notification, allowing users to post multiple comments
            // This ensures all comments are visible in the notifications section
            log.debug("Creating comment notification for feed: {} by user: {} - allowing multiple comments per user", feedId, actorUserId);
            
            log.info("Fetching user info for actor: {} from auth service", actorUserId);
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
            
            // Create notification using new schema (senderId, receiverId, postId, type)
            Notification notification = new Notification(
                actorUserId,    // senderId: who commented
                recipientUserId, // receiverId: post owner
                feedId,         // postId: which post
                Notification.NotificationType.COMMENT
            );
            
            // Generate message dynamically based on actor info
            String notificationMessage = generateNotificationMessage(
                Notification.NotificationType.COMMENT,
                actorInfo
            );
            notification.setMessage(notificationMessage);
            log.debug("Generated notification message: {}", notificationMessage);
            
            // Set actor details
            if (actorInfo != null) {
                notification.setActorUsername(actorInfo.getUsername());
                notification.setActorFullName(actorInfo.getFullName());
                String profileImageUrl = actorInfo.getAvatarUrl();
                if (profileImageUrl != null && !profileImageUrl.trim().isEmpty()) {
                    notification.setActorProfileImageUrl(profileImageUrl.trim());
                    log.debug("Set actor profile image URL: {}", profileImageUrl);
                }
            } else {
                log.warn("Creating notification without actor details for actor: {}. Frontend will fetch username separately.", actorUserId);
                notification.setActorUsername(null);
                notification.setActorFullName(null);
                notification.setMessage(generateNotificationMessage(Notification.NotificationType.COMMENT, null));
            }
            
            // Set feed image URL (first image if available)
            if (feed.getImageUrls() != null && !feed.getImageUrls().isEmpty()) {
                notification.setFeedImageUrl(feed.getImageUrls().get(0));
                log.debug("Set feed image URL: {}", feed.getImageUrls().get(0));
            }
            
            // Store the actual comment text for display in notifications
            if (commentText != null && !commentText.trim().isEmpty()) {
                // Truncate if too long (max 200 chars for notification display)
                String truncatedComment = commentText.length() > 200 
                    ? commentText.substring(0, 197) + "..." 
                    : commentText;
                notification.setCommentText(truncatedComment);
                log.debug("Set comment text: {} (length: {})", truncatedComment, truncatedComment.length());
            }
            
            notification.setCreatedAt(LocalDateTime.now());
            notification.setUpdatedAt(LocalDateTime.now());
            notification.setRead(false);
            
            log.info("💾 Saving comment notification to MongoDB: senderId={}, receiverId={}, postId={}, type={}, message={}, commentText={}",
                actorUserId, recipientUserId, feedId, Notification.NotificationType.COMMENT, notification.getMessage(), notification.getCommentText());
            
            Notification savedNotification = notificationRepository.save(notification);
            
            if (savedNotification == null) {
                log.error("❌ CRITICAL: Notification save returned null for feed: {} by user: {}", feedId, actorUserId);
            } else {
                log.info("✅ Comment notification saved successfully with ID: {}", savedNotification.getId());
            }
            
        } catch (Exception e) {
            log.error("❌ Error creating comment notification for feed: {} by user: {}", feedId, actorUserId, e);
            // Don't throw - notification failure shouldn't break comment functionality
        }
    }
    
    /**
     * Delete like notification when a user unlikes a post
     */
    @Transactional
    public void deleteLikeNotification(String feedId, String actorUserId) {
        try {
            log.info("Deleting like notification for feed: {} by user: {}", feedId, actorUserId);
            
            // Find the feed to get recipient
            Optional<Feed> feedOptional = feedRepository.findById(feedId);
            if (feedOptional.isEmpty()) {
                log.warn("Feed not found for notification deletion: {}", feedId);
                return;
            }
            
            Feed feed = feedOptional.get();
            String recipientUserId = feed.getUserId();
            
            // Find and delete the notification (using new schema fields)
            List<Notification> notifications = notificationRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(recipientUserId);
            notifications.stream()
                .filter(n -> n.getPostId().equals(feedId) 
                    && n.getSenderId().equals(actorUserId) 
                    && n.getType() == Notification.NotificationType.LIKE)
                .forEach(notification -> {
                    notificationRepository.delete(notification);
                    log.info("Deleted like notification: {}", notification.getId());
                });
            
        } catch (Exception e) {
            log.error("Error deleting like notification for feed: {} by user: {}", feedId, actorUserId, e);
        }
    }
    
    /**
     * Get all notifications for a user, ordered by latest first
     * If actor details are missing, fetches them from auth service
     */
    public Page<NotificationResponse> getNotificationsForUser(String userId, int page, int size) {
        log.info("Fetching notifications for user: {}, page: {}, size: {}", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId, pageable);
        
        // Enhance notifications with missing actor details
        notifications.getContent().forEach(notification -> {
            if (notification.getActorUsername() == null || notification.getActorUsername().trim().isEmpty()) {
                try {
                    String senderId = notification.getSenderId();
                    log.info("Fetching missing actor details for notification: {}, senderId: {}", 
                        notification.getId(), senderId);
                    UserInfo actorInfo = userClient.getUserInfo(senderId);
                    if (actorInfo != null) {
                        notification.setActorUsername(actorInfo.getUsername());
                        notification.setActorFullName(actorInfo.getFullName());
                        if (actorInfo.getAvatarUrl() != null && !actorInfo.getAvatarUrl().trim().isEmpty()) {
                            notification.setActorProfileImageUrl(actorInfo.getAvatarUrl().trim());
                        }
                        // Update message with actual user name
                        String updatedMessage = generateNotificationMessage(notification.getType(), actorInfo);
                        notification.setMessage(updatedMessage);
                        // Save updated notification
                        notificationRepository.save(notification);
                        log.info("Updated notification {} with actor details: username={}, fullName={}, message={}", 
                            notification.getId(), actorInfo.getUsername(), actorInfo.getFullName(), updatedMessage);
                    } else {
                        log.warn("UserInfo returned null for senderId: {} in notification: {}", 
                            senderId, notification.getId());
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch actor details for notification: {}, senderId: {} - {}", 
                        notification.getId(), notification.getSenderId(), e.getMessage());
                }
            }
        });
        
        Page<NotificationResponse> response = notifications.map(NotificationResponse::new);
        log.info("Retrieved {} notifications for user: {}", response.getTotalElements(), userId);
        
        return response;
    }
    
    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(String userId) {
        long count = notificationRepository.countByReceiverIdAndIsReadFalse(userId);
        log.debug("Unread notification count for user {}: {}", userId, count);
        return count;
    }
    
    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(String notificationId, String userId) {
        Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
        if (notificationOptional.isPresent()) {
            Notification notification = notificationOptional.get();
            if (notification.getReceiverId().equals(userId)) {
                notification.setRead(true);
                notification.updateTimestamp();
                notificationRepository.save(notification);
                log.info("Marked notification {} as read", notificationId);
            } else {
                log.warn("User {} attempted to mark notification {} belonging to another user", userId, notificationId);
            }
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
        log.info("Marked all notifications as read for user: {}", userId);
    }
}
