package com.bharathva.feed.analysis;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.feed.repository.ImageMetadataRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * MongoDB Analysis Test - Verifies image storage in MongoDB
 * This test analyzes the MongoDB database to ensure images are properly stored
 */
@SpringBootTest
@ActiveProfiles("test")
class MongoDBAnalysisTest {

    @Autowired
    private FeedRepository feedRepository;

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    @Test
    void testMongoDBImageStorageAnalysis() {
        System.out.println("=== MongoDB Image Storage Analysis ===");
        
        // Analyze ImageMetadata collection
        analyzeImageMetadataCollection();
        
        // Analyze Feed collection
        analyzeFeedCollection();
        
        // Analyze relationships between feeds and images
        analyzeFeedImageRelationships();
        
        System.out.println("=== Analysis Complete ===");
    }

    private void analyzeImageMetadataCollection() {
        System.out.println("\n--- ImageMetadata Collection Analysis ---");
        
        // Count total images
        long totalImages = imageMetadataRepository.count();
        System.out.println("Total images in database: " + totalImages);
        
        if (totalImages > 0) {
            // Get all images
            List<ImageMetadata> allImages = imageMetadataRepository.findAll();
            System.out.println("Sample images:");
            
            for (int i = 0; i < Math.min(5, allImages.size()); i++) {
                ImageMetadata image = allImages.get(i);
                System.out.println("  Image " + (i + 1) + ":");
                System.out.println("    ID: " + image.getId());
                System.out.println("    User ID: " + image.getUserId());
                System.out.println("    Original File Name: " + image.getOriginalFileName());
                System.out.println("    Stored File Name: " + image.getStoredFileName());
                System.out.println("    File Path: " + image.getFilePath());
                System.out.println("    File Size: " + image.getFileSize() + " bytes");
                System.out.println("    MIME Type: " + image.getMimeType());
                System.out.println("    Created At: " + image.getCreatedAt());
                System.out.println("    Image URL: " + image.getImageUrl());
                System.out.println();
            }
            
            // Analyze by user
            analyzeImagesByUser(allImages);
        } else {
            System.out.println("No images found in the database.");
        }
    }

    private void analyzeImagesByUser(List<ImageMetadata> allImages) {
        System.out.println("--- Images by User Analysis ---");
        
        // Group images by user
        java.util.Map<String, List<ImageMetadata>> imagesByUser = allImages.stream()
                .collect(java.util.stream.Collectors.groupingBy(ImageMetadata::getUserId));
        
        System.out.println("Number of users with images: " + imagesByUser.size());
        
        for (java.util.Map.Entry<String, List<ImageMetadata>> entry : imagesByUser.entrySet()) {
            String userId = entry.getKey();
            List<ImageMetadata> userImages = entry.getValue();
            
            System.out.println("User: " + userId + " - " + userImages.size() + " images");
            
            // Calculate total size for this user
            long totalSize = userImages.stream()
                    .mapToLong(ImageMetadata::getFileSize)
                    .sum();
            System.out.println("  Total size: " + formatFileSize(totalSize));
            
            // Show image types
            java.util.Map<String, Long> typeCount = userImages.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            ImageMetadata::getMimeType,
                            java.util.stream.Collectors.counting()
                    ));
            
