package com.bharathva.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_stats",
       indexes = {
           @Index(name = "idx_user_stats_last_updated", columnList = "last_updated_at")
       })
public class UserStats {
    
    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_stats_user_id"))
    @MapsId
    private User user;
    
    @Column(name = "followers_count", nullable = false)
    private Integer followersCount = 0;
    
    @Column(name = "following_count", nullable = false)
    private Integer followingCount = 0;
    
    @Column(name = "posts_count", nullable = false)
    private Integer postsCount = 0;
    
    @Column(name = "total_likes_received", nullable = false)
    private Integer totalLikesReceived = 0;
    
    @Column(name = "total_comments_received", nullable = false)
    private Integer totalCommentsReceived = 0;
    
    @UpdateTimestamp
    @Column(name = "last_updated_at", nullable = false)
    private LocalDateTime lastUpdatedAt;
    
    public UserStats() {}
    
    public UserStats(User user) {
        this.user = user;
        this.userId = user != null ? user.getId() : null;
        this.followersCount = 0;
        this.followingCount = 0;
        this.postsCount = 0;
        this.totalLikesReceived = 0;
        this.totalCommentsReceived = 0;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.userId = user.getId();
        }
    }
    
    public Integer getFollowersCount() {
        return followersCount;
    }
    
    public void setFollowersCount(Integer followersCount) {
        this.followersCount = followersCount != null ? followersCount : 0;
    }
    
    public Integer getFollowingCount() {
        return followingCount;
    }
    
    public void setFollowingCount(Integer followingCount) {
        this.followingCount = followingCount != null ? followingCount : 0;
    }
    
    public Integer getPostsCount() {
        return postsCount;
    }
    
    public void setPostsCount(Integer postsCount) {
        this.postsCount = postsCount != null ? postsCount : 0;
    }
    
    public Integer getTotalLikesReceived() {
        return totalLikesReceived;
    }
    
    public void setTotalLikesReceived(Integer totalLikesReceived) {
        this.totalLikesReceived = totalLikesReceived != null ? totalLikesReceived : 0;
    }
    
    public Integer getTotalCommentsReceived() {
        return totalCommentsReceived;
    }
    
    public void setTotalCommentsReceived(Integer totalCommentsReceived) {
        this.totalCommentsReceived = totalCommentsReceived != null ? totalCommentsReceived : 0;
    }
    
    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }
    
    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }
}


