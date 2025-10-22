package com.bharathva.feed;

import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.model.Feed;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.feed.service.FeedService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class FeedServiceTest {

    @Autowired
    private FeedService feedService;

    @Autowired
    private FeedRepository feedRepository;

    @Test
    public void testCreateFeed() {
        // Clean up any existing test data
        feedRepository.deleteAll();
        
        // Test data
        String testUserId = "30aeb201-d44a-4c8f-aca8-94bd49288ca4"; // Real user ID from NeonDB
        String testMessage = "Hello BharathVA! This is a test post from the mobile app.";
        
        // Create feed request
        CreateFeedRequest request = new CreateFeedRequest(testUserId, testMessage);
        
        // Create feed
        FeedResponse response = feedService.createFeed(request, testUserId);
        
        // Verify response
        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(testUserId, response.getUserId());
        assertEquals(testMessage, response.getMessage());
        assertNotNull(response.getCreatedAt());
        
        // Verify data is stored in MongoDB
        List<Feed> feeds = feedRepository.findAll();
        assertEquals(1, feeds.size());
        
        Feed savedFeed = feeds.get(0);
        assertEquals(testUserId, savedFeed.getUserId());
        assertEquals(testMessage, savedFeed.getMessage());
        assertNotNull(savedFeed.getId());
        assertNotNull(savedFeed.getCreatedAt());
        
        System.out.println("✅ Test passed! Feed created successfully:");
        System.out.println("   ID: " + response.getId());
        System.out.println("   User ID: " + response.getUserId());
        System.out.println("   Message: " + response.getMessage());
        System.out.println("   Created At: " + response.getCreatedAt());
    }

    @Test
    public void testGetAllFeeds() {
        // Clean up any existing test data
        feedRepository.deleteAll();
        
        // Create test feeds
        String testUserId1 = "30aeb201-d44a-4c8f-aca8-94bd49288ca4";
        String testUserId2 = "9c58dc97-390f-43ed-8950-cdef29930756";
        
        feedService.createFeed(new CreateFeedRequest(testUserId1, "First test post"), testUserId1);
        feedService.createFeed(new CreateFeedRequest(testUserId2, "Second test post"), testUserId2);
        
        // Get all feeds
        var feeds = feedService.getAllFeeds(0, 10);
        
        // Verify
        assertEquals(2, feeds.getTotalElements());
        
        System.out.println("✅ Test passed! Retrieved " + feeds.getTotalElements() + " feeds");
    }

    @Test
    public void testGetUserFeeds() {
        // Clean up any existing test data
        feedRepository.deleteAll();
        
        String testUserId = "30aeb201-d44a-4c8f-aca8-94bd49288ca4";
        
        // Create test feeds
        feedService.createFeed(new CreateFeedRequest(testUserId, "User post 1"), testUserId);
        feedService.createFeed(new CreateFeedRequest(testUserId, "User post 2"), testUserId);
        
        // Get user feeds
        var userFeeds = feedService.getUserFeeds(testUserId, 0, 10);
        
        // Verify
        assertEquals(2, userFeeds.getTotalElements());
        
        System.out.println("✅ Test passed! Retrieved " + userFeeds.getTotalElements() + " feeds for user " + testUserId);
    }
}
