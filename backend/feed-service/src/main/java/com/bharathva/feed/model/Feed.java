package com.bharathva.feed.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Document(collection = "feeds")
public class Feed {
    
    @Id
    private String id;
    
    @Field("user_id")
    @Indexed
    private String userId;
    
    @Field("username")
    @Indexed
    private String username;
    
    @Field("full_name")
    private String fullName;
    
    @Field("avatar_url")
    private String avatarUrl;
    
    @Field("verified")
    private Boolean verified = false;
    
    @Field("content")
    private String content;
    
    @Field("emojis")
    private List<String> emojis;
    
    @Field("media")
    private MediaContent media;
    
    @Field("thread_id")
    @Indexed
    private String threadId;
    
    @Field("parent_feed_id")
    @Indexed
    private String parentFeedId;
    
    @Field("replies_count")
    private Integer repliesCount = 0;
    
    @Field("retweets_count")
    private Integer retweetsCount = 0;
    
    @Field("likes_count")
    private Integer likesCount = 0;
    
    @Field("bookmarks_count")
    private Integer bookmarksCount = 0;
    
    @Field("views_count")
    private Integer viewsCount = 0;
    
    @Field("is_liked")
    private Boolean isLiked = false;
    
    @Field("is_retweeted")
    private Boolean isRetweeted = false;
    
    @Field("is_bookmarked")
    private Boolean isBookmarked = false;
    
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("is_deleted")
    private Boolean isDeleted = false;
    
    @Field("feed_type")
    @Indexed
    private FeedType feedType = FeedType.ORIGINAL;
    
    // Constructors
    public Feed() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Feed(String userId, String username, String fullName, String content) {
        this();
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.content = content;
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
    
    public Boolean getIsDeleted() {
        return isDeleted;
    }
    
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
    
    public FeedType getFeedType() {
        return feedType;
    }
    
    public void setFeedType(FeedType feedType) {
        this.feedType = feedType;
    }
    
    // Utility methods
    public void incrementViews() {
        this.viewsCount = (this.viewsCount == null) ? 1 : this.viewsCount + 1;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementLikes() {
        this.likesCount = (this.likesCount == null) ? 1 : this.likesCount + 1;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void decrementLikes() {
        this.likesCount = Math.max(0, (this.likesCount == null) ? 0 : this.likesCount - 1);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementRetweets() {
        this.retweetsCount = (this.retweetsCount == null) ? 1 : this.retweetsCount + 1;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void decrementRetweets() {
        this.retweetsCount = Math.max(0, (this.retweetsCount == null) ? 0 : this.retweetsCount - 1);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementReplies() {
        this.repliesCount = (this.repliesCount == null) ? 1 : this.repliesCount + 1;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementBookmarks() {
        this.bookmarksCount = (this.bookmarksCount == null) ? 1 : this.bookmarksCount + 1;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void decrementBookmarks() {
        this.bookmarksCount = Math.max(0, (this.bookmarksCount == null) ? 0 : this.bookmarksCount - 1);
        this.updatedAt = LocalDateTime.now();
    }
}
