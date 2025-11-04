package com.bharathva.feed.dto;

import com.bharathva.feed.model.Comment;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

/**
 * Response DTO for comments
 */
public class CommentResponse {
    
    private String userId;
    private String text;
    private LocalDateTime createdAt;
    
    // Constructors
    public CommentResponse() {}
    
    public CommentResponse(Comment comment) {
        this.userId = comment.getUserId();
        this.text = comment.getText();
        this.createdAt = comment.getCreatedAt();
    }
    
    // Getters and Setters
    @JsonProperty("userId")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    @JsonProperty("text")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    @JsonProperty("createdAt")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "CommentResponse{" +
                "userId='" + userId + '\'' +
                ", text='" + text + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}

