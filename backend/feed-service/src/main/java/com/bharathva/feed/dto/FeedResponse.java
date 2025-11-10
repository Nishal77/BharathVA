package com.bharathva.feed.dto;

import com.bharathva.feed.model.Feed;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Simple response DTO for feed messages
 */
public class FeedResponse {
    
    private String id;
    private String userId;
    private String message;
    private List<String> imageUrls = new ArrayList<>();
    
    @JsonProperty("likes")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private List<String> likes = new ArrayList<>();
    
    @JsonProperty("comments")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private List<CommentResponse> comments = new ArrayList<>();
    
    @JsonProperty("likesCount")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private int likesCount;
    
    @JsonProperty("commentsCount")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private int commentsCount;
    
    @JsonProperty("userLiked")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private boolean userLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public FeedResponse() {}
    
    public FeedResponse(Feed feed) {
        this.id = feed.getId();
        this.userId = feed.getUserId();
        this.message = feed.getMessage();
        this.imageUrls = feed.getImageUrls();
        this.likes = feed.getLikes() != null ? new ArrayList<>(feed.getLikes()) : new ArrayList<>();
        this.likesCount = feed.getLikesCount();
        this.comments = feed.getComments() != null 
            ? feed.getComments().stream().map(CommentResponse::new).collect(Collectors.toList())
            : new ArrayList<>();
        this.commentsCount = feed.getCommentsCount();
        this.userLiked = false; // Will be set separately if user context is available
        this.createdAt = feed.getCreatedAt();
        this.updatedAt = feed.getUpdatedAt();
    }
    
    public FeedResponse(Feed feed, String currentUserId) {
        this.id = feed.getId();
        this.userId = feed.getUserId();
        this.message = feed.getMessage();
        this.imageUrls = feed.getImageUrls();
        this.likes = feed.getLikes() != null ? new ArrayList<>(feed.getLikes()) : new ArrayList<>();
        this.likesCount = feed.getLikesCount();
        this.comments = feed.getComments() != null 
            ? feed.getComments().stream().map(CommentResponse::new).collect(Collectors.toList())
            : new ArrayList<>();
        this.commentsCount = feed.getCommentsCount();
        this.userLiked = currentUserId != null && feed.hasLiked(currentUserId);
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
    
    public List<String> getImageUrls() {
        return imageUrls;
    }
    
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    
    public int getLikesCount() {
        return likesCount;
    }
    
    public void setLikesCount(int likesCount) {
        this.likesCount = likesCount;
    }
    
    public boolean isUserLiked() {
        return userLiked;
    }
    
    public void setUserLiked(boolean userLiked) {
        this.userLiked = userLiked;
    }
    
    public List<String> getLikes() {
        return likes;
    }
    
    public void setLikes(List<String> likes) {
        this.likes = likes != null ? new ArrayList<>(likes) : new ArrayList<>();
    }
    
    public List<CommentResponse> getComments() {
        return comments;
    }
    
    public void setComments(List<CommentResponse> comments) {
        this.comments = comments != null ? comments : new ArrayList<>();
    }
    
    public int getCommentsCount() {
        return commentsCount;
    }
    
    public void setCommentsCount(int commentsCount) {
        this.commentsCount = commentsCount;
    }
    
    @Override
    public String toString() {
        return "FeedResponse{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", message='" + message + '\'' +
                ", imageUrls=" + imageUrls +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}