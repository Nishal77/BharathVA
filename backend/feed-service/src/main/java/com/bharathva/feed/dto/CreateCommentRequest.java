package com.bharathva.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a comment
 */
public class CreateCommentRequest {
    
    @NotBlank(message = "Comment text cannot be empty")
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String text;
    
    // Constructors
    public CreateCommentRequest() {}
    
    public CreateCommentRequest(String text) {
        this.text = text;
    }
    
    // Getters and Setters
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    @Override
    public String toString() {
        return "CreateCommentRequest{" +
                "text='" + text + '\'' +
                '}';
    }
}

