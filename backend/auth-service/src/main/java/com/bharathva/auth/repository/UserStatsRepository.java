package com.bharathva.auth.repository;

import com.bharathva.auth.entity.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, UUID> {
    
    Optional<UserStats> findByUserId(UUID userId);
    
    @Modifying
    @Query("UPDATE UserStats us SET us.followersCount = " +
           "(SELECT COUNT(uf) FROM UserFollows uf WHERE uf.followingId = :userId), " +
           "us.lastUpdatedAt = CURRENT_TIMESTAMP " +
           "WHERE us.userId = :userId")
    void updateFollowersCount(@Param("userId") UUID userId);
    
    @Modifying
    @Query("UPDATE UserStats us SET us.followingCount = " +
           "(SELECT COUNT(uf) FROM UserFollows uf WHERE uf.followerId = :userId), " +
           "us.lastUpdatedAt = CURRENT_TIMESTAMP " +
           "WHERE us.userId = :userId")
    void updateFollowingCount(@Param("userId") UUID userId);
    
    @Modifying
    @Query("UPDATE UserStats us SET us.postsCount = :count, " +
           "us.lastUpdatedAt = CURRENT_TIMESTAMP " +
           "WHERE us.userId = :userId")
    void updatePostsCount(@Param("userId") UUID userId, @Param("count") Integer count);
    
    @Modifying
    @Query("UPDATE UserStats us SET us.postsCount = us.postsCount + :increment, " +
           "us.lastUpdatedAt = CURRENT_TIMESTAMP " +
           "WHERE us.userId = :userId")
    void incrementPostsCount(@Param("userId") UUID userId, @Param("increment") Integer increment);
    
    @Modifying
    @Query("UPDATE UserStats us SET us.postsCount = GREATEST(0, us.postsCount - :decrement), " +
           "us.lastUpdatedAt = CURRENT_TIMESTAMP " +
           "WHERE us.userId = :userId")
    void decrementPostsCount(@Param("userId") UUID userId, @Param("decrement") Integer decrement);
}

