package com.bharathva.feed.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * DTO for WebSocket feed events
 */
public class FeedEvent {
    
    private String type; // FEED_CREATED, FEED_DELETED, FEED_UPDATED
    private String feedId;
    private String userId;
    private String message;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    // Constructors
    public FeedEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public FeedEvent(String type, String feedId, String userId, String message) {
        this();
        this.type = type;
        this.feedId = feedId;
        this.userId = userId;
        this.message = message;
    }
    
    // Getters and Setters
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
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    @Override
    public String toString() {
        return "FeedEvent{" +
                "type='" + type + '\'' +
                ", feedId='" + feedId + '\'' +
                ", userId='" + userId + '\'' +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
