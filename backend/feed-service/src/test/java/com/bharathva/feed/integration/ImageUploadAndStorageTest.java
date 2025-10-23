package com.bharathva.feed.integration;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.feed.repository.ImageMetadataRepository;
import com.bharathva.feed.service.FileStorageService;
import com.bharathva.feed.service.FeedService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test that verifies complete image upload and storage functionality
 * This test demonstrates the end-to-end flow from image upload to MongoDB storage
 */
@SpringBootTest
@ActiveProfiles("test")
class ImageUploadAndStorageTest {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private FeedService feedService;

    @Autowired
    private FeedRepository feedRepository;

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    private final String testUserId = "test-user-integration";
    private final String testUploadDir = "test-uploads-integration";

    @BeforeEach
    void setUp() {
        // Clean up test data
        feedRepository.deleteAll();
        imageMetadataRepository.deleteAll();
    }

    @Test
    void testCompleteImageUploadAndStorageFlow() throws IOException {
        System.out.println("=== Starting Complete Image Upload and Storage Test ===");
        
        // Step 1: Create test image files
        MockMultipartFile image1 = new MockMultipartFile(
                "files",
                "test-image-1.jpg",
                "image/jpeg",
                createTestImageContent(2048) // 2KB test image
        );

        MockMultipartFile image2 = new MockMultipartFile(
                "files",
                "test-image-2.jpg",
                "image/jpeg",
                createTestImageContent(1536) // 1.5KB test image
        );

        MockMultipartFile[] files = {image1, image2};

        System.out.println("Step 1: Created test image files");
        System.out.println("  - Image 1: " + image1.getOriginalFilename() + " (" + image1.getSize() + " bytes)");
        System.out.println("  - Image 2: " + image2.getOriginalFilename() + " (" + image2.getSize() + " bytes)");

        // Step 2: Upload images using FileStorageService
        System.out.println("\nStep 2: Uploading images to FileStorageService...");
        List<ImageMetadata> uploadedImages = fileStorageService.storeFiles(files, testUserId);

        // Verify images are stored
        assertNotNull(uploadedImages, "Uploaded images list should not be null");
        assertEquals(2, uploadedImages.size(), "Should have uploaded 2 images");

        System.out.println("✅ Images uploaded successfully:");
        for (int i = 0; i < uploadedImages.size(); i++) {
            ImageMetadata metadata = uploadedImages.get(i);
            System.out.println("  - Image " + (i + 1) + ":");
            System.out.println("    ID: " + metadata.getId());
            System.out.println("    Original Name: " + metadata.getOriginalFileName());
            System.out.println("    Stored Name: " + metadata.getStoredFileName());
            System.out.println("    File Path: " + metadata.getFilePath());
            System.out.println("    File Size: " + metadata.getFileSize() + " bytes");
            System.out.println("    MIME Type: " + metadata.getMimeType());
            System.out.println("    Created At: " + metadata.getCreatedAt());
            System.out.println("    Image URL: " + metadata.getImageUrl());
        }

        // Step 3: Verify images are stored in MongoDB
        System.out.println("\nStep 3: Verifying images are stored in MongoDB...");
        List<ImageMetadata> storedImages = imageMetadataRepository.findImageFilesByUserId(testUserId);
        
        assertEquals(2, storedImages.size(), "Should have 2 images in MongoDB");
        System.out.println("✅ Images verified in MongoDB:");
        for (ImageMetadata storedImage : storedImages) {
            System.out.println("  - ID: " + storedImage.getId());
            System.out.println("    User ID: " + storedImage.getUserId());
            System.out.println("    Original Name: " + storedImage.getOriginalFileName());
            System.out.println("    File Size: " + storedImage.getFileSize() + " bytes");
        }

        // Step 4: Create a feed with image references
        System.out.println("\nStep 4: Creating feed with image references...");
        String feedMessage = "Test feed with uploaded images";
        List<String> imageIds = uploadedImages.stream()
                .map(ImageMetadata::getId)
                .toList();

        com.bharathva.feed.dto.CreateFeedRequest request = new com.bharathva.feed.dto.CreateFeedRequest();
        request.setUserId(testUserId);
        request.setMessage(feedMessage);
        request.setImageIds(imageIds);

        com.bharathva.feed.dto.FeedResponse feedResponse = feedService.createFeed(request, testUserId);

        // Verify feed is created
        assertNotNull(feedResponse, "Feed response should not be null");
        assertEquals(testUserId, feedResponse.getUserId(), "Feed user ID should match");
        assertEquals(feedMessage, feedResponse.getMessage(), "Feed message should match");
        assertEquals(2, feedResponse.getImageIds().size(), "Feed should have 2 image references");

        System.out.println("✅ Feed created successfully:");
        System.out.println("  - Feed ID: " + feedResponse.getId());
        System.out.println("  - User ID: " + feedResponse.getUserId());
        System.out.println("  - Message: " + feedResponse.getMessage());
        System.out.println("  - Image IDs: " + feedResponse.getImageIds());

        // Step 5: Verify feed is stored in MongoDB
        System.out.println("\nStep 5: Verifying feed is stored in MongoDB...");
        List<Feed> userFeeds = feedRepository.findByUserIdOrderByCreatedAtDesc(testUserId);
        
        assertEquals(1, userFeeds.size(), "Should have 1 feed in MongoDB");
        Feed storedFeed = userFeeds.get(0);
        assertEquals(2, storedFeed.getImageIds().size(), "Stored feed should have 2 image references");

        System.out.println("✅ Feed verified in MongoDB:");
        System.out.println("  - Feed ID: " + storedFeed.getId());
        System.out.println("  - User ID: " + storedFeed.getUserId());
        System.out.println("  - Message: " + storedFeed.getMessage());
        System.out.println("  - Image IDs: " + storedFeed.getImageIds());

        // Step 6: Verify image-file relationships
        System.out.println("\nStep 6: Verifying image-file relationships...");
        for (String imageId : imageIds) {
            ImageMetadata imageMetadata = imageMetadataRepository.findById(imageId).orElse(null);
            assertNotNull(imageMetadata, "Image metadata should exist for ID: " + imageId);
            assertEquals(testUserId, imageMetadata.getUserId(), "Image should belong to test user");
            
            System.out.println("✅ Image relationship verified for ID: " + imageId);
        }

        // Step 7: Test image retrieval
        System.out.println("\nStep 7: Testing image retrieval...");
        for (String imageId : imageIds) {
            ImageMetadata retrievedImage = fileStorageService.getImageMetadata(imageId);
            assertNotNull(retrievedImage, "Should be able to retrieve image by ID: " + imageId);
            assertEquals(imageId, retrievedImage.getId(), "Retrieved image ID should match");
            
            System.out.println("✅ Image retrieved successfully: " + retrievedImage.getOriginalFileName());
        }

        // Step 8: Test user image list
        System.out.println("\nStep 8: Testing user image list retrieval...");
        List<ImageMetadata> userImages = fileStorageService.getUserImages(testUserId);
        assertEquals(2, userImages.size(), "User should have 2 images");
        
        System.out.println("✅ User image list retrieved successfully:");
        for (ImageMetadata userImage : userImages) {
            System.out.println("  - " + userImage.getOriginalFileName() + " (" + userImage.getFileSize() + " bytes)");
        }

        System.out.println("\n=== Test Completed Successfully ===");
        System.out.println("✅ All image upload and storage functionality is working correctly!");
        System.out.println("✅ Images are properly stored in MongoDB");
        System.out.println("✅ Feed creation with image references works");
        System.out.println("✅ Image retrieval and management functions correctly");
    }

