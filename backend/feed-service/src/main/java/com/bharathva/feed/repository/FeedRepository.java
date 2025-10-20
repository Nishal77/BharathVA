package com.bharathva.feed.repository;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.FeedType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeedRepository extends MongoRepository<Feed, String> {
    
    // Find feeds by user ID (excluding deleted)
    @Query("{ 'userId': ?0, 'isDeleted': { $ne: true } }")
    Page<Feed> findByUserIdAndIsDeletedNot(String userId, Pageable pageable);
    
    // Find feeds by user ID with feed type filter
    @Query("{ 'userId': ?0, 'feedType': ?1, 'isDeleted': { $ne: true } }")
    Page<Feed> findByUserIdAndFeedTypeAndIsDeletedNot(String userId, FeedType feedType, Pageable pageable);
    
    // Find all public feeds (excluding deleted)
    @Query("{ 'isDeleted': { $ne: true } }")
    Page<Feed> findAllPublicFeeds(Pageable pageable);
    
    // Find feeds by thread ID
    @Query("{ 'threadId': ?0, 'isDeleted': { $ne: true } }")
    List<Feed> findByThreadIdAndIsDeletedNot(String threadId);
    
    // Find replies to a specific feed
    @Query("{ 'parentFeedId': ?0, 'isDeleted': { $ne: true } }")
    Page<Feed> findByParentFeedIdAndIsDeletedNot(String parentFeedId, Pageable pageable);
    
    // Find feeds by multiple user IDs (for following feed)
    @Query("{ 'userId': { $in: ?0 }, 'isDeleted': { $ne: true } }")
    Page<Feed> findByUserIdInAndIsDeletedNot(List<String> userIds, Pageable pageable);
    
    // Find feeds by content search
    @Query("{ 'content': { $regex: ?0, $options: 'i' }, 'isDeleted': { $ne: true } }")
    Page<Feed> findByContentContainingIgnoreCaseAndIsDeletedNot(String content, Pageable pageable);
    
    // Find feeds by username
    @Query("{ 'username': ?0, 'isDeleted': { $ne: true } }")
    Page<Feed> findByUsernameAndIsDeletedNot(String username, Pageable pageable);
    
    // Find feeds created after a specific time
    @Query("{ 'createdAt': { $gte: ?0 }, 'isDeleted': { $ne: true } }")
    Page<Feed> findByCreatedAtAfterAndIsDeletedNot(LocalDateTime after, Pageable pageable);
    
    // Find feeds created between two dates
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, 'isDeleted': { $ne: true } }")
    Page<Feed> findByCreatedAtBetweenAndIsDeletedNot(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    // Find most liked feeds
    @Query("{ 'isDeleted': { $ne: true } }")
    Page<Feed> findTopFeedsByLikesCount(Pageable pageable);
    
    // Find most retweeted feeds
    @Query("{ 'isDeleted': { $ne: true } }")
    Page<Feed> findTopFeedsByRetweetsCount(Pageable pageable);
    
    // Find feeds with media
    @Query("{ 'media': { $exists: true, $ne: null }, 'isDeleted': { $ne: true } }")
    Page<Feed> findFeedsWithMedia(Pageable pageable);
    
    // Count feeds by user
    @Query(value = "{ 'userId': ?0, 'isDeleted': { $ne: true } }", count = true)
    long countByUserIdAndIsDeletedNot(String userId);
    
    // Count replies to a feed
    @Query(value = "{ 'parentFeedId': ?0, 'isDeleted': { $ne: true } }", count = true)
    long countByParentFeedIdAndIsDeletedNot(String parentFeedId);
    
    // Find feed by ID (excluding deleted)
    @Query("{ '_id': ?0, 'isDeleted': { $ne: true } }")
    Optional<Feed> findByIdAndIsDeletedNot(String id);
    
    // Find feeds by user ID for profile
    @Query("{ 'userId': ?0, 'isDeleted': { $ne: true } }")
    List<Feed> findByUserIdAndIsDeletedNotOrderByCreatedAtDesc(String userId);
    
    // Find recent feeds for home timeline
    @Query("{ 'isDeleted': { $ne: true } }")
    Page<Feed> findRecentFeeds(Pageable pageable);
    
    // Find feeds by hashtag (content contains #)
    @Query("{ 'content': { $regex: ?0, $options: 'i' }, 'isDeleted': { $ne: true } }")
    Page<Feed> findByHashtag(String hashtag, Pageable pageable);
    
    // Find feeds by mention (content contains @)
    @Query("{ 'content': { $regex: ?0, $options: 'i' }, 'isDeleted': { $ne: true } }")
    Page<Feed> findByMention(String mention, Pageable pageable);
}
