package com.bharathva.feed.repository;

import com.bharathva.feed.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    // Primary Schema Methods (using new field names)
    /**
     * Find all notifications for a specific receiver, ordered by creation date (newest first)
     */
    Page<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId, Pageable pageable);
    
    /**
     * Count unread notifications for a receiver
     */
    long countByReceiverIdAndIsReadFalse(String receiverId);
    
    /**
     * Find unread notifications for a receiver
     */
    List<Notification> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(String receiverId);
    
    /**
     * Find all unread notifications for a receiver (used for bulk update)
     */
    List<Notification> findByReceiverIdAndIsReadFalse(String receiverId);
    
    /**
     * Delete old notifications (for cleanup)
     */
    void deleteByReceiverIdAndCreatedAtBefore(String receiverId, java.time.LocalDateTime before);
    
    /**
     * Delete comment notifications for a specific feed and sender
     * This is used when a comment is deleted to remove its associated notification
     */
    void deleteBySenderIdAndPostIdAndType(String senderId, String postId, Notification.NotificationType type);
    
    // Legacy Methods (for backward compatibility - these use old field names but work via getters)
    /**
     * Find all notifications for a specific recipient, ordered by creation date (newest first)
     * @deprecated Use findByReceiverIdOrderByCreatedAtDesc instead
     */
    @Deprecated
    default Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId, Pageable pageable) {
        return findByReceiverIdOrderByCreatedAtDesc(recipientUserId, pageable);
    }
    
    /**
     * Count unread notifications for a recipient
     * @deprecated Use countByReceiverIdAndIsReadFalse instead
     */
    @Deprecated
    default long countByRecipientUserIdAndIsReadFalse(String recipientUserId) {
        return countByReceiverIdAndIsReadFalse(recipientUserId);
    }
    
    /**
     * Find unread notifications for a recipient
     * @deprecated Use findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc instead
     */
    @Deprecated
    default List<Notification> findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(String recipientUserId) {
        return findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(recipientUserId);
    }
    
    /**
     * Mark all notifications as read for a recipient (legacy method)
     * @deprecated Use findByReceiverIdAndIsReadFalse and update in service layer instead
     */
    @Deprecated
    default void markAllAsReadLegacy(String recipientUserId) {
        // This method is deprecated - use NotificationService.markAllAsRead instead
        // Kept for backward compatibility only
    }
    
    /**
     * Delete old notifications (for cleanup)
     * @deprecated Use deleteByReceiverIdAndCreatedAtBefore instead
     */
    @Deprecated
    default void deleteByRecipientUserIdAndCreatedAtBefore(String recipientUserId, java.time.LocalDateTime before) {
        deleteByReceiverIdAndCreatedAtBefore(recipientUserId, before);
    }
}
