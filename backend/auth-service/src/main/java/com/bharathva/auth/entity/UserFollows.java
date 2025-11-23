package com.bharathva.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_follows", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "following_id"}),
       indexes = {
           @Index(name = "idx_user_follows_follower_id", columnList = "follower_id"),
           @Index(name = "idx_user_follows_following_id", columnList = "following_id"),
           @Index(name = "idx_user_follows_created_at", columnList = "created_at"),
           @Index(name = "idx_user_follows_pair", columnList = "follower_id, following_id")
       })
public class UserFollows {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_follows_follower"))
    private User follower;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_follows_following"))
    private User following;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "follower_id", insertable = false, updatable = false)
    private UUID followerId;
    
    @Column(name = "following_id", insertable = false, updatable = false)
    private UUID followingId;
    
    public UserFollows() {}
    
    public UserFollows(User follower, User following) {
        this.follower = follower;
        this.following = following;
        if (follower != null) {
            this.followerId = follower.getId();
        }
        if (following != null) {
            this.followingId = following.getId();
        }
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getFollower() {
        return follower;
    }
    
    public void setFollower(User follower) {
        this.follower = follower;
        if (follower != null) {
            this.followerId = follower.getId();
        }
    }
    
    public User getFollowing() {
        return following;
    }
    
    public void setFollowing(User following) {
        this.following = following;
        if (following != null) {
            this.followingId = following.getId();
        }
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public UUID getFollowerId() {
        return followerId != null ? followerId : (follower != null ? follower.getId() : null);
    }
    
    public UUID getFollowingId() {
        return followingId != null ? followingId : (following != null ? following.getId() : null);
    }
}


