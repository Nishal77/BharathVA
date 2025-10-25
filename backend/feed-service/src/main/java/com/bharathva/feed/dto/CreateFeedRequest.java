package com.bharathva.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.ArrayList;

/**
 * Request DTO for creating a feed message with optional images
 */
public class CreateFeedRequest {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Message is required")
    @Size(max = 280, message = "Message must not exceed 280 characters")
    private String message;
    
    private List<String> imageUrls = new ArrayList<>();
    
    // Constructors
    public CreateFeedRequest() {}
    
    public CreateFeedRequest(String userId, String message) {
        this.userId = userId;
        this.message = message;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public List<String> getImageUrls() {
        return imageUrls;
    }
    
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
    }
    
    public void addImageUrl(String imageUrl) {
        if (this.imageUrls == null) {
            this.imageUrls = new ArrayList<>();
        }
        this.imageUrls.add(imageUrl);
    }
    
    public boolean hasImages() {
        return imageUrls != null && !imageUrls.isEmpty();
    }
    
    @Override
    public String toString() {
        return "CreateFeedRequest{" +
                "userId='" + userId + '\'' +
                ", message='" + message + '\'' +
                ", imageUrls=" + imageUrls +
                '}';
    }
}