package com.bharathva.feed.dto;

import com.bharathva.feed.model.Feed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Simple response DTO for feed messages
 */
public class FeedResponse {
    
    private String id;
    private String userId;
    private String message;
    private List<String> imageIds = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public FeedResponse() {}
    
    public FeedResponse(Feed feed) {
        this.id = feed.getId();
        this.userId = feed.getUserId();
        this.message = feed.getMessage();
        this.imageIds = feed.getImageIds();
        this.createdAt = feed.getCreatedAt();
        this.updatedAt = feed.getUpdatedAt();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
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
    
    public List<String> getImageIds() {
        return imageIds;
    }
    
    public void setImageIds(List<String> imageIds) {
        this.imageIds = imageIds;
    }
    
    @Override
    public String toString() {
        return "FeedResponse{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", message='" + message + '\'' +
                ", imageIds=" + imageIds +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}