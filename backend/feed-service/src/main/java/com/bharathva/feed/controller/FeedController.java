package com.bharathva.feed.controller;

import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.service.FeedService;
import com.bharathva.feed.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Simple REST controller for feed messages
 */
@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "*")
public class FeedController {
    
    private static final Logger log = LoggerFactory.getLogger(FeedController.class);
    
    @Autowired
    private FeedService feedService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Health check requested");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "feed-service");
        response.put("message", "Feed service is running");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }
    
    // Create a new feed message
    @PostMapping("/create")
    public ResponseEntity<FeedResponse> createFeed(
            @Valid @RequestBody CreateFeedRequest request,
            Authentication authentication) {
        
        log.info("Creating feed for user: {}", request.getUserId());
        
        try {
            // Extract user ID from JWT token
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            log.info("Authenticated user ID: {}", authenticatedUserId);
            
            // Validate that the authenticated user matches the request user
            if (!authenticatedUserId.equals(request.getUserId())) {
                log.warn("User ID mismatch: authenticated user {} cannot create feed for user {}", 
                        authenticatedUserId, request.getUserId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            FeedResponse response = feedService.createFeed(request, authenticatedUserId);
            log.info("Feed created successfully with ID: {}", response.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Error creating feed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all feeds (global feed)
    @GetMapping("/all")
    public ResponseEntity<Page<FeedResponse>> getAllFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting all feeds, page: {}, size: {}", page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.getAllFeeds(page, size);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error getting all feeds: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get feeds by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<FeedResponse>> getUserFeeds(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting feeds for user: {}, page: {}, size: {}", userId, page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.getUserFeeds(userId, page, size);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error getting user feeds: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get feeds by user ID as list (for profile)
    @GetMapping("/user/{userId}/list")
    public ResponseEntity<List<FeedResponse>> getUserFeedsList(@PathVariable String userId) {
        log.info("Getting feeds list for user: {}", userId);
        
        try {
            List<FeedResponse> feeds = feedService.getUserFeedsList(userId);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error getting user feeds list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get feed by ID
    @GetMapping("/{feedId}")
    public ResponseEntity<FeedResponse> getFeedById(@PathVariable String feedId) {
        log.info("Getting feed by ID: {}", feedId);
        
        try {
            FeedResponse feed = feedService.getFeedById(feedId);
            return ResponseEntity.ok(feed);
        } catch (Exception e) {
            log.error("Error getting feed by ID: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    // Search feeds
    @GetMapping("/search")
    public ResponseEntity<Page<FeedResponse>> searchFeeds(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching feeds with query: {}, page: {}, size: {}", query, page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.searchFeeds(query, page, size);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error searching feeds: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Count feeds by user
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> countFeedsByUser(@PathVariable String userId) {
        log.info("Counting feeds for user: {}", userId);
        
        try {
            long count = feedService.countFeedsByUser(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error counting feeds for user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Delete feed
    @DeleteMapping("/{feedId}")
    public ResponseEntity<Void> deleteFeed(
            @PathVariable String feedId,
            Authentication authentication) {
        
        log.info("Deleting feed: {}", feedId);
        
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            feedService.deleteFeed(feedId, authenticatedUserId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting feed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Upload single image
    @PostMapping("/upload/image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        log.info("Uploading image file: {}", file.getOriginalFilename());
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            ImageMetadata imageMetadata = fileStorageService.storeFile(file, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageId", imageMetadata.getId());
            response.put("imageUrl", imageMetadata.getImageUrl());
            response.put("originalFileName", imageMetadata.getOriginalFileName());
            response.put("fileSize", imageMetadata.getFileSize());
            response.put("mimeType", imageMetadata.getMimeType());
            
            log.info("Image uploaded successfully with ID: {}", imageMetadata.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Upload multiple images
    @PostMapping("/upload/images")
    public ResponseEntity<Map<String, Object>> uploadImages(
            @RequestParam("files") MultipartFile[] files,
            Authentication authentication) {
        
        log.info("Uploading {} image files", files.length);
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            List<ImageMetadata> imageMetadataList = fileStorageService.storeFiles(files, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageCount", imageMetadataList.size());
            response.put("images", imageMetadataList.stream().map(metadata -> {
                Map<String, Object> imageInfo = new HashMap<>();
                imageInfo.put("imageId", metadata.getId());
                imageInfo.put("imageUrl", metadata.getImageUrl());
                imageInfo.put("originalFileName", metadata.getOriginalFileName());
                imageInfo.put("fileSize", metadata.getFileSize());
                imageInfo.put("mimeType", metadata.getMimeType());
                return imageInfo;
            }).toList());
            
            log.info("Successfully uploaded {} images", imageMetadataList.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error uploading images: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Get image by ID
    @GetMapping("/images/{imageId}")
    public ResponseEntity<Resource> getImage(@PathVariable String imageId) {
        log.info("Getting image with ID: {}", imageId);
        
        try {
            ImageMetadata imageMetadata = fileStorageService.getImageMetadata(imageId);
            Path imagePath = fileStorageService.getImagePath(imageId);
            
            Resource resource = new UrlResource(imagePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(imageMetadata.getMimeType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imageMetadata.getOriginalFileName() + "\"")
                        .body(resource);
            } else {
                log.error("Image file not found or not readable: {}", imagePath);
                return ResponseEntity.notFound().build();
            }
            
        } catch (MalformedURLException e) {
            log.error("Error creating URL resource for image: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting image: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
    
    // Delete image
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable String imageId,
            Authentication authentication) {
        
        log.info("Deleting image with ID: {}", imageId);
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            fileStorageService.deleteImage(imageId, userId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("Error deleting image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get user's images
    @GetMapping("/user/{userId}/images")
    public ResponseEntity<List<Map<String, Object>>> getUserImages(@PathVariable String userId) {
        log.info("Getting images for user: {}", userId);
        
        try {
            List<ImageMetadata> imageMetadataList = fileStorageService.getUserImages(userId);
            
            List<Map<String, Object>> images = imageMetadataList.stream().map(metadata -> {
                Map<String, Object> imageInfo = new HashMap<>();
                imageInfo.put("imageId", metadata.getId());
                imageInfo.put("imageUrl", metadata.getImageUrl());
                imageInfo.put("originalFileName", metadata.getOriginalFileName());
                imageInfo.put("fileSize", metadata.getFileSize());
                imageInfo.put("mimeType", metadata.getMimeType());
                imageInfo.put("createdAt", metadata.getCreatedAt());
                return imageInfo;
            }).toList();
            
            return ResponseEntity.ok(images);
            
        } catch (Exception e) {
            log.error("Error getting user images: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Helper method to extract user ID from JWT token
    private String getUserIdFromAuthentication(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("userId");
        }
        throw new RuntimeException("Unable to extract user ID from authentication");
    }
}