    @Test
    void testImageStorageValidation() throws IOException {
        System.out.println("=== Starting Image Storage Validation Test ===");

        // Test 1: Valid image upload
        System.out.println("Test 1: Valid image upload");
        MockMultipartFile validImage = new MockMultipartFile(
                "file",
                "valid-image.jpg",
                "image/jpeg",
                createTestImageContent(1024)
        );

        ImageMetadata uploadedImage = fileStorageService.storeFile(validImage, testUserId);
        assertNotNull(uploadedImage, "Valid image should be uploaded successfully");
        assertEquals("valid-image.jpg", uploadedImage.getOriginalFileName());
        assertEquals("image/jpeg", uploadedImage.getMimeType());
        assertEquals(1024L, uploadedImage.getFileSize());

        System.out.println("✅ Valid image uploaded successfully");

        // Test 2: Verify MongoDB storage
        System.out.println("Test 2: Verify MongoDB storage");
        List<ImageMetadata> storedImages = imageMetadataRepository.findImageFilesByUserId(testUserId);
        assertEquals(1, storedImages.size(), "Should have 1 image in MongoDB");
        
        ImageMetadata storedImage = storedImages.get(0);
        assertEquals(uploadedImage.getId(), storedImage.getId(), "Stored image ID should match");
        assertEquals(testUserId, storedImage.getUserId(), "Stored image user ID should match");

        System.out.println("✅ Image storage in MongoDB verified");

        // Test 3: Test image retrieval
        System.out.println("Test 3: Test image retrieval");
        ImageMetadata retrievedImage = fileStorageService.getImageMetadata(uploadedImage.getId());
        assertNotNull(retrievedImage, "Should be able to retrieve image");
        assertEquals(uploadedImage.getId(), retrievedImage.getId(), "Retrieved image ID should match");

        System.out.println("✅ Image retrieval verified");

        // Test 4: Test image deletion
        System.out.println("Test 4: Test image deletion");
        fileStorageService.deleteImage(uploadedImage.getId(), testUserId);
        
        // Verify image is deleted from MongoDB
        List<ImageMetadata> imagesAfterDeletion = imageMetadataRepository.findImageFilesByUserId(testUserId);
        assertEquals(0, imagesAfterDeletion.size(), "Should have 0 images after deletion");

        System.out.println("✅ Image deletion verified");

        System.out.println("=== Image Storage Validation Test Completed Successfully ===");
    }

