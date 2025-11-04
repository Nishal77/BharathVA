package com.bharathva.feed.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Notification model for BharathVA
 * Stores notifications for user interactions (likes, comments, follows, etc.)
 * 
 * Schema Structure:
 * - senderId: User who triggered the notification (e.g., who liked the post)
 * - receiverId: User who receives the notification (post owner)
 * - postId: ID of the feed post related to this notification
 * - type: Type of notification (LIKE, COMMENT, FOLLOW, etc.)
 * - message: Human-readable notification message (e.g., "User2 liked your post")
 * - isRead: Whether the notification has been read
 * - createdAt: When the notification was created
 * 
 * Additional UI Enhancement Fields:
 * - actorUsername, actorFullName, actorProfileImageUrl: For quick display without fetching
 * - feedImageUrl: Thumbnail for the post
 */
@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    
    // Primary Schema Fields (matching requested structure)
    @Field("senderId")
    @Indexed
    private String senderId; // User who triggered the notification (who liked/commented)
    
    @Field("receiverId")
    @Indexed
    private String receiverId; // User who receives the notification (post owner)
    
    @Field("postId")
    @Indexed
    private String postId; // ID of the feed post related to this notification
    
    @Field("type")
    @Indexed
    private NotificationType type; // Type of notification (LIKE, COMMENT, FOLLOW, etc.)
    
    @Field("message")
    private String message; // Human-readable notification message (e.g., "User2 liked your post")
    
    @Field("isRead")
    private boolean isRead = false;
    
    @Field("createdAt")
    @Indexed
    private LocalDateTime createdAt;
    
    // Legacy/Compatibility Fields (for backward compatibility)
    @Field("recipientUserId")
    private String recipientUserId; // Alias for receiverId (deprecated, use receiverId)
    
    @Field("actorUserId")
    private String actorUserId; // Alias for senderId (deprecated, use senderId)
    
    @Field("feedId")
    private String feedId; // Alias for postId (deprecated, use postId)
    
    // UI Enhancement Fields (for better user experience)
    @Field("actorUsername")
    private String actorUsername; // Username of the sender (for quick display)
    
    @Field("actorFullName")
    private String actorFullName; // Full name of the sender
    
    @Field("actorProfileImageUrl")
    private String actorProfileImageUrl; // Profile image of the sender
    
    @Field("feedImageUrl")
    private String feedImageUrl; // First image URL from the feed (for thumbnail)
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
    
    public enum NotificationType {
        LIKE,
        COMMENT,
        REPLY,
        FOLLOW,
        MENTION
    }
    
    // Constructors
    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Primary constructor using new schema fields
     * @param senderId User who triggered the notification
     * @param receiverId User who receives the notification
     * @param postId ID of the feed post
     * @param type Type of notification
     */
    public Notification(String senderId, String receiverId, String postId, NotificationType type) {
        this();
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.postId = postId;
        this.type = type;
        
        // Set legacy fields for backward compatibility
        this.actorUserId = senderId;
        this.recipientUserId = receiverId;
        this.feedId = postId;
    }
    
    /**
     * Legacy constructor for backward compatibility
     * @deprecated Use Notification(senderId, receiverId, postId, type) instead
     */
    @Deprecated
    public Notification(String recipientUserId, String actorUserId, NotificationType type, String feedId) {
        this();
        // Map legacy fields to new schema
        this.receiverId = recipientUserId;
        this.senderId = actorUserId;
        this.postId = feedId;
        this.type = type;
        
        // Keep legacy fields for backward compatibility
        this.recipientUserId = recipientUserId;
        this.actorUserId = actorUserId;
        this.feedId = feedId;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    // Primary Schema Getters/Setters
    public String getSenderId() {
        return senderId != null ? senderId : actorUserId; // Fallback to legacy field
    }
    
    public void setSenderId(String senderId) {
        this.senderId = senderId;
        // Keep legacy field in sync
        this.actorUserId = senderId;
    }
    
    public String getReceiverId() {
        return receiverId != null ? receiverId : recipientUserId; // Fallback to legacy field
    }
    
    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
        // Keep legacy field in sync
        this.recipientUserId = receiverId;
    }
    
    public String getPostId() {
        return postId != null ? postId : feedId; // Fallback to legacy field
    }
    
    public void setPostId(String postId) {
        this.postId = postId;
        // Keep legacy field in sync
        this.feedId = postId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    // Legacy Getters/Setters (for backward compatibility)
    @Deprecated
    public String getRecipientUserId() {
        return recipientUserId != null ? recipientUserId : receiverId; // Fallback to new field
    }
    
    @Deprecated
    public void setRecipientUserId(String recipientUserId) {
        this.recipientUserId = recipientUserId;
        // Keep new field in sync
        this.receiverId = recipientUserId;
    }
    
    @Deprecated
    public String getActorUserId() {
        return actorUserId != null ? actorUserId : senderId; // Fallback to new field
    }
    
    @Deprecated
    public void setActorUserId(String actorUserId) {
        this.actorUserId = actorUserId;
        // Keep new field in sync
        this.senderId = actorUserId;
    }
    
    @Deprecated
    public String getFeedId() {
        return feedId != null ? feedId : postId; // Fallback to new field
    }
    
    @Deprecated
    public void setFeedId(String feedId) {
        this.feedId = feedId;
        // Keep new field in sync
        this.postId = feedId;
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
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
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
    
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Notification{" +
                "id='" + id + '\'' +
                ", recipientUserId='" + recipientUserId + '\'' +
                ", actorUserId='" + actorUserId + '\'' +
                ", type=" + type +
                ", feedId='" + feedId + '\'' +
                ", isRead=" + isRead +
                ", createdAt=" + createdAt +
                '}';
    }
}
