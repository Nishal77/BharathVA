package com.bharathva.feed.dto;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.FeedType;
import com.bharathva.feed.model.MediaContent;

import java.time.LocalDateTime;
import java.util.List;

public class FeedResponse {
    
    private String id;
    private String userId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private Boolean verified;
    private String content;
    private List<String> emojis;
    private MediaContent media;
    private String threadId;
    private String parentFeedId;
    private Integer repliesCount;
    private Integer retweetsCount;
    private Integer likesCount;
    private Integer bookmarksCount;
    private Integer viewsCount;
    private Boolean isLiked;
    private Boolean isRetweeted;
    private Boolean isBookmarked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private FeedType feedType;
    private String timeAgo;
    
    // Constructors
    public FeedResponse() {}
    
    public FeedResponse(Feed feed) {
        this.id = feed.getId();
        this.userId = feed.getUserId();
        this.username = feed.getUsername();
        this.fullName = feed.getFullName();
        this.avatarUrl = feed.getAvatarUrl();
        this.verified = feed.getVerified();
        this.content = feed.getContent();
        this.emojis = feed.getEmojis();
        this.media = feed.getMedia();
        this.threadId = feed.getThreadId();
        this.parentFeedId = feed.getParentFeedId();
        this.repliesCount = feed.getRepliesCount();
        this.retweetsCount = feed.getRetweetsCount();
        this.likesCount = feed.getLikesCount();
        this.bookmarksCount = feed.getBookmarksCount();
        this.viewsCount = feed.getViewsCount();
        this.isLiked = feed.getIsLiked();
        this.isRetweeted = feed.getIsRetweeted();
        this.isBookmarked = feed.getIsBookmarked();
        this.createdAt = feed.getCreatedAt();
        this.updatedAt = feed.getUpdatedAt();
        this.feedType = feed.getFeedType();
        this.timeAgo = calculateTimeAgo(feed.getCreatedAt());
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
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public Boolean getVerified() {
        return verified;
    }
    
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public List<String> getEmojis() {
        return emojis;
    }
    
    public void setEmojis(List<String> emojis) {
        this.emojis = emojis;
    }
    
    public MediaContent getMedia() {
        return media;
    }
    
    public void setMedia(MediaContent media) {
        this.media = media;
    }
    
    public String getThreadId() {
        return threadId;
    }
    
    public void setThreadId(String threadId) {
        this.threadId = threadId;
    }
    
    public String getParentFeedId() {
        return parentFeedId;
    }
    
    public void setParentFeedId(String parentFeedId) {
        this.parentFeedId = parentFeedId;
    }
    
    public Integer getRepliesCount() {
        return repliesCount;
    }
    
    public void setRepliesCount(Integer repliesCount) {
        this.repliesCount = repliesCount;
    }
    
    public Integer getRetweetsCount() {
        return retweetsCount;
    }
    
    public void setRetweetsCount(Integer retweetsCount) {
        this.retweetsCount = retweetsCount;
    }
    
    public Integer getLikesCount() {
        return likesCount;
    }
    
    public void setLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }
    
    public Integer getBookmarksCount() {
        return bookmarksCount;
    }
    
    public void setBookmarksCount(Integer bookmarksCount) {
        this.bookmarksCount = bookmarksCount;
    }
    
    public Integer getViewsCount() {
        return viewsCount;
    }
    
    public void setViewsCount(Integer viewsCount) {
        this.viewsCount = viewsCount;
    }
    
    public Boolean getIsLiked() {
        return isLiked;
    }
    
    public void setIsLiked(Boolean isLiked) {
        this.isLiked = isLiked;
    }
    
    public Boolean getIsRetweeted() {
        return isRetweeted;
    }
    
    public void setIsRetweeted(Boolean isRetweeted) {
        this.isRetweeted = isRetweeted;
    }
    
    public Boolean getIsBookmarked() {
        return isBookmarked;
    }
    
    public void setIsBookmarked(Boolean isBookmarked) {
        this.isBookmarked = isBookmarked;
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
    
    public FeedType getFeedType() {
        return feedType;
    }
    
    public void setFeedType(FeedType feedType) {
        this.feedType = feedType;
    }
    
    public String getTimeAgo() {
        return timeAgo;
    }
    
    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }
    
    // Utility method to calculate time ago
    private String calculateTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "Unknown";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(createdAt, now).toMinutes();
        
        if (minutes < 1) {
            return "now";
        } else if (minutes < 60) {
            return minutes + "m";
        } else if (minutes < 1440) { // 24 hours
            return (minutes / 60) + "h";
        } else if (minutes < 10080) { // 7 days
            return (minutes / 1440) + "d";
        } else {
            return (minutes / 10080) + "w";
        }
    }
}
