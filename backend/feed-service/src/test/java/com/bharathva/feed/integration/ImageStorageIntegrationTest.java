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
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for image storage functionality
 * Tests the complete flow from image upload to MongoDB storage
 */
@SpringBootTest
@ActiveProfiles("test")
class ImageStorageIntegrationTest {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private FeedService feedService;

    @Autowired
    private FeedRepository feedRepository;

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    private final String testUserId = "integration-test-user";
    private final String testUploadDir = "test-uploads-integration";

    @BeforeEach
    void setUp() {
        // Clean up test data
        feedRepository.deleteAll();
        imageMetadataRepository.deleteAll();
        
        // Clean up test upload directory
        try {
            Path uploadPath = Paths.get(testUploadDir);
            if (Files.exists(uploadPath)) {
                Files.walk(uploadPath)
                        .sorted(java.util.Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(java.io.File::delete);
            }
        } catch (IOException e) {
            // Ignore cleanup errors
        }
    }

    @Test
    void testCompleteImageUploadAndFeedCreationFlow() throws IOException {
        // Step 1: Create test image files
        MockMultipartFile image1 = new MockMultipartFile(
                "files",
                "test-image-1.jpg",
                "image/jpeg",
                createTestImageContent(1024) // 1KB test image
        );

        MockMultipartFile image2 = new MockMultipartFile(
                "files",
                "test-image-2.jpg",
                "image/jpeg",
                createTestImageContent(2048) // 2KB test image
        );

        MultipartFile[] files = {image1, image2};

        // Step 2: Upload images
        List<ImageMetadata> uploadedImages = fileStorageService.storeFiles(files, testUserId);

        // Verify images are stored in MongoDB
        assertNotNull(uploadedImages);
        assertEquals(2, uploadedImages.size());

        for (ImageMetadata metadata : uploadedImages) {
            assertNotNull(metadata.getId());
            assertEquals(testUserId, metadata.getUserId());
            assertNotNull(metadata.getOriginalFileName());
            assertNotNull(metadata.getStoredFileName());
            assertNotNull(metadata.getFilePath());
            assertTrue(metadata.getFileSize() > 0);
            assertEquals("image/jpeg", metadata.getMimeType());
            assertNotNull(metadata.getCreatedAt());
        }

        // Step 3: Verify images are persisted in MongoDB
        List<ImageMetadata> savedImages = imageMetadataRepository.findImageFilesByUserId(testUserId);
        assertEquals(2, savedImages.size());

        // Step 4: Create a feed with image references
        String feedMessage = "Test feed with images";
        List<String> imageIds = uploadedImages.stream()
                .map(ImageMetadata::getId)
                .toList();

        // Create feed request
        com.bharathva.feed.dto.CreateFeedRequest request = new com.bharathva.feed.dto.CreateFeedRequest();
        request.setUserId(testUserId);
        request.setMessage(feedMessage);
        request.setImageIds(imageIds);

        // Step 5: Create feed
        com.bharathva.feed.dto.FeedResponse feedResponse = feedService.createFeed(request, testUserId);

        // Verify feed is created with image references
        assertNotNull(feedResponse);
        assertEquals(testUserId, feedResponse.getUserId());
        assertEquals(feedMessage, feedResponse.getMessage());
        assertEquals(2, feedResponse.getImageIds().size());
        assertTrue(feedResponse.getImageIds().containsAll(imageIds));

        // Step 6: Verify feed is persisted in MongoDB
        Optional<Feed> savedFeed = feedRepository.findById(feedResponse.getId());
        assertTrue(savedFeed.isPresent());
        assertEquals(2, savedFeed.get().getImageIds().size());
        assertTrue(savedFeed.get().getImageIds().containsAll(imageIds));

        // Step 7: Verify we can retrieve image metadata by ID
        for (String imageId : imageIds) {
            Optional<ImageMetadata> retrievedMetadata = imageMetadataRepository.findById(imageId);
            assertTrue(retrievedMetadata.isPresent());
            assertEquals(testUserId, retrievedMetadata.get().getUserId());
        }

        // Step 8: Verify file system storage
        for (ImageMetadata metadata : uploadedImages) {
            Path filePath = Paths.get(metadata.getFilePath());
            assertTrue(Files.exists(filePath));
            assertTrue(Files.size(filePath) > 0);
        }
    }

    @Test
    void testImageRetrievalAndDeletion() throws IOException {
        // Step 1: Upload a test image
        MockMultipartFile testImage = new MockMultipartFile(
                "file",
                "test-retrieval.jpg",
                "image/jpeg",
                createTestImageContent(512)
        );

        ImageMetadata uploadedImage = fileStorageService.storeFile(testImage, testUserId);

        // Step 2: Verify image can be retrieved
        ImageMetadata retrievedImage = fileStorageService.getImageMetadata(uploadedImage.getId());
        assertNotNull(retrievedImage);
        assertEquals(uploadedImage.getId(), retrievedImage.getId());
        assertEquals(testUserId, retrievedImage.getUserId());

        // Step 3: Verify file exists on disk
        Path filePath = Paths.get(retrievedImage.getFilePath());
        assertTrue(Files.exists(filePath));

        // Step 4: Delete the image
        fileStorageService.deleteImage(uploadedImage.getId(), testUserId);

        // Step 5: Verify image is removed from MongoDB
        Optional<ImageMetadata> deletedImage = imageMetadataRepository.findById(uploadedImage.getId());
        assertFalse(deletedImage.isPresent());

        // Step 6: Verify file is removed from disk
        assertFalse(Files.exists(filePath));
    }

    @Test
    void testUserImageListRetrieval() throws IOException {
        // Step 1: Upload multiple images for the same user
        MockMultipartFile image1 = new MockMultipartFile(
                "file1", "user-image-1.jpg", "image/jpeg", createTestImageContent(1024)
        );
        MockMultipartFile image2 = new MockMultipartFile(
                "file2", "user-image-2.jpg", "image/jpeg", createTestImageContent(2048)
        );
        MockMultipartFile image3 = new MockMultipartFile(
                "file3", "user-image-3.jpg", "image/jpeg", createTestImageContent(1536)
        );

        fileStorageService.storeFile(image1, testUserId);
        fileStorageService.storeFile(image2, testUserId);
        fileStorageService.storeFile(image3, testUserId);

        // Step 2: Retrieve all images for the user
        List<ImageMetadata> userImages = fileStorageService.getUserImages(testUserId);

        // Step 3: Verify all images are retrieved
        assertEquals(3, userImages.size());
        for (ImageMetadata image : userImages) {
            assertEquals(testUserId, image.getUserId());
            assertTrue(image.getOriginalFileName().startsWith("user-image-"));
        }

        // Step 4: Verify images are sorted by creation time (newest first)
        for (int i = 0; i < userImages.size() - 1; i++) {
            assertTrue(userImages.get(i).getCreatedAt().isAfter(userImages.get(i + 1).getCreatedAt()) ||
                    userImages.get(i).getCreatedAt().isEqual(userImages.get(i + 1).getCreatedAt()));
        }
    }

    @Test
    void testImageValidationAndErrorHandling() {
        // Test 1: Empty file
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]
        );

