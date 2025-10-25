package com.bharathva.feed.service;

import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.repository.ImageMetadataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for handling image uploads to Cloudinary and storing metadata in MongoDB
 */
@Service
public class ImageUploadService {
    
    private static final Logger log = LoggerFactory.getLogger(ImageUploadService.class);
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Autowired
    private ImageMetadataRepository imageMetadataRepository;
    
    /**
     * Upload a single image to Cloudinary and store metadata in MongoDB
     */
    @Transactional
    public ImageMetadata uploadAndStoreImage(MultipartFile file, String userId) throws IOException {
        log.info("Uploading and storing image for user: {}, filename: {}", userId, file.getOriginalFilename());
        
        // Upload to Cloudinary
        Map<String, Object> cloudinaryResult = cloudinaryService.uploadImage(file, userId);
        
        // Create ImageMetadata object
        ImageMetadata imageMetadata = new ImageMetadata();
        imageMetadata.setUserId(userId);
        imageMetadata.setOriginalFileName(file.getOriginalFilename());
        imageMetadata.setStoredFileName(file.getOriginalFilename()); // Keep original name for Cloudinary
        imageMetadata.setFilePath("cloudinary://" + cloudinaryResult.get("publicId")); // Virtual path
        imageMetadata.setFileSize(file.getSize());
        imageMetadata.setMimeType(file.getContentType());
        
        // Set Cloudinary-specific fields
        imageMetadata.setCloudinaryPublicId((String) cloudinaryResult.get("publicId"));
        imageMetadata.setCloudinaryUrl((String) cloudinaryResult.get("url"));
        imageMetadata.setCloudinarySecureUrl((String) cloudinaryResult.get("imageUrl"));
        imageMetadata.setCloudinaryFormat((String) cloudinaryResult.get("format"));
        imageMetadata.setCloudinaryBytes((Long) cloudinaryResult.get("bytes"));
        imageMetadata.setCloudinaryFolder("bharathva/feeds/" + userId);
        imageMetadata.setIsCloudinaryUploaded(true);
        
        // Set dimensions if available
        if (cloudinaryResult.get("width") != null) {
            imageMetadata.setWidth((Integer) cloudinaryResult.get("width"));
        }
        if (cloudinaryResult.get("height") != null) {
            imageMetadata.setHeight((Integer) cloudinaryResult.get("height"));
        }
        
        // Save to MongoDB
        ImageMetadata savedMetadata = imageMetadataRepository.save(imageMetadata);
        
        log.info("Image uploaded and stored successfully with ID: {} and Cloudinary public ID: {}", 
                savedMetadata.getId(), savedMetadata.getCloudinaryPublicId());
        
        return savedMetadata;
    }
    
    /**
     * Upload multiple images to Cloudinary and store metadata in MongoDB
     */
    @Transactional
    public List<ImageMetadata> uploadAndStoreImages(MultipartFile[] files, String userId) throws IOException {
        log.info("Uploading and storing {} images for user: {}", files.length, userId);
        
        List<ImageMetadata> savedImages = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                ImageMetadata imageMetadata = uploadAndStoreImage(file, userId);
                savedImages.add(imageMetadata);
            }
        }
        
        log.info("Successfully uploaded and stored {} images for user: {}", savedImages.size(), userId);
        return savedImages;
    }
    
    /**
     * Get image metadata by ID
     */
    public ImageMetadata getImageMetadata(String imageId) {
        return imageMetadataRepository.findById(imageId).orElse(null);
    }
    
    /**
     * Get all images for a user
     */
    public List<ImageMetadata> getUserImages(String userId) {
        return imageMetadataRepository.findByUserId(userId);
    }
    
    /**
     * Delete image from both Cloudinary and MongoDB
     */
    @Transactional
    public boolean deleteImage(String imageId) {
        try {
            ImageMetadata imageMetadata = imageMetadataRepository.findById(imageId).orElse(null);
            if (imageMetadata == null) {
                log.warn("Image metadata not found for ID: {}", imageId);
                return false;
            }
            
            // Delete from Cloudinary if it was uploaded there
            if (imageMetadata.getIsCloudinaryUploaded() && imageMetadata.getCloudinaryPublicId() != null) {
                cloudinaryService.deleteImage(imageMetadata.getCloudinaryPublicId());
                log.info("Image deleted from Cloudinary: {}", imageMetadata.getCloudinaryPublicId());
            }
            
            // Delete from MongoDB
            imageMetadataRepository.deleteById(imageId);
            log.info("Image metadata deleted from MongoDB: {}", imageId);
            
            return true;
            
        } catch (Exception e) {
            log.error("Error deleting image: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Get image URL (Cloudinary or local)
     */
    public String getImageUrl(String imageId) {
        ImageMetadata imageMetadata = imageMetadataRepository.findById(imageId).orElse(null);
        if (imageMetadata == null) {
            return null;
        }
        return imageMetadata.getImageUrl();
    }
    
    /**
     * Update image metadata
     */
    @Transactional
    public ImageMetadata updateImageMetadata(ImageMetadata imageMetadata) {
        imageMetadata.updateTimestamp();
        return imageMetadataRepository.save(imageMetadata);
    }
}
