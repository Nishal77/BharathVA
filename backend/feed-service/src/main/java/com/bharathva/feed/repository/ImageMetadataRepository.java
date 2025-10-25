package com.bharathva.feed.repository;

import com.bharathva.feed.model.ImageMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ImageMetadata operations
 */
@Repository
public interface ImageMetadataRepository extends MongoRepository<ImageMetadata, String> {
    
    /**
     * Find all images for a specific user
     */
    List<ImageMetadata> findByUserId(String userId);
    
    /**
     * Find images by user ID ordered by creation date descending
     */
    List<ImageMetadata> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find image files by user ID (alias for findByUserId for backward compatibility)
     */
    List<ImageMetadata> findImageFilesByUserId(String userId);
    
    /**
     * Find images by Cloudinary public ID
     */
    ImageMetadata findByCloudinaryPublicId(String cloudinaryPublicId);
    
    /**
     * Find images that are uploaded to Cloudinary
     */
    List<ImageMetadata> findByIsCloudinaryUploaded(Boolean isCloudinaryUploaded);
    
    /**
     * Find images by user ID and Cloudinary upload status
     */
    List<ImageMetadata> findByUserIdAndIsCloudinaryUploaded(String userId, Boolean isCloudinaryUploaded);
    
    /**
     * Count images by user ID
     */
    long countByUserId(String userId);
    
    /**
     * Find images by MIME type
     */
    List<ImageMetadata> findByMimeType(String mimeType);
    
    /**
     * Find images by user ID and MIME type
     */
    List<ImageMetadata> findByUserIdAndMimeType(String userId, String mimeType);
    
    /**
     * Find images created after a specific date
     */
    @Query("{ 'userId': ?0, 'createdAt': { $gte: ?1 } }")
    List<ImageMetadata> findByUserIdAndCreatedAtAfter(String userId, java.time.LocalDateTime createdAt);
    
    /**
     * Find images with file size greater than specified value
     */
    @Query("{ 'userId': ?0, 'fileSize': { $gte: ?1 } }")
    List<ImageMetadata> findByUserIdAndFileSizeGreaterThan(String userId, Long fileSize);
    
    /**
     * Find images by Cloudinary folder
     */
    List<ImageMetadata> findByCloudinaryFolder(String cloudinaryFolder);
    
    /**
     * Delete images by user ID
     */
    void deleteByUserId(String userId);
    
    /**
     * Delete images that are not uploaded to Cloudinary (cleanup)
     */
    void deleteByIsCloudinaryUploaded(Boolean isCloudinaryUploaded);
}