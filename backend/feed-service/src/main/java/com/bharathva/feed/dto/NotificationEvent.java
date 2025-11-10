package com.bharathva.feed.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * DTO for WebSocket notification events
 */
public class NotificationEvent {
    
    private String type; // NOTIFICATION_CREATED, NOTIFICATION_READ, NOTIFICATION_DELETED, NOTIFICATION_COUNT_UPDATED
    private String notificationId;
    private String recipientUserId;
    private String senderId;
    private String postId;
    private String notificationType; // LIKE, COMMENT, REPLY, FOLLOW, MENTION
    private Long unreadCount;
    
    // Full notification data for instant display (optional, included when available)
    private NotificationResponse notification;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    // Constructors
    public NotificationEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public NotificationEvent(String type, String notificationId, String recipientUserId, String senderId, String postId, String notificationType, Long unreadCount) {
        this();
        this.type = type;
        this.notificationId = notificationId;
        this.recipientUserId = recipientUserId;
        this.senderId = senderId;
        this.postId = postId;
        this.notificationType = notificationType;
        this.unreadCount = unreadCount;
    }
    
    // Factory methods for common events
    public static NotificationEvent created(String notificationId, String recipientUserId, String senderId, String postId, String notificationType, Long unreadCount) {
        return new NotificationEvent("NOTIFICATION_CREATED", notificationId, recipientUserId, senderId, postId, notificationType, unreadCount);
    }
    
    public static NotificationEvent created(NotificationResponse notification, Long unreadCount) {
        NotificationEvent event = new NotificationEvent(
            "NOTIFICATION_CREATED",
            notification.getId(),
            notification.getRecipientUserId(), // Use legacy field name
            notification.getActorUserId(), // Use legacy field name
            notification.getFeedId(), // Use legacy field name
            notification.getType(),
            unreadCount
        );
        event.setNotification(notification);
        return event;
    }
    
    public static NotificationEvent countUpdated(String recipientUserId, Long unreadCount) {
        return new NotificationEvent("NOTIFICATION_COUNT_UPDATED", null, recipientUserId, null, null, null, unreadCount);
    }
    
    // Getters and Setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getNotificationId() {
        return notificationId;
    }
    
    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }
    
    public String getRecipientUserId() {
        return recipientUserId;
    }
    
    public void setRecipientUserId(String recipientUserId) {
        this.recipientUserId = recipientUserId;
    }
    
    public String getSenderId() {
        return senderId;
    }
    
    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }
    
    public String getPostId() {
        return postId;
    }
    
    public void setPostId(String postId) {
        this.postId = postId;
    }
    
    public String getNotificationType() {
        return notificationType;
    }
    
    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
    
    public Long getUnreadCount() {
        return unreadCount;
    }
    
    public void setUnreadCount(Long unreadCount) {
        this.unreadCount = unreadCount;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public NotificationResponse getNotification() {
        return notification;
    }
    
    public void setNotification(NotificationResponse notification) {
        this.notification = notification;
    }
    
    @Override
    public String toString() {
        return "NotificationEvent{" +
                "type='" + type + '\'' +
                ", notificationId='" + notificationId + '\'' +
                ", recipientUserId='" + recipientUserId + '\'' +
                ", senderId='" + senderId + '\'' +
                ", postId='" + postId + '\'' +
                ", notificationType='" + notificationType + '\'' +
                ", unreadCount=" + unreadCount +
                ", timestamp=" + timestamp +
                '}';
    }
}

