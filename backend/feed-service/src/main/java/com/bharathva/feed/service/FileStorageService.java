package com.bharathva.feed.service;

import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.repository.ImageMetadataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling file storage operations
 */
@Service
public class FileStorageService {
    
    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    
    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${app.file.max-size:10485760}")
    private long maxFileSize; // 10MB default
    
    @Value("${app.file.allowed-types:image/jpeg,image/png,image/gif,image/webp}")
    private String allowedTypes;
    
    @Autowired
    private ImageMetadataRepository imageMetadataRepository;
    
    /**
     * Store a single file and return image metadata
     */
    public ImageMetadata storeFile(MultipartFile file, String userId) throws IOException {
        log.info("Storing file for user: {}, filename: {}", userId, file.getOriginalFilename());
        
        // Validate file
        validateFile(file);
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String storedFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Store file
        Path targetLocation = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        log.info("File stored successfully: {}", targetLocation.toAbsolutePath());
        
        // Create and save image metadata
        ImageMetadata imageMetadata = new ImageMetadata();
        imageMetadata.setUserId(userId);
        imageMetadata.setOriginalFileName(originalFilename);
        imageMetadata.setStoredFileName(storedFilename);
        imageMetadata.setFilePath(targetLocation.toString());
        imageMetadata.setFileSize(file.getSize());
        imageMetadata.setMimeType(file.getContentType());
        
        ImageMetadata savedMetadata = imageMetadataRepository.save(imageMetadata);
        log.info("Image metadata saved with ID: {}", savedMetadata.getId());
        
        return savedMetadata;
    }
    
    /**
     * Store multiple files and return list of image metadata
     */
    public List<ImageMetadata> storeFiles(MultipartFile[] files, String userId) throws IOException {
        log.info("Storing {} files for user: {}", files.length, userId);
        
        List<ImageMetadata> imageMetadataList = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                ImageMetadata imageMetadata = storeFile(file, userId);
                imageMetadataList.add(imageMetadata);
            }
        }
        
        log.info("Successfully stored {} files for user: {}", imageMetadataList.size(), userId);
        return imageMetadataList;
    }
    
    /**
     * Get image metadata by ID
     */
    public ImageMetadata getImageMetadata(String imageId) {
        log.info("Getting image metadata for ID: {}", imageId);
        return imageMetadataRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + imageId));
    }
    
    /**
     * Get image file path by ID
     */
    public Path getImagePath(String imageId) {
        ImageMetadata imageMetadata = getImageMetadata(imageId);
        return Paths.get(imageMetadata.getFilePath());
    }
    
    /**
     * Delete image and its metadata
     */
    public void deleteImage(String imageId, String userId) {
        log.info("Deleting image: {} for user: {}", imageId, userId);
        
        ImageMetadata imageMetadata = getImageMetadata(imageId);
        
        // Check if user owns the image
        if (!imageMetadata.getUserId().equals(userId)) {
            throw new RuntimeException("User " + userId + " is not authorized to delete image " + imageId);
        }
        
        try {
            // Delete physical file
            Path filePath = Paths.get(imageMetadata.getFilePath());
            Files.deleteIfExists(filePath);
            
            // Delete metadata
            imageMetadataRepository.delete(imageMetadata);
            
            log.info("Image deleted successfully: {}", imageId);
        } catch (IOException e) {
            log.error("Error deleting image file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete image file", e);
        }
    }
    
    /**
     * Get user's images
     */
    public List<ImageMetadata> getUserImages(String userId) {
        log.info("Getting images for user: {}", userId);
        return imageMetadataRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Validate file before storage
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size: " + maxFileSize + " bytes");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedContentType(contentType)) {
            throw new RuntimeException("File type not allowed: " + contentType);
        }
    }
    
    /**
     * Check if content type is allowed
     */
    private boolean isAllowedContentType(String contentType) {
        String[] allowedTypesArray = allowedTypes.split(",");
        for (String allowedType : allowedTypesArray) {
            if (contentType.trim().equals(allowedType.trim())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return "";
    }
    
    /**
     * Get upload directory path
     */
    public String getUploadDir() {
        return uploadDir;
    }
    
    /**
     * Get maximum file size
     */
    public long getMaxFileSize() {
        return maxFileSize;
    }
    
    /**
     * Get allowed file types
     */
    public String getAllowedTypes() {
        return allowedTypes;
    }
}
