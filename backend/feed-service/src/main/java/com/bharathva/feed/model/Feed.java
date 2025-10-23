package com.bharathva.feed.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Feed model for BharathVA
 * Stores user_id, id (MongoDB UUID), message, and associated images
 */
@Document(collection = "feeds")
public class Feed {
    
    @Id
    private String id; // MongoDB will auto-generate UUID
    
    @Field("userId")
    @Indexed
    private String userId;
    
    @Field("message")
    private String message;
    
    @Field("imageIds")
    private List<String> imageIds = new ArrayList<>();
    
    @Field("createdAt")
    @Indexed
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Feed() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Feed(String userId, String message) {
        this();
        this.userId = userId;
        this.message = message;
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
    
    public List<String> getImageIds() {
        return imageIds;
    }
    
    public void setImageIds(List<String> imageIds) {
        this.imageIds = imageIds != null ? imageIds : new ArrayList<>();
    }
    
    public void addImageId(String imageId) {
        if (this.imageIds == null) {
            this.imageIds = new ArrayList<>();
        }
        this.imageIds.add(imageId);
    }
    
    public boolean hasImages() {
        return imageIds != null && !imageIds.isEmpty();
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
    
    // Utility methods
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Feed{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", message='" + message + '\'' +
                ", imageIds=" + imageIds +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}