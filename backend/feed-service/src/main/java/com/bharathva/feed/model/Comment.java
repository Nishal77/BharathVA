package com.bharathva.feed.model;

import java.time.LocalDateTime;

/**
 * Comment model for BharathVA Feed
 * Represents a comment on a feed post
 */
public class Comment {
    
    private String userId;
    private String text;
    private LocalDateTime createdAt;
    
    // Constructors
    public Comment() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Comment(String userId, String text) {
        this();
        this.userId = userId;
        this.text = text;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "Comment{" +
                "userId='" + userId + '\'' +
                ", text='" + text + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}

