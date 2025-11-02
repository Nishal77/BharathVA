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
    
    @Field("imageUrls")
    private List<String> imageUrls = new ArrayList<>();
    
    @Field("likes")
    private List<String> likes = new ArrayList<>();
    
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
    
    public List<String> getImageUrls() {
        return imageUrls;
    }
    
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
    }
    
    public void addImageUrl(String imageUrl) {
        if (this.imageUrls == null) {
            this.imageUrls = new ArrayList<>();
        }
        this.imageUrls.add(imageUrl);
    }
    
    public boolean hasImages() {
        return imageUrls != null && !imageUrls.isEmpty();
    }
    
    public List<String> getLikes() {
        return likes != null ? likes : new ArrayList<>();
    }
    
    public void setLikes(List<String> likes) {
        this.likes = likes != null ? likes : new ArrayList<>();
    }
    
    public void addLike(String userId) {
        if (this.likes == null) {
            this.likes = new ArrayList<>();
        }
        if (!this.likes.contains(userId)) {
            this.likes.add(userId);
        }
    }
    
    public void removeLike(String userId) {
        if (this.likes != null) {
            this.likes.remove(userId);
        }
    }
    
    public boolean hasLiked(String userId) {
        return this.likes != null && this.likes.contains(userId);
    }
    
    public int getLikesCount() {
        return this.likes != null ? this.likes.size() : 0;
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
                ", imageUrls=" + imageUrls +
                ", likes=" + likes +
                ", likesCount=" + getLikesCount() +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}