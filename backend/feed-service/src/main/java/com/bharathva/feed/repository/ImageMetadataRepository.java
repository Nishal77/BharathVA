package com.bharathva.feed.repository;

import com.bharathva.feed.model.ImageMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ImageMetadata operations
 */
@Repository
public interface ImageMetadataRepository extends MongoRepository<ImageMetadata, String> {
    
    /**
     * Find images by user ID
     */
    Page<ImageMetadata> findByUserId(String userId, Pageable pageable);
    
    /**
     * Find images by user ID ordered by creation date descending
     */
    List<ImageMetadata> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find image by stored file name
     */
    Optional<ImageMetadata> findByStoredFileName(String storedFileName);
    
    /**
     * Find images by user ID and file path
     */
    List<ImageMetadata> findByUserIdAndFilePath(String userId, String filePath);
    
    /**
     * Count images by user ID
     */
    long countByUserId(String userId);
    
    /**
     * Find images by MIME type
     */
    @Query("{'mimeType': {$regex: '^image/', $options: 'i'}}")
    List<ImageMetadata> findImageFiles();
    
    /**
     * Find images by user ID and MIME type
     */
    @Query("{'userId': ?0, 'mimeType': {$regex: '^image/', $options: 'i'}}")
    List<ImageMetadata> findImageFilesByUserId(String userId);
    
    /**
     * Delete images by user ID
     */
    void deleteByUserId(String userId);
}
