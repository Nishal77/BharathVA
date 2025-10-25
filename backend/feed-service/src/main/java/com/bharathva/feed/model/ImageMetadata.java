package com.bharathva.feed.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Stores image info including file path, size, type, and user association this is how itt works here
 */
@Document(collection = "image_metadata")
public class ImageMetadata {
    
    @Id
    private String id; // MongoDB will auto-generate UUID and so on
    
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
    
    // Cloudinary-specific fields
    @Field("cloudinaryPublicId")
    private String cloudinaryPublicId;
    
    @Field("cloudinaryUrl")
    private String cloudinaryUrl;
    
    @Field("cloudinarySecureUrl")
    private String cloudinarySecureUrl;
    
    @Field("cloudinaryFormat")
    private String cloudinaryFormat;
    
    @Field("cloudinaryBytes")
    private Long cloudinaryBytes;
    
    @Field("cloudinaryFolder")
    private String cloudinaryFolder;
    
    @Field("isCloudinaryUploaded")
    private Boolean isCloudinaryUploaded = false;
    
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
    
    // Cloudinary getters and setters
    public String getCloudinaryPublicId() {
        return cloudinaryPublicId;
    }
    
    public void setCloudinaryPublicId(String cloudinaryPublicId) {
        this.cloudinaryPublicId = cloudinaryPublicId;
    }
    
    public String getCloudinaryUrl() {
        return cloudinaryUrl;
    }
    
    public void setCloudinaryUrl(String cloudinaryUrl) {
        this.cloudinaryUrl = cloudinaryUrl;
    }
    
    public String getCloudinarySecureUrl() {
        return cloudinarySecureUrl;
    }
    
    public void setCloudinarySecureUrl(String cloudinarySecureUrl) {
        this.cloudinarySecureUrl = cloudinarySecureUrl;
    }
    
    public String getCloudinaryFormat() {
        return cloudinaryFormat;
    }
    
    public void setCloudinaryFormat(String cloudinaryFormat) {
        this.cloudinaryFormat = cloudinaryFormat;
    }
    
    public Long getCloudinaryBytes() {
        return cloudinaryBytes;
    }
    
    public void setCloudinaryBytes(Long cloudinaryBytes) {
        this.cloudinaryBytes = cloudinaryBytes;
    }
    
    public String getCloudinaryFolder() {
        return cloudinaryFolder;
    }
    
    public void setCloudinaryFolder(String cloudinaryFolder) {
        this.cloudinaryFolder = cloudinaryFolder;
    }
    
    public Boolean getIsCloudinaryUploaded() {
        return isCloudinaryUploaded;
    }
    
    public void setIsCloudinaryUploaded(Boolean isCloudinaryUploaded) {
        this.isCloudinaryUploaded = isCloudinaryUploaded;
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
        // Return Cloudinary URL if available, otherwise fallback to local URL
        if (isCloudinaryUploaded && cloudinarySecureUrl != null) {
            return cloudinarySecureUrl;
        }
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
                ", cloudinaryPublicId='" + cloudinaryPublicId + '\'' +
                ", cloudinaryUrl='" + cloudinaryUrl + '\'' +
                ", cloudinarySecureUrl='" + cloudinarySecureUrl + '\'' +
                ", cloudinaryFormat='" + cloudinaryFormat + '\'' +
                ", cloudinaryBytes=" + cloudinaryBytes +
                ", cloudinaryFolder='" + cloudinaryFolder + '\'' +
                ", isCloudinaryUploaded=" + isCloudinaryUploaded +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
