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
public class MongoDBTest {

    @Autowired
    private FeedService feedService;

    @Autowired
    private FeedRepository feedRepository;

    @Test
    public void testMongoDBConnectionAndStorage() {
        // Clean up any existing test data
        feedRepository.deleteAll();
        
        // Test data - using real user ID from NeonDB
        String testUserId = "30aeb201-d44a-4c8f-aca8-94bd49288ca4";
        String testMessage = "Hello BharathVA! This is a test post from the mobile app.";
        
        System.out.println("🚀 Testing MongoDB connection and storage...");
        System.out.println("   User ID: " + testUserId);
        System.out.println("   Message: " + testMessage);
        
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
        
        System.out.println("✅ Feed created successfully:");
        System.out.println("   ID: " + response.getId());
        System.out.println("   User ID: " + response.getUserId());
        System.out.println("   Message: " + response.getMessage());
        System.out.println("   Created At: " + response.getCreatedAt());
        
        // Verify data is stored in MongoDB
        List<Feed> feeds = feedRepository.findAll();
        assertEquals(1, feeds.size());
        
        Feed savedFeed = feeds.get(0);
        assertEquals(testUserId, savedFeed.getUserId());
        assertEquals(testMessage, savedFeed.getMessage());
        assertNotNull(savedFeed.getId());
        assertNotNull(savedFeed.getCreatedAt());
        
        System.out.println("✅ Data verified in MongoDB:");
        System.out.println("   Total feeds in database: " + feeds.size());
        System.out.println("   Saved Feed ID: " + savedFeed.getId());
        System.out.println("   Saved Feed User ID: " + savedFeed.getUserId());
        System.out.println("   Saved Feed Message: " + savedFeed.getMessage());
        
        // Test retrieval
        var retrievedFeeds = feedService.getUserFeeds(testUserId, 0, 10);
        assertEquals(1, retrievedFeeds.getTotalElements());
        
        System.out.println("✅ Feed retrieval test passed:");
        System.out.println("   Retrieved feeds count: " + retrievedFeeds.getTotalElements());
        
        System.out.println("🎉 All MongoDB tests passed successfully!");
    }
}
