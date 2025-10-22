package com.bharathva.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Simple request DTO for creating a feed message
 */
public class CreateFeedRequest {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Message is required")
    @Size(max = 280, message = "Message must not exceed 280 characters")
    private String message;
    
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
    
    @Override
    public String toString() {
        return "CreateFeedRequest{" +
                "userId='" + userId + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}