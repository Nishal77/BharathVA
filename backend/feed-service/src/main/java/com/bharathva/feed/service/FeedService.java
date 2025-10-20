package com.bharathva.feed.service;

import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.FeedType;
import com.bharathva.feed.model.MediaContent;
import com.bharathva.feed.model.UserInfo;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.shared.exception.BusinessException;
import com.bharathva.shared.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeedService {
    
    private static final Logger log = LoggerFactory.getLogger(FeedService.class);
    
    @Autowired
    private FeedRepository feedRepository;
    
    @Autowired
    private UserClient userClient;
    
    // Create a new feed
    @CacheEvict(value = "feedCache", allEntries = true)
    public FeedResponse createFeed(String userId, CreateFeedRequest request) {
        log.info("Creating new feed for user: {}", userId);
        
        // Validate user exists
        UserInfo userInfo = userClient.getUserInfo(userId);
        if (userInfo == null) {
            throw new BusinessException("User not found");
        }
        
        // Create feed entity
        Feed feed = new Feed();
        feed.setUserId(userId);
        feed.setUsername(userInfo.getUsername());
        feed.setFullName(userInfo.getFullName());
        feed.setAvatarUrl(userInfo.getAvatarUrl());
        feed.setVerified(userInfo.getVerified());
        feed.setContent(request.getContent());
        feed.setEmojis(request.getEmojis());
        
        // Handle media content
        if (request.getMedia() != null) {
            MediaContent mediaContent = new MediaContent();
            mediaContent.setType(request.getMedia().getType());
            mediaContent.setItems(request.getMedia().getItems().stream()
                    .map(item -> {
                        com.bharathva.feed.model.MediaItem mediaItem = new com.bharathva.feed.model.MediaItem();
                        mediaItem.setId(item.getId());
                        mediaItem.setType(item.getType());
                        mediaItem.setUrl(item.getUrl());
                        mediaItem.setThumbnailUrl(item.getThumbnailUrl());
                        mediaItem.setAltText(item.getAltText());
                        mediaItem.setWidth(item.getWidth());
                        mediaItem.setHeight(item.getHeight());
                        mediaItem.setFileSize(item.getFileSize());
                        return mediaItem;
                    })
                    .collect(Collectors.toList()));
            feed.setMedia(mediaContent);
        }
        
        // Handle thread and parent feed
        if (request.getThreadId() != null) {
            feed.setThreadId(request.getThreadId());
        }
        
        if (request.getParentFeedId() != null) {
            feed.setParentFeedId(request.getParentFeedId());
            feed.setFeedType(FeedType.REPLY);
            
            // Increment reply count on parent feed
            Optional<Feed> parentFeed = feedRepository.findById(request.getParentFeedId());
            if (parentFeed.isPresent()) {
                parentFeed.get().incrementReplies();
                feedRepository.save(parentFeed.get());
            }
        }
        
        // Save feed
        Feed savedFeed = feedRepository.save(feed);
        log.info("Successfully created feed with ID: {}", savedFeed.getId());
        
        return new FeedResponse(savedFeed);
    }
    
    // Get feed by ID
    @Cacheable(value = "feedCache", key = "#feedId")
    public FeedResponse getFeedById(String feedId) {
        log.debug("Fetching feed by ID: {}", feedId);
        
        Optional<Feed> feed = feedRepository.findByIdAndIsDeletedNot(feedId);
        if (feed.isEmpty()) {
            throw new ResourceNotFoundException("Feed not found");
        }
        
        // Increment view count
        feed.get().incrementViews();
        feedRepository.save(feed.get());
        
        return new FeedResponse(feed.get());
    }
    
    // Get user's feeds
    @Cacheable(value = "feedCache", key = "#userId + '_' + #page + '_' + #size")
    public Page<FeedResponse> getUserFeeds(String userId, int page, int size) {
        log.debug("Fetching feeds for user: {}, page: {}, size: {}", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findByUserIdAndIsDeletedNot(userId, pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Get public feeds (home timeline)
    @Cacheable(value = "feedCache", key = "'public_' + #page + '_' + #size")
    public Page<FeedResponse> getPublicFeeds(int page, int size) {
        log.debug("Fetching public feeds, page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findAllPublicFeeds(pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Get following feeds
    @Cacheable(value = "feedCache", key = "#userId + '_following_' + #page + '_' + #size")
    public Page<FeedResponse> getFollowingFeeds(String userId, List<String> followingUserIds, int page, int size) {
        log.debug("Fetching following feeds for user: {}, page: {}, size: {}", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findByUserIdInAndIsDeletedNot(followingUserIds, pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Get replies to a feed
    @Cacheable(value = "feedCache", key = "#feedId + '_replies_' + #page + '_' + #size")
    public Page<FeedResponse> getFeedReplies(String feedId, int page, int size) {
        log.debug("Fetching replies for feed: {}, page: {}, size: {}", feedId, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<Feed> feeds = feedRepository.findByParentFeedIdAndIsDeletedNot(feedId, pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Like/Unlike a feed
    @CacheEvict(value = "feedCache", allEntries = true)
    public FeedResponse toggleLike(String feedId, String userId) {
        log.info("Toggling like for feed: {} by user: {}", feedId, userId);
        
        Optional<Feed> feedOpt = feedRepository.findByIdAndIsDeletedNot(feedId);
        if (feedOpt.isEmpty()) {
            throw new ResourceNotFoundException("Feed not found");
        }
        
        Feed feed = feedOpt.get();
        
        // Toggle like status
        if (Boolean.TRUE.equals(feed.getIsLiked())) {
            feed.setIsLiked(false);
            feed.decrementLikes();
        } else {
            feed.setIsLiked(true);
            feed.incrementLikes();
        }
        
        Feed savedFeed = feedRepository.save(feed);
        log.info("Successfully toggled like for feed: {}", feedId);
        
        return new FeedResponse(savedFeed);
    }
    
    // Retweet/Unretweet a feed
    @CacheEvict(value = "feedCache", allEntries = true)
    public FeedResponse toggleRetweet(String feedId, String userId) {
        log.info("Toggling retweet for feed: {} by user: {}", feedId, userId);
        
        Optional<Feed> feedOpt = feedRepository.findByIdAndIsDeletedNot(feedId);
        if (feedOpt.isEmpty()) {
            throw new ResourceNotFoundException("Feed not found");
        }
        
        Feed feed = feedOpt.get();
        
        // Toggle retweet status
        if (Boolean.TRUE.equals(feed.getIsRetweeted())) {
            feed.setIsRetweeted(false);
            feed.decrementRetweets();
        } else {
            feed.setIsRetweeted(true);
            feed.incrementRetweets();
        }
        
        Feed savedFeed = feedRepository.save(feed);
        log.info("Successfully toggled retweet for feed: {}", feedId);
        
        return new FeedResponse(savedFeed);
    }
    
    // Bookmark/Unbookmark a feed
    @CacheEvict(value = "feedCache", allEntries = true)
    public FeedResponse toggleBookmark(String feedId, String userId) {
        log.info("Toggling bookmark for feed: {} by user: {}", feedId, userId);
        
        Optional<Feed> feedOpt = feedRepository.findByIdAndIsDeletedNot(feedId);
        if (feedOpt.isEmpty()) {
            throw new ResourceNotFoundException("Feed not found");
        }
        
        Feed feed = feedOpt.get();
        
        // Toggle bookmark status
        if (Boolean.TRUE.equals(feed.getIsBookmarked())) {
            feed.setIsBookmarked(false);
            feed.decrementBookmarks();
        } else {
            feed.setIsBookmarked(true);
            feed.incrementBookmarks();
        }
        
        Feed savedFeed = feedRepository.save(feed);
        log.info("Successfully toggled bookmark for feed: {}", feedId);
        
        return new FeedResponse(savedFeed);
    }
    
    // Delete a feed (soft delete)
    @CacheEvict(value = "feedCache", allEntries = true)
    public void deleteFeed(String feedId, String userId) {
        log.info("Deleting feed: {} by user: {}", feedId, userId);
        
        Optional<Feed> feedOpt = feedRepository.findByIdAndIsDeletedNot(feedId);
        if (feedOpt.isEmpty()) {
            throw new ResourceNotFoundException("Feed not found");
        }
        
        Feed feed = feedOpt.get();
        
        // Check if user owns the feed
        if (!feed.getUserId().equals(userId)) {
            throw new BusinessException("You can only delete your own feeds");
        }
        
        // Soft delete
        feed.setIsDeleted(true);
        feed.setUpdatedAt(LocalDateTime.now());
        feedRepository.save(feed);
        
        log.info("Successfully deleted feed: {}", feedId);
    }
    
    // Search feeds
    @Cacheable(value = "feedCache", key = "#query + '_' + #page + '_' + #size")
    public Page<FeedResponse> searchFeeds(String query, int page, int size) {
        log.debug("Searching feeds with query: {}, page: {}, size: {}", query, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedRepository.findByContentContainingIgnoreCaseAndIsDeletedNot(query, pageable);
        
        return feeds.map(FeedResponse::new);
    }
    
    // Get trending feeds
    @Cacheable(value = "feedCache", key = "'trending_' + #page + '_' + #size")
    public Page<FeedResponse> getTrendingFeeds(int page, int size) {
        log.debug("Fetching trending feeds, page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "likesCount", "retweetsCount"));
        Page<Feed> feeds = feedRepository.findTopFeedsByLikesCount(pageable);
        
        return feeds.map(FeedResponse::new);
    }
}