    @Test
    void testMultipleUsersImageStorage() throws IOException {
        System.out.println("=== Starting Multiple Users Image Storage Test ===");

        String user1 = "user-1";
        String user2 = "user-2";

        // Upload images for user 1
        MockMultipartFile user1Image = new MockMultipartFile(
                "file", "user1-image.jpg", "image/jpeg", createTestImageContent(1024)
        );
        ImageMetadata user1Uploaded = fileStorageService.storeFile(user1Image, user1);

        // Upload images for user 2
        MockMultipartFile user2Image = new MockMultipartFile(
                "file", "user2-image.jpg", "image/jpeg", createTestImageContent(2048)
        );
        ImageMetadata user2Uploaded = fileStorageService.storeFile(user2Image, user2);

        // Verify user isolation
        List<ImageMetadata> user1Images = imageMetadataRepository.findImageFilesByUserId(user1);
        List<ImageMetadata> user2Images = imageMetadataRepository.findImageFilesByUserId(user2);

        assertEquals(1, user1Images.size(), "User 1 should have 1 image");
        assertEquals(1, user2Images.size(), "User 2 should have 1 image");

        assertEquals(user1, user1Images.get(0).getUserId(), "User 1 image should belong to user 1");
        assertEquals(user2, user2Images.get(0).getUserId(), "User 2 image should belong to user 2");

        System.out.println("✅ Multiple users image storage verified");
        System.out.println("  - User 1 has " + user1Images.size() + " images");
        System.out.println("  - User 2 has " + user2Images.size() + " images");

        System.out.println("=== Multiple Users Image Storage Test Completed Successfully ===");
    }

    /**
     * Helper method to create test image content
     */
    private byte[] createTestImageContent(int size) {
        byte[] content = new byte[size];
        // Fill with some test data
        for (int i = 0; i < size; i++) {
            content[i] = (byte) (i % 256);
        }
        return content;
    }
}
