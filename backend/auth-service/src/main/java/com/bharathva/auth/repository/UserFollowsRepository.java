package com.bharathva.auth.repository;

import com.bharathva.auth.entity.UserFollows;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserFollowsRepository extends JpaRepository<UserFollows, UUID> {
    
    Optional<UserFollows> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    
    @Query("SELECT COUNT(uf) FROM UserFollows uf WHERE uf.followingId = :userId")
    Long countByFollowingId(@Param("userId") UUID userId);
    
    @Query("SELECT COUNT(uf) FROM UserFollows uf WHERE uf.followerId = :userId")
    Long countByFollowerId(@Param("userId") UUID userId);
    
    @Query("SELECT uf.followingId FROM UserFollows uf WHERE uf.followerId = :userId")
    List<UUID> findFollowingIdsByFollowerId(@Param("userId") UUID userId);
    
    @Query("SELECT uf.followerId FROM UserFollows uf WHERE uf.followingId = :userId")
    List<UUID> findFollowerIdsByFollowingId(@Param("userId") UUID userId);
    
    @Query("SELECT uf FROM UserFollows uf WHERE uf.followerId = :userId")
    List<UserFollows> findAllByFollowerId(@Param("userId") UUID userId);
    
    @Query("SELECT uf FROM UserFollows uf WHERE uf.followingId = :userId")
    List<UserFollows> findAllByFollowingId(@Param("userId") UUID userId);
}


