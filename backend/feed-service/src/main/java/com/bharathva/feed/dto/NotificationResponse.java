package com.bharathva.feed.dto;

import com.bharathva.feed.model.Notification;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * DTO for notification responses
 */
public class NotificationResponse {
    
    private String id;
    
    // Primary Schema Fields
    private String senderId;
    private String receiverId;
    private String postId;
    private String type;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    
    // Legacy/Compatibility Fields
    private String recipientUserId;
    private String actorUserId;
    private String feedId;
    
    // UI Enhancement Fields
    private String actorUsername;
    private String actorFullName;
    private String actorProfileImageUrl;
    private String feedImageUrl;
    
    private LocalDateTime updatedAt;
    
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private long timeAgoHours; // Time elapsed in hours for frontend display
    
    public NotificationResponse() {}
    
    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        
        // Primary Schema Fields
        this.senderId = notification.getSenderId();
        this.receiverId = notification.getReceiverId();
        this.postId = notification.getPostId();
        this.type = notification.getType().name();
        this.message = notification.getMessage();
        this.isRead = notification.isRead();
        this.createdAt = notification.getCreatedAt();
        
        // Legacy Fields (for backward compatibility)
        this.recipientUserId = notification.getRecipientUserId() != null ? notification.getRecipientUserId() : notification.getReceiverId();
        this.actorUserId = notification.getActorUserId() != null ? notification.getActorUserId() : notification.getSenderId();
        this.feedId = notification.getFeedId() != null ? notification.getFeedId() : notification.getPostId();
        
        // UI Enhancement Fields
        this.actorUsername = notification.getActorUsername();
        this.actorFullName = notification.getActorFullName();
        this.actorProfileImageUrl = notification.getActorProfileImageUrl();
        this.feedImageUrl = notification.getFeedImageUrl();
        
        this.updatedAt = notification.getUpdatedAt();
        
        // Calculate time ago in hours
        if (notification.getCreatedAt() != null) {
            long hours = java.time.Duration.between(
                notification.getCreatedAt(), 
                LocalDateTime.now()
            ).toHours();
            this.timeAgoHours = Math.max(0, hours);
        } else {
            this.timeAgoHours = 0;
        }
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getRecipientUserId() {
        return recipientUserId;
    }
    
    public void setRecipientUserId(String recipientUserId) {
        this.recipientUserId = recipientUserId;
    }
    
    public String getActorUserId() {
        return actorUserId;
    }
    
    public void setActorUserId(String actorUserId) {
        this.actorUserId = actorUserId;
    }
    
    public String getActorUsername() {
        return actorUsername;
    }
    
    public void setActorUsername(String actorUsername) {
        this.actorUsername = actorUsername;
    }
    
    public String getActorFullName() {
        return actorFullName;
    }
    
    public void setActorFullName(String actorFullName) {
        this.actorFullName = actorFullName;
    }
    
    public String getActorProfileImageUrl() {
        return actorProfileImageUrl;
    }
    
    public void setActorProfileImageUrl(String actorProfileImageUrl) {
        this.actorProfileImageUrl = actorProfileImageUrl;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getFeedId() {
        return feedId;
    }
    
    public void setFeedId(String feedId) {
        this.feedId = feedId;
    }
    
    public String getFeedImageUrl() {
        return feedImageUrl;
    }
    
    public void setFeedImageUrl(String feedImageUrl) {
        this.feedImageUrl = feedImageUrl;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        isRead = read;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public long getTimeAgoHours() {
        return timeAgoHours;
    }
    
    public void setTimeAgoHours(long timeAgoHours) {
        this.timeAgoHours = timeAgoHours;
    }
}