        assertThrows(RuntimeException.class, () -> {
            fileStorageService.storeFile(emptyFile, testUserId);
        });

        // Test 2: Invalid content type
        MockMultipartFile invalidTypeFile = new MockMultipartFile(
                "file", "test.txt", "text/plain", "test content".getBytes()
        );

        assertThrows(RuntimeException.class, () -> {
            fileStorageService.storeFile(invalidTypeFile, testUserId);
        });

        // Test 3: File too large (assuming max size is 10MB)
        byte[] largeContent = new byte[10485761]; // 10MB + 1 byte
        MockMultipartFile largeFile = new MockMultipartFile(
                "file", "large.jpg", "image/jpeg", largeContent
        );

        assertThrows(RuntimeException.class, () -> {
            fileStorageService.storeFile(largeFile, testUserId);
        });
    }

    @Test
    void testFeedWithImagesAndWithoutImages() throws IOException {
        // Test 1: Create feed without images
        com.bharathva.feed.dto.CreateFeedRequest requestWithoutImages = new com.bharathva.feed.dto.CreateFeedRequest();
        requestWithoutImages.setUserId(testUserId);
        requestWithoutImages.setMessage("Feed without images");

        com.bharathva.feed.dto.FeedResponse feedWithoutImages = feedService.createFeed(requestWithoutImages, testUserId);
        assertNotNull(feedWithoutImages);
        assertTrue(feedWithoutImages.getImageIds().isEmpty());

        // Test 2: Create feed with images
        MockMultipartFile testImage = new MockMultipartFile(
                "file", "feed-image.jpg", "image/jpeg", createTestImageContent(1024)
        );

        ImageMetadata uploadedImage = fileStorageService.storeFile(testImage, testUserId);

        com.bharathva.feed.dto.CreateFeedRequest requestWithImages = new com.bharathva.feed.dto.CreateFeedRequest();
        requestWithImages.setUserId(testUserId);
        requestWithImages.setMessage("Feed with images");
        requestWithImages.setImageIds(Arrays.asList(uploadedImage.getId()));

        com.bharathva.feed.dto.FeedResponse feedWithImages = feedService.createFeed(requestWithImages, testUserId);
        assertNotNull(feedWithImages);
        assertEquals(1, feedWithImages.getImageIds().size());
        assertTrue(feedWithImages.getImageIds().contains(uploadedImage.getId()));

        // Verify both feeds are stored correctly
        List<Feed> allFeeds = feedRepository.findByUserIdOrderByCreatedAtDesc(testUserId);
        assertEquals(2, allFeeds.size());

        Feed textOnlyFeed = allFeeds.stream()
                .filter(feed -> feed.getMessage().equals("Feed without images"))
                .findFirst()
                .orElse(null);
        assertNotNull(textOnlyFeed);
        assertTrue(textOnlyFeed.getImageIds().isEmpty());

        Feed imageFeed = allFeeds.stream()
                .filter(feed -> feed.getMessage().equals("Feed with images"))
                .findFirst()
                .orElse(null);
        assertNotNull(imageFeed);
        assertEquals(1, imageFeed.getImageIds().size());
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
