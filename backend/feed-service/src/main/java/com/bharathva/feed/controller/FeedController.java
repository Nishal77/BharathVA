package com.bharathva.feed.controller;

import com.bharathva.feed.dto.CreateCommentRequest;
import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.service.FeedService;
import com.bharathva.feed.service.CloudinaryService;
import com.bharathva.feed.service.ImageUploadService;
import com.bharathva.feed.model.ImageMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.ArrayList;
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
    private CloudinaryService cloudinaryService;
    
    @Autowired
    private ImageUploadService imageUploadService;
    
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
    
    // Cloudinary test endpoint
    @GetMapping("/test/cloudinary")
    public ResponseEntity<Map<String, Object>> testCloudinary() {
        log.info("Cloudinary test requested");
        
        try {
            Map<String, Object> testResult = cloudinaryService.testConnection();
            return ResponseEntity.ok(testResult);
        } catch (Exception e) {
            log.error("Error testing Cloudinary: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.Instant.now().toString());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Test endpoint for creating feed without authentication (for testing only)
    @PostMapping("/test/create-feed")
    public ResponseEntity<Map<String, Object>> testCreateFeed(@RequestBody Map<String, Object> request) {
        log.info("Test feed creation requested");
        
        try {
            String userId = (String) request.get("userId");
            String message = (String) request.get("message");
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) request.get("imageUrls");
            
            if (userId == null || message == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "userId and message are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Create feed request
            CreateFeedRequest createRequest = new CreateFeedRequest();
            createRequest.setUserId(userId);
            createRequest.setMessage(message);
            if (imageUrls != null) {
                createRequest.setImageUrls(imageUrls);
            }
            
            // Create feed
            FeedResponse feedResponse = feedService.createFeed(createRequest, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Feed created successfully");
            response.put("feed", feedResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating test feed: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Test endpoint for getting feed without authentication (for testing only)
    @GetMapping("/test/feed/{feedId}")
    public ResponseEntity<Map<String, Object>> testGetFeed(@PathVariable String feedId) {
        log.info("Test feed retrieval requested for ID: {}", feedId);
        
        try {
            FeedResponse feedResponse = feedService.getFeedById(feedId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Feed retrieved successfully");
            response.put("feed", feedResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving test feed: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Test endpoint for getting user feeds without pagination (for debugging)
    @GetMapping("/test/user/{userId}/feeds")
    public ResponseEntity<Map<String, Object>> testGetUserFeeds(@PathVariable String userId) {
        log.info("Test user feeds retrieval requested for user: {}", userId);
        
        try {
            List<FeedResponse> feeds = feedService.getUserFeedsList(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User feeds retrieved successfully");
            response.put("feeds", feeds);
            response.put("count", feeds.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving test user feeds: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Test endpoint for getting user feeds with pagination (for debugging)
    @GetMapping("/test/user/{userId}/feeds-paginated")
    public ResponseEntity<Map<String, Object>> testGetUserFeedsPaginated(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Test paginated user feeds retrieval requested for user: {}, page: {}, size: {}", userId, page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.getUserFeeds(userId, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User feeds retrieved successfully");
            response.put("feeds", feeds.getContent());
            response.put("totalElements", feeds.getTotalElements());
            response.put("totalPages", feeds.getTotalPages());
            response.put("currentPage", feeds.getNumber());
            response.put("size", feeds.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving test paginated user feeds: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("stackTrace", e.getStackTrace());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Test endpoint for deleting a feed (for debugging)
    @DeleteMapping("/test/delete-feed/{feedId}")
    public ResponseEntity<Map<String, Object>> testDeleteFeed(
            @PathVariable String feedId,
            @RequestParam String userId) {
        log.info("Test feed deletion requested for feed: {} by user: {}", feedId, userId);
        
        try {
            feedService.deleteFeed(feedId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Feed deleted successfully");
            response.put("feedId", feedId);
            response.put("userId", userId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error deleting test feed: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("stackTrace", e.getStackTrace());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
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
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        log.info("Getting all feeds, page: {}, size: {}", page, size);
        
        try {
            // Extract authenticated user ID if available (optional for public feeds)
            String currentUserId = null;
            if (authentication != null && authentication.isAuthenticated()) {
                try {
                    currentUserId = getUserIdFromAuthentication(authentication);
                    log.info("Authenticated user ID for feed context: {}", currentUserId);
                } catch (Exception e) {
                    log.warn("Could not extract user ID from authentication, proceeding without user context: {}", e.getMessage());
                }
            }
            
            Page<FeedResponse> feeds = feedService.getAllFeeds(page, size, currentUserId);
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
            log.info("Successfully retrieved {} feeds for user {}", feeds.getTotalElements(), userId);
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
        
        log.info("Uploading image file to Cloudinary and storing metadata: {}", file.getOriginalFilename());
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            ImageMetadata imageMetadata = imageUploadService.uploadAndStoreImage(file, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageId", imageMetadata.getId());
            response.put("publicId", imageMetadata.getCloudinaryPublicId());
            response.put("imageUrl", imageMetadata.getCloudinarySecureUrl());
            response.put("url", imageMetadata.getCloudinarySecureUrl()); // For mobile compatibility
            response.put("originalFileName", imageMetadata.getOriginalFileName());
            response.put("fileSize", imageMetadata.getFileSize());
            response.put("mimeType", imageMetadata.getMimeType());
            response.put("width", imageMetadata.getWidth());
            response.put("height", imageMetadata.getHeight());
            response.put("cloudinaryFormat", imageMetadata.getCloudinaryFormat());
            response.put("cloudinaryBytes", imageMetadata.getCloudinaryBytes());
            
            log.info("Image uploaded and stored successfully with ID: {} and Cloudinary public ID: {}", 
                    imageMetadata.getId(), imageMetadata.getCloudinaryPublicId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error uploading image to Cloudinary and storing metadata: {}", e.getMessage(), e);
            
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
        
        log.info("Uploading {} image files to Cloudinary and storing metadata", files.length);
        
        try {
            // Validate files
            if (files == null || files.length == 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "No files provided");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check file count limit
            if (files.length > 10) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Maximum 10 images allowed per upload");
                return ResponseEntity.badRequest().body(response);
            }
            
            String userId = getUserIdFromAuthentication(authentication);
            List<ImageMetadata> uploadedImages = imageUploadService.uploadAndStoreImages(files, userId);
            
            // Convert to response format
            List<Map<String, Object>> imageResponses = new ArrayList<>();
            for (ImageMetadata imageMetadata : uploadedImages) {
                Map<String, Object> imageResponse = new HashMap<>();
                imageResponse.put("imageId", imageMetadata.getId());
                imageResponse.put("publicId", imageMetadata.getCloudinaryPublicId());
                imageResponse.put("imageUrl", imageMetadata.getCloudinarySecureUrl());
                imageResponse.put("url", imageMetadata.getCloudinarySecureUrl()); // For mobile compatibility
                imageResponse.put("originalFileName", imageMetadata.getOriginalFileName());
                imageResponse.put("fileSize", imageMetadata.getFileSize());
                imageResponse.put("mimeType", imageMetadata.getMimeType());
                imageResponse.put("width", imageMetadata.getWidth());
                imageResponse.put("height", imageMetadata.getHeight());
                imageResponse.put("cloudinaryFormat", imageMetadata.getCloudinaryFormat());
                imageResponse.put("cloudinaryBytes", imageMetadata.getCloudinaryBytes());
                imageResponses.add(imageResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageCount", uploadedImages.size());
            response.put("images", imageResponses);
            response.put("message", "Images uploaded and stored successfully");
            
            log.info("Successfully uploaded and stored {} images", uploadedImages.size());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error uploading images: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("Error uploading images to Cloudinary and storing metadata: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to upload images: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Upload image with custom transformations
    @PostMapping("/upload/image/transform")
    public ResponseEntity<Map<String, Object>> uploadImageWithTransformations(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "width", defaultValue = "1200") int width,
            @RequestParam(value = "height", defaultValue = "1200") int height,
            @RequestParam(value = "crop", defaultValue = "limit") String crop,
            Authentication authentication) {
        
        log.info("Uploading image with transformations to Cloudinary: {}", file.getOriginalFilename());
        
        try {
            String userId = getUserIdFromAuthentication(authentication);
            
            // Create transformation map
            Map<String, Object> transformations = new HashMap<>();
            transformations.put("width", width);
            transformations.put("height", height);
            transformations.put("crop", crop);
            transformations.put("quality", "auto:good");
            transformations.put("format", "auto");
            
            Map<String, Object> uploadResult = cloudinaryService.uploadImageWithTransformations(file, userId, transformations);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("publicId", uploadResult.get("publicId"));
            response.put("imageUrl", uploadResult.get("url"));
            response.put("originalFileName", uploadResult.get("originalFileName"));
            response.put("fileSize", uploadResult.get("fileSize"));
            response.put("mimeType", uploadResult.get("mimeType"));
            response.put("width", uploadResult.get("width"));
            response.put("height", uploadResult.get("height"));
            response.put("format", uploadResult.get("format"));
            response.put("bytes", uploadResult.get("bytes"));
            response.put("transformations", transformations);
            
            log.info("Image uploaded successfully with transformations to Cloudinary with public ID: {}", uploadResult.get("publicId"));
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error uploading image: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("Error uploading image to Cloudinary: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to upload image: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Generate optimized image URL
    @GetMapping("/images/{publicId}/url")
    public ResponseEntity<Map<String, Object>> generateOptimizedUrl(
            @PathVariable String publicId,
            @RequestParam(value = "width", defaultValue = "800") int width,
            @RequestParam(value = "height", defaultValue = "600") int height,
            @RequestParam(value = "crop", defaultValue = "limit") String crop) {
        
        log.info("Generating optimized URL for public ID: {}", publicId);
        
        try {
            String optimizedUrl = cloudinaryService.generateOptimizedUrl(publicId, width, height, crop);
            
            if (optimizedUrl == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Failed to generate optimized URL");
                return ResponseEntity.badRequest().body(response);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("publicId", publicId);
            response.put("optimizedUrl", optimizedUrl);
            response.put("transformations", Map.of(
                "width", width,
                "height", height,
                "crop", crop
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating optimized URL: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to generate optimized URL: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Delete image from Cloudinary
    @DeleteMapping("/images/{publicId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable String publicId,
            Authentication authentication) {
        
        log.info("Deleting image from Cloudinary with public ID: {}", publicId);
        
        try {
            cloudinaryService.deleteImage(publicId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get recent feeds (last 24 hours)
    @GetMapping("/recent")
    public ResponseEntity<Page<FeedResponse>> getRecentFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting recent feeds, page: {}, size: {}", page, size);
        
        try {
            Page<FeedResponse> feeds = feedService.getRecentFeeds(page, size);
            return ResponseEntity.ok(feeds);
        } catch (Exception e) {
            log.error("Error getting recent feeds: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get feed statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getFeedStatistics() {
        log.info("Getting feed statistics");
        
        try {
            Map<String, Object> stats = feedService.getFeedStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting feed statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Toggle like on a feed
    @PostMapping("/{feedId}/like")
    public ResponseEntity<FeedResponse> toggleLike(
            @PathVariable String feedId,
            Authentication authentication) {
        
        log.info("Toggling like for feed: {}", feedId);
        
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            FeedResponse response = feedService.toggleLike(feedId, authenticatedUserId);
            
            // Log the response to verify likes array is included
            log.info("Like toggled successfully for feed: {} by user: {}", feedId, authenticatedUserId);
            log.info("FeedResponse contains {} likes: {}", response.getLikesCount(), response.getLikes());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error toggling like: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error toggling like: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Check if user has liked a feed
    @GetMapping("/{feedId}/liked")
    public ResponseEntity<Map<String, Object>> checkUserLiked(
            @PathVariable String feedId,
            Authentication authentication) {
        
        log.info("Checking if user liked feed: {}", feedId);
        
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            boolean hasLiked = feedService.hasUserLiked(feedId, authenticatedUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("feedId", feedId);
            response.put("userId", authenticatedUserId);
            response.put("liked", hasLiked);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error checking like status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error checking like status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Test image upload without authentication (for testing purposes)
    @PostMapping("/test/upload/image")
    public ResponseEntity<Map<String, Object>> testUploadImage(@RequestParam("file") MultipartFile file) {
        log.info("Testing image upload to Cloudinary: {}", file.getOriginalFilename());
        
        try {
            // Use a test user ID
            String testUserId = "test-user-123";
            ImageMetadata imageMetadata = imageUploadService.uploadAndStoreImage(file, testUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageId", imageMetadata.getId());
            response.put("publicId", imageMetadata.getCloudinaryPublicId());
            response.put("imageUrl", imageMetadata.getCloudinarySecureUrl());
            response.put("url", imageMetadata.getCloudinarySecureUrl());
            response.put("originalFileName", imageMetadata.getOriginalFileName());
            response.put("fileSize", imageMetadata.getFileSize());
            response.put("mimeType", imageMetadata.getMimeType());
            response.put("width", imageMetadata.getWidth());
            response.put("height", imageMetadata.getHeight());
            response.put("cloudinaryFormat", imageMetadata.getCloudinaryFormat());
            response.put("cloudinaryBytes", imageMetadata.getCloudinaryBytes());
            
            log.info("Test image uploaded and stored successfully with ID: {} and Cloudinary public ID: {}", 
                    imageMetadata.getId(), imageMetadata.getCloudinaryPublicId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error testing image upload to Cloudinary: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Add comment to a feed
    @PostMapping("/{feedId}/comment")
    public ResponseEntity<FeedResponse> addComment(
            @PathVariable String feedId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        
        log.info("Adding comment to feed: {}", feedId);
        
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            FeedResponse response = feedService.addComment(feedId, authenticatedUserId, request);
            log.info("Comment added successfully to feed: {}", feedId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error adding comment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error adding comment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Delete comment from a feed
    @DeleteMapping("/{feedId}/comment/{commentIndex}")
    public ResponseEntity<FeedResponse> deleteComment(
            @PathVariable String feedId,
            @PathVariable int commentIndex,
            Authentication authentication) {
        
        log.info("Deleting comment at index {} from feed: {}", commentIndex, feedId);
        
        try {
            String authenticatedUserId = getUserIdFromAuthentication(authentication);
            FeedResponse response = feedService.deleteComment(feedId, authenticatedUserId, commentIndex);
            log.info("Comment deleted successfully from feed: {}", feedId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting comment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error deleting comment: {}", e.getMessage(), e);
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