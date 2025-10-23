package com.bharathva.feed.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Image metadata model for BharathVA
 * Stores image information including file path, size, type, and user association
 */
@Document(collection = "image_metadata")
public class ImageMetadata {
    
    @Id
    private String id; // MongoDB will auto-generate UUID
    
    @Field("userId")
    @Indexed
    private String userId;
    
    @Field("originalFileName")
    private String originalFileName;
    
    @Field("storedFileName")
    private String storedFileName;
    
    @Field("filePath")
    private String filePath;
    
    @Field("fileSize")
    private Long fileSize;
    
    @Field("mimeType")
    private String mimeType;
    
    @Field("width")
    private Integer width;
    
    @Field("height")
    private Integer height;
    
    @Field("createdAt")
    @Indexed
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ImageMetadata() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public ImageMetadata(String userId, String originalFileName, String storedFileName, 
                        String filePath, Long fileSize, String mimeType) {
        this();
        this.userId = userId;
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getOriginalFileName() {
        return originalFileName;
    }
    
    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }
    
    public String getStoredFileName() {
        return storedFileName;
    }
    
    public void setStoredFileName(String storedFileName) {
        this.storedFileName = storedFileName;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getMimeType() {
        return mimeType;
    }
    
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
    
    public Integer getWidth() {
        return width;
    }
    
    public void setWidth(Integer width) {
        this.width = width;
    }
    
    public Integer getHeight() {
        return height;
    }
    
    public void setHeight(Integer height) {
        this.height = height;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Utility methods
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getImageUrl() {
        return "/api/feed/images/" + this.id;
    }
    
    public boolean isImage() {
        return mimeType != null && mimeType.startsWith("image/");
    }
    
    public String getFileExtension() {
        if (originalFileName != null && originalFileName.contains(".")) {
            return originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return "";
    }
    
    @Override
    public String toString() {
        return "ImageMetadata{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", originalFileName='" + originalFileName + '\'' +
                ", storedFileName='" + storedFileName + '\'' +
                ", filePath='" + filePath + '\'' +
                ", fileSize=" + fileSize +
                ", mimeType='" + mimeType + '\'' +
                ", width=" + width +
                ", height=" + height +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
