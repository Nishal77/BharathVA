package com.bharathva.feed.integration;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.feed.repository.ImageMetadataRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Sample Data Migration Test - Inserts sample data into MongoDB
 * This test demonstrates the complete image storage functionality with real data
 */
@SpringBootTest
@ActiveProfiles("test")
class SampleDataMigrationTest {

    @Autowired
    private FeedRepository feedRepository;

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    @Test
    void testInsertSampleDataWithImages() {
        System.out.println("=== Starting Sample Data Migration Test ===");
        
        // Clean up existing test data
        feedRepository.deleteAll();
        imageMetadataRepository.deleteAll();
        
        // Sample user IDs
        String user1 = "24436b2a-cb17-4aec-8923-7d4a9fc1f5ca";
        String user2 = "9c58dc97-390f-43ed-8950-cdef29930756";
        
        System.out.println("Step 1: Creating sample image metadata...");
        
        // Create sample image metadata
        ImageMetadata image1 = new ImageMetadata();
        image1.setUserId(user1);
        image1.setOriginalFileName("sample-beach-sunset.jpg");
        image1.setStoredFileName("uuid-beach-sunset-12345.jpg");
        image1.setFilePath("uploads/uuid-beach-sunset-12345.jpg");
        image1.setFileSize(2048576L); // 2MB
        image1.setMimeType("image/jpeg");
        image1.setWidth(1920);
        image1.setHeight(1080);
        image1.setCreatedAt(LocalDateTime.now());
        image1.setUpdatedAt(LocalDateTime.now());
        
        ImageMetadata image2 = new ImageMetadata();
        image2.setUserId(user1);
        image2.setOriginalFileName("sample-mountain-landscape.jpg");
        image2.setStoredFileName("uuid-mountain-landscape-67890.jpg");
        image2.setFilePath("uploads/uuid-mountain-landscape-67890.jpg");
        image2.setFileSize(1536000L); // 1.5MB
        image2.setMimeType("image/jpeg");
        image2.setWidth(1280);
        image2.setHeight(720);
        image2.setCreatedAt(LocalDateTime.now());
        image2.setUpdatedAt(LocalDateTime.now());
        
        ImageMetadata image3 = new ImageMetadata();
        image3.setUserId(user2);
        image3.setOriginalFileName("unsplash-nature-forest.jpg");
        image3.setStoredFileName("uuid-unsplash-nature-forest-11111.jpg");
        image3.setFilePath("uploads/uuid-unsplash-nature-forest-11111.jpg");
        image3.setFileSize(3072000L); // 3MB
        image3.setMimeType("image/jpeg");
        image3.setWidth(2560);
        image3.setHeight(1440);
        image3.setCreatedAt(LocalDateTime.now());
        image3.setUpdatedAt(LocalDateTime.now());
        
        // Save image metadata to MongoDB
        ImageMetadata savedImage1 = imageMetadataRepository.save(image1);
        ImageMetadata savedImage2 = imageMetadataRepository.save(image2);
        ImageMetadata savedImage3 = imageMetadataRepository.save(image3);
        
        System.out.println("✅ Image metadata created successfully:");
        System.out.println("  - Image 1 ID: " + savedImage1.getId());
        System.out.println("  - Image 2 ID: " + savedImage2.getId());
        System.out.println("  - Image 3 ID: " + savedImage3.getId());
        
        System.out.println("\nStep 2: Creating sample feeds with image references...");
        
        // Create sample feeds with image references
        Feed feed1 = new Feed();
        feed1.setUserId(user1);
        feed1.setMessage("Beautiful sunset at the beach today! 🌅");
        feed1.setImageIds(Arrays.asList(savedImage1.getId()));
        feed1.setCreatedAt(LocalDateTime.now());
        feed1.setUpdatedAt(LocalDateTime.now());
        
        Feed feed2 = new Feed();
        feed2.setUserId(user1);
        feed2.setMessage("Amazing mountain landscape from my hiking trip 🏔️");
        feed2.setImageIds(Arrays.asList(savedImage2.getId()));
        feed2.setCreatedAt(LocalDateTime.now());
        feed2.setUpdatedAt(LocalDateTime.now());
        
        Feed feed3 = new Feed();
        feed3.setUserId(user2);
        feed3.setMessage("Peaceful forest walk in nature 🌲");
        feed3.setImageIds(Arrays.asList(savedImage3.getId()));
        feed3.setCreatedAt(LocalDateTime.now());
        feed3.setUpdatedAt(LocalDateTime.now());
        
        Feed feed4 = new Feed();
        feed4.setUserId(user1);
        feed4.setMessage("Testing text-only post without images");
        feed4.setImageIds(Arrays.asList()); // Empty image list
        feed4.setCreatedAt(LocalDateTime.now());
        feed4.setUpdatedAt(LocalDateTime.now());
        
        // Save feeds to MongoDB
        Feed savedFeed1 = feedRepository.save(feed1);
        Feed savedFeed2 = feedRepository.save(feed2);
        Feed savedFeed3 = feedRepository.save(feed3);
        Feed savedFeed4 = feedRepository.save(feed4);
        
        System.out.println("✅ Feeds created successfully:");
        System.out.println("  - Feed 1 ID: " + savedFeed1.getId() + " (with 1 image)");
        System.out.println("  - Feed 2 ID: " + savedFeed2.getId() + " (with 1 image)");
        System.out.println("  - Feed 3 ID: " + savedFeed3.getId() + " (with 1 image)");
        System.out.println("  - Feed 4 ID: " + savedFeed4.getId() + " (text only)");
        
        System.out.println("\nStep 3: Verifying data in MongoDB...");
        
        // Verify all data is stored correctly
        List<ImageMetadata> allImages = imageMetadataRepository.findAll();
        List<Feed> allFeeds = feedRepository.findAll();
        
        assertEquals(3, allImages.size(), "Should have 3 images in database");
        assertEquals(4, allFeeds.size(), "Should have 4 feeds in database");
        
        // Verify image metadata
        for (ImageMetadata img : allImages) {
            assertNotNull(img.getId(), "Image ID should not be null");
            assertNotNull(img.getUserId(), "User ID should not be null");
            assertNotNull(img.getOriginalFileName(), "Original filename should not be null");
            assertNotNull(img.getStoredFileName(), "Stored filename should not be null");
            assertNotNull(img.getFilePath(), "File path should not be null");
            assertTrue(img.getFileSize() > 0, "File size should be greater than 0");
            assertEquals("image/jpeg", img.getMimeType(), "MIME type should be image/jpeg");
            assertNotNull(img.getCreatedAt(), "Created date should not be null");
        }
        
        // Verify feeds with images
        List<Feed> feedsWithImages = allFeeds.stream()
                .filter(feed -> feed.getImageIds() != null && !feed.getImageIds().isEmpty())
                .toList();
        
        assertEquals(3, feedsWithImages.size(), "Should have 3 feeds with images");
        
        // Verify feeds without images
        List<Feed> feedsWithoutImages = allFeeds.stream()
                .filter(feed -> feed.getImageIds() == null || feed.getImageIds().isEmpty())
                .toList();
        
        assertEquals(1, feedsWithoutImages.size(), "Should have 1 feed without images");
        
        System.out.println("✅ Data verification completed successfully:");
        System.out.println("  - Total images: " + allImages.size());
        System.out.println("  - Total feeds: " + allFeeds.size());
        System.out.println("  - Feeds with images: " + feedsWithImages.size());
        System.out.println("  - Feeds without images: " + feedsWithoutImages.size());
        
        System.out.println("\nStep 4: Testing image retrieval by user...");
        
        // Test image retrieval by user
        List<ImageMetadata> user1Images = imageMetadataRepository.findImageFilesByUserId(user1);
        List<ImageMetadata> user2Images = imageMetadataRepository.findImageFilesByUserId(user2);
        
        assertEquals(2, user1Images.size(), "User 1 should have 2 images");
        assertEquals(1, user2Images.size(), "User 2 should have 1 image");
        
        System.out.println("✅ User image retrieval verified:");
        System.out.println("  - User 1 (" + user1 + ") has " + user1Images.size() + " images");
        System.out.println("  - User 2 (" + user2 + ") has " + user2Images.size() + " images");
        
        System.out.println("\nStep 5: Testing feed retrieval by user...");
        
        // Test feed retrieval by user
        List<Feed> user1Feeds = feedRepository.findByUserIdOrderByCreatedAtDesc(user1);
        List<Feed> user2Feeds = feedRepository.findByUserIdOrderByCreatedAtDesc(user2);
        
        assertEquals(3, user1Feeds.size(), "User 1 should have 3 feeds");
        assertEquals(1, user2Feeds.size(), "User 2 should have 1 feed");
        
        System.out.println("✅ User feed retrieval verified:");
        System.out.println("  - User 1 (" + user1 + ") has " + user1Feeds.size() + " feeds");
        System.out.println("  - User 2 (" + user2 + ") has " + user2Feeds.size() + " feeds");
        
        System.out.println("\nStep 6: Testing image URL generation...");
        
        // Test image URL generation
        for (ImageMetadata img : allImages) {
            String imageUrl = img.getImageUrl();
            assertNotNull(imageUrl, "Image URL should not be null");
            assertTrue(imageUrl.startsWith("/api/feed/images/"), "Image URL should start with /api/feed/images/");
            assertTrue(imageUrl.contains(img.getId()), "Image URL should contain image ID");
            
            System.out.println("  - " + img.getOriginalFileName() + " -> " + imageUrl);
        }
        
        System.out.println("✅ Image URL generation verified");
        
        System.out.println("\n=== Sample Data Migration Test Completed Successfully ===");
        System.out.println("✅ Sample data has been successfully inserted into MongoDB");
        System.out.println("✅ Image storage functionality is working correctly");
        System.out.println("✅ Feed creation with image references works");
        System.out.println("✅ Data retrieval and relationships are functioning properly");
        
        // Print summary of inserted data
        System.out.println("\n📊 Sample Data Summary:");
        System.out.println("Images:");
        for (ImageMetadata img : allImages) {
            System.out.println("  - " + img.getOriginalFileName() + " (" + formatFileSize(img.getFileSize()) + ")");
        }
        
        System.out.println("Feeds:");
        for (Feed feed : allFeeds) {
            System.out.println("  - \"" + feed.getMessage() + "\" (" + 
                    (feed.getImageIds() != null ? feed.getImageIds().size() : 0) + " images)");
        }
    }
    
    /**
     * Helper method to format file size
     */
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
}