            System.out.println("  Image types: " + typeCount);
        }
    }

    private void analyzeFeedCollection() {
        System.out.println("\n--- Feed Collection Analysis ---");
        
        // Count total feeds
        long totalFeeds = feedRepository.count();
        System.out.println("Total feeds in database: " + totalFeeds);
        
        if (totalFeeds > 0) {
            // Get all feeds
            List<Feed> allFeeds = feedRepository.findAll();
            
            // Count feeds with and without images
            long feedsWithImages = allFeeds.stream()
                    .filter(feed -> feed.getImageIds() != null && !feed.getImageIds().isEmpty())
                    .count();
            
            long feedsWithoutImages = totalFeeds - feedsWithImages;
            
            System.out.println("Feeds with images: " + feedsWithImages);
            System.out.println("Feeds without images: " + feedsWithoutImages);
            
            // Show sample feeds
            System.out.println("\nSample feeds:");
            for (int i = 0; i < Math.min(5, allFeeds.size()); i++) {
                Feed feed = allFeeds.get(i);
                System.out.println("  Feed " + (i + 1) + ":");
                System.out.println("    ID: " + feed.getId());
                System.out.println("    User ID: " + feed.getUserId());
                System.out.println("    Message: " + (feed.getMessage().length() > 50 ? 
                        feed.getMessage().substring(0, 50) + "..." : feed.getMessage()));
                System.out.println("    Image Count: " + (feed.getImageIds() != null ? feed.getImageIds().size() : 0));
                System.out.println("    Image IDs: " + (feed.getImageIds() != null ? feed.getImageIds() : "None"));
                System.out.println("    Created At: " + feed.getCreatedAt());
                System.out.println();
            }
        } else {
            System.out.println("No feeds found in the database.");
        }
    }

    private void analyzeFeedImageRelationships() {
        System.out.println("\n--- Feed-Image Relationship Analysis ---");
        
        List<Feed> allFeeds = feedRepository.findAll();
        List<ImageMetadata> allImages = imageMetadataRepository.findAll();
        
        if (allFeeds.isEmpty() || allImages.isEmpty()) {
            System.out.println("No feeds or images to analyze relationships.");
            return;
        }
        
        // Find orphaned images (images not referenced by any feed)
        java.util.Set<String> referencedImageIds = allFeeds.stream()
                .filter(feed -> feed.getImageIds() != null)
                .flatMap(feed -> feed.getImageIds().stream())
                .collect(java.util.stream.Collectors.toSet());
        
        List<ImageMetadata> orphanedImages = allImages.stream()
                .filter(image -> !referencedImageIds.contains(image.getId()))
                .toList();
        
        System.out.println("Total images: " + allImages.size());
        System.out.println("Images referenced by feeds: " + referencedImageIds.size());
        System.out.println("Orphaned images: " + orphanedImages.size());
        
        if (!orphanedImages.isEmpty()) {
            System.out.println("Orphaned images (not referenced by any feed):");
            for (ImageMetadata orphaned : orphanedImages) {
                System.out.println("  - " + orphaned.getId() + " (" + orphaned.getOriginalFileName() + ")");
            }
        }
        
        // Find feeds with invalid image references
        java.util.Set<String> validImageIds = allImages.stream()
                .map(ImageMetadata::getId)
                .collect(java.util.stream.Collectors.toSet());
        
        List<Feed> feedsWithInvalidReferences = allFeeds.stream()
                .filter(feed -> feed.getImageIds() != null)
                .filter(feed -> feed.getImageIds().stream().anyMatch(id -> !validImageIds.contains(id)))
                .toList();
        
        System.out.println("Feeds with invalid image references: " + feedsWithInvalidReferences.size());
        
        if (!feedsWithInvalidReferences.isEmpty()) {
            System.out.println("Feeds with invalid image references:");
            for (Feed feed : feedsWithInvalidReferences) {
                System.out.println("  - Feed " + feed.getId() + " references invalid images: " + 
                        feed.getImageIds().stream()
                                .filter(id -> !validImageIds.contains(id))
                                .toList());
            }
        }
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }

    @Test
    void testSpecificImageRetrieval() {
        System.out.println("\n=== Specific Image Retrieval Test ===");
        
        // Get a sample image ID
        List<ImageMetadata> allImages = imageMetadataRepository.findAll();
        
        if (!allImages.isEmpty()) {
            String testImageId = allImages.get(0).getId();
            System.out.println("Testing retrieval of image ID: " + testImageId);
            
            Optional<ImageMetadata> retrievedImage = imageMetadataRepository.findById(testImageId);
            
            if (retrievedImage.isPresent()) {
                ImageMetadata image = retrievedImage.get();
                System.out.println("✓ Image successfully retrieved:");
                System.out.println("  ID: " + image.getId());
                System.out.println("  User ID: " + image.getUserId());
                System.out.println("  File Name: " + image.getOriginalFileName());
                System.out.println("  File Path: " + image.getFilePath());
                System.out.println("  File Size: " + image.getFileSize() + " bytes");
                System.out.println("  MIME Type: " + image.getMimeType());
                System.out.println("  Created At: " + image.getCreatedAt());
                System.out.println("  Image URL: " + image.getImageUrl());
            } else {
                System.out.println("✗ Failed to retrieve image with ID: " + testImageId);
            }
        } else {
            System.out.println("No images available for retrieval test.");
        }
    }

    @Test
    void testUserSpecificImageAnalysis() {
        System.out.println("\n=== User-Specific Image Analysis ===");
        
        // Get a sample user ID
        List<ImageMetadata> allImages = imageMetadataRepository.findAll();
        
        if (!allImages.isEmpty()) {
            String testUserId = allImages.get(0).getUserId();
            System.out.println("Analyzing images for user: " + testUserId);
            
            List<ImageMetadata> userImages = imageMetadataRepository.findImageFilesByUserId(testUserId);
            
            System.out.println("Total images for user: " + userImages.size());
            
            if (!userImages.isEmpty()) {
                // Calculate statistics
                long totalSize = userImages.stream().mapToLong(ImageMetadata::getFileSize).sum();
                double avgSize = userImages.stream().mapToLong(ImageMetadata::getFileSize).average().orElse(0);
                
                System.out.println("Total storage used: " + formatFileSize(totalSize));
                System.out.println("Average image size: " + formatFileSize((long) avgSize));
                
                // Show image types
                java.util.Map<String, Long> typeCount = userImages.stream()
                        .collect(java.util.stream.Collectors.groupingBy(
                                ImageMetadata::getMimeType,
                                java.util.stream.Collectors.counting()
                        ));
                
                System.out.println("Image types: " + typeCount);
                
                // Show recent images
                System.out.println("\nRecent images:");
                userImages.stream()
                        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                        .limit(3)
                        .forEach(image -> {
                            System.out.println("  - " + image.getOriginalFileName() + 
                                    " (" + formatFileSize(image.getFileSize()) + ") - " + 
                                    image.getCreatedAt());
                        });
            }
        } else {
            System.out.println("No images available for user analysis.");
        }
    }
}
