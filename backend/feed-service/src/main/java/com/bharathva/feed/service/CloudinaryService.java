package com.bharathva.feed.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for handling Cloudinary image uploads
 */
@Service
public class CloudinaryService {
    
    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    
    @Value("${cloudinary.api-key}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    private Cloudinary cloudinary;
    
    /**
     * Initialize Cloudinary instance
     */
    private Cloudinary getCloudinary() {
        if (cloudinary == null) {
            log.info("Initializing Cloudinary with config - Cloud Name: {}, API Key: {}", cloudName, apiKey);
            
            // Validate configuration
            if (cloudName == null || cloudName.trim().isEmpty()) {
                throw new RuntimeException("Cloudinary cloud name is not configured");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Cloudinary API key is not configured");
            }
            if (apiSecret == null || apiSecret.trim().isEmpty()) {
                throw new RuntimeException("Cloudinary API secret is not configured");
            }
            
            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", cloudName);
            config.put("api_key", apiKey);
            config.put("api_secret", apiSecret);
            cloudinary = new Cloudinary(config);
            
            log.info("Cloudinary initialized successfully");
        }
        return cloudinary;
    }
    
    /**
     * Upload a single image to Cloudinary
     */
    public Map<String, Object> uploadImage(MultipartFile file, String userId) throws IOException {
        log.info("Uploading image to Cloudinary for user: {}, filename: {}", userId, file.getOriginalFilename());
        
        // Validate file
        validateFile(file);
        
        try {
            // Upload to Cloudinary with basic optimization
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = getCloudinary().uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "bharathva/feeds/" + userId,
                    "public_id", generatePublicId(file.getOriginalFilename()),
                    "resource_type", "auto",
                    "quality", "auto:good",
                    "fetch_format", "auto"
                )
            );
            
            log.info("Image uploaded successfully to Cloudinary: {}", uploadResult.get("public_id"));
            
            // Return simplified response
            Map<String, Object> response = new HashMap<>();
            response.put("publicId", uploadResult.get("public_id"));
            response.put("imageId", uploadResult.get("public_id")); // Add imageId for mobile compatibility
            response.put("url", uploadResult.get("secure_url"));
            response.put("imageUrl", uploadResult.get("secure_url")); // Add imageUrl for mobile compatibility
            response.put("originalFileName", file.getOriginalFilename());
            response.put("fileSize", file.getSize());
            response.put("mimeType", file.getContentType());
            response.put("width", uploadResult.get("width"));
            response.put("height", uploadResult.get("height"));
            
            return response;
            
        } catch (Exception e) {
            log.error("Error uploading image to Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Failed to upload image to Cloudinary: " + e.getMessage(), e);
        }
    }
    
    /**
     * Upload multiple images to Cloudinary
     */
    public List<Map<String, Object>> uploadImages(MultipartFile[] files, String userId) throws IOException {
        log.info("Uploading {} images to Cloudinary for user: {}", files.length, userId);
        
        List<Map<String, Object>> uploadResults = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                Map<String, Object> uploadResult = uploadImage(file, userId);
                uploadResults.add(uploadResult);
            }
        }
        
        log.info("Successfully uploaded {} images to Cloudinary for user: {}", uploadResults.size(), userId);
        return uploadResults;
    }
    
    /**
     * Delete an image from Cloudinary
     */
    public void deleteImage(String publicId) throws IOException {
        log.info("Deleting image from Cloudinary: {}", publicId);
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> deleteResult = getCloudinary().uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted from Cloudinary: {}, result: {}", publicId, deleteResult.get("result"));
        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Failed to delete image from Cloudinary: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generate a unique public ID for the image
     */
    private String generatePublicId(String originalFilename) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomSuffix = String.valueOf((int) (Math.random() * 10000));
        
        if (originalFilename != null && originalFilename.contains(".")) {
            String nameWithoutExtension = originalFilename.substring(0, originalFilename.lastIndexOf("."));
            return nameWithoutExtension + "_" + timestamp + "_" + randomSuffix;
        }
        
        return "image_" + timestamp + "_" + randomSuffix;
    }
    
    /**
     * Validate file before upload
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Check file size (50MB limit)
        long maxFileSize = 50 * 1024 * 1024; // 50MB
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size: 50MB");
        }
        
        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedContentType(contentType)) {
            String supportedTypes = "JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, HEIC, HEIF, AVIF, SVG";
            throw new IllegalArgumentException("File type not supported: " + contentType + 
                ". Supported formats: " + supportedTypes);
        }
    }
    
    /**
     * Check if content type is allowed
     */
    private boolean isAllowedContentType(String contentType) {
        String[] allowedTypes = {
            "image/jpeg", "image/jpg", "image/png", "image/gif", 
            "image/webp", "image/bmp", "image/tiff", "image/heic", 
            "image/heif", "image/avif", "image/svg+xml"
        };
        
        for (String allowedType : allowedTypes) {
            if (contentType.equals(allowedType)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Normalize content type for better compatibility
     */
    private String normalizeContentType(String contentType) {
        if (contentType == null) {
            return "image/jpeg"; // Default fallback
        }
        
        // Normalize common variations
        switch (contentType.toLowerCase()) {
            case "image/jpg":
                return "image/jpeg";
            case "image/heic":
            case "image/heif":
                // Cloudinary can handle HEIC/HEIF, but we'll keep the original type
                return contentType;
            default:
                return contentType;
        }
    }
    
    /**
     * Get Cloudinary configuration info
     */
    public Map<String, Object> getConfigInfo() {
        Map<String, Object> config = new HashMap<>();
        config.put("cloudName", cloudName);
        config.put("apiKey", apiKey);
        config.put("apiSecret", "***"); // Don't expose secret
        return config;
    }
    
    /**
     * Upload image with custom transformations
     */
    public Map<String, Object> uploadImageWithTransformations(MultipartFile file, String userId, Map<String, Object> transformations) throws IOException {
        log.info("Uploading image with custom transformations to Cloudinary for user: {}, filename: {}", userId, file.getOriginalFilename());
        
        // Validate file
        validateFile(file);
        
        try {
            // Merge default transformations with custom ones
            Map<String, Object> uploadOptions = new HashMap<>();
            uploadOptions.put("folder", "bharathva/feeds/" + userId);
            uploadOptions.put("public_id", generatePublicId(file.getOriginalFilename()));
            uploadOptions.put("resource_type", "auto");
            uploadOptions.put("quality", "auto");
            uploadOptions.put("fetch_format", "auto");
            
            // Add custom transformations if provided
            if (transformations != null && !transformations.isEmpty()) {
                // Apply transformations as individual parameters
                for (Map.Entry<String, Object> entry : transformations.entrySet()) {
                    uploadOptions.put(entry.getKey(), entry.getValue());
                }
            }
            
            // Upload to Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = getCloudinary().uploader().upload(
                file.getBytes(),
                uploadOptions
            );
            
            log.info("Image uploaded successfully to Cloudinary: {}", uploadResult.get("public_id"));
            
            // Return simplified response
            Map<String, Object> response = new HashMap<>();
            response.put("publicId", uploadResult.get("public_id"));
            response.put("imageId", uploadResult.get("public_id")); // Add imageId for mobile compatibility
            response.put("url", uploadResult.get("secure_url"));
            response.put("imageUrl", uploadResult.get("secure_url")); // Add imageUrl for mobile compatibility
            response.put("originalFileName", file.getOriginalFilename());
            response.put("fileSize", file.getSize());
            response.put("mimeType", file.getContentType());
            response.put("width", uploadResult.get("width"));
            response.put("height", uploadResult.get("height"));
            response.put("format", uploadResult.get("format"));
            response.put("bytes", uploadResult.get("bytes"));
            
            return response;
            
        } catch (Exception e) {
            log.error("Error uploading image to Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Failed to upload image to Cloudinary: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generate optimized image URL with transformations
     */
    public String generateOptimizedUrl(String publicId, int width, int height, String crop) {
        try {
            return getCloudinary().url()
                .transformation(new com.cloudinary.Transformation()
                    .width(width)
                    .height(height)
                    .crop(crop)
                    .quality("auto:good"))
                .generate(publicId);
        } catch (Exception e) {
            log.error("Error generating optimized URL: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Generate simple optimized URL
     */
    public String generateSimpleOptimizedUrl(String publicId) {
        try {
            return getCloudinary().url()
                .transformation(new com.cloudinary.Transformation()
                    .quality("auto:good"))
                .generate(publicId);
        } catch (Exception e) {
            log.error("Error generating simple optimized URL: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Test Cloudinary connectivity
     */
    public Map<String, Object> testConnection() {
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("Testing Cloudinary connection...");
            
            // Initialize Cloudinary
            Cloudinary cloudinaryInstance = getCloudinary();
            
            // Test with a simple API call
            @SuppressWarnings("unchecked")
            Map<String, Object> pingResult = cloudinaryInstance.api().ping(ObjectUtils.emptyMap());
            
            result.put("success", true);
            result.put("message", "Cloudinary connection successful");
            result.put("pingResult", pingResult);
            result.put("config", getConfigInfo());
            
            log.info("Cloudinary connection test successful");
            
        } catch (Exception e) {
            log.error("Cloudinary connection test failed: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Cloudinary connection failed: " + e.getMessage());
            result.put("config", getConfigInfo());
        }
        
        return result;
    }
}
