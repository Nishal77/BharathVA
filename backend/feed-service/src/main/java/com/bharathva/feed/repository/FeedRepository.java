package com.bharathva.feed.repository;

import com.bharathva.feed.model.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Simple repository for feed messages
 */
@Repository
public interface FeedRepository extends MongoRepository<Feed, String> {
    
    // Find feeds by user ID
    @Query("{ 'userId': ?0 }")
    Page<Feed> findByUserId(String userId, Pageable pageable);
    
    // Find all feeds (global feed)
    Page<Feed> findAll(Pageable pageable);
    
    // Find feeds by user ID ordered by creation date
    @Query("{ 'userId': ?0 }")
    List<Feed> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find all feeds ordered by creation date (for global feed)
    List<Feed> findAllByOrderByCreatedAtDesc();
    
    // Count feeds by user
    long countByUserId(String userId);
    
    // Find feeds by message content (search)
    @Query("{ 'message': { $regex: ?0, $options: 'i' } }")
    Page<Feed> findByMessageContainingIgnoreCase(String message, Pageable pageable);
}