package com.bharathva.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CreateFeedRequest {
    
    @NotBlank(message = "Content is required")
    @Size(max = 280, message = "Content must not exceed 280 characters")
    private String content;
    
    private List<String> emojis;
    private MediaContent media;
    private String parentFeedId;
    private String threadId;
    
    // Constructors
    public CreateFeedRequest() {}
    
    public CreateFeedRequest(String content) {
        this.content = content;
    }
    
    // Getters and Setters
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public List<String> getEmojis() {
        return emojis;
    }
    
    public void setEmojis(List<String> emojis) {
        this.emojis = emojis;
    }
    
    public MediaContent getMedia() {
        return media;
    }
    
    public void setMedia(MediaContent media) {
        this.media = media;
    }
    
    public String getParentFeedId() {
        return parentFeedId;
    }
    
    public void setParentFeedId(String parentFeedId) {
        this.parentFeedId = parentFeedId;
    }
    
    public String getThreadId() {
        return threadId;
    }
    
    public void setThreadId(String threadId) {
        this.threadId = threadId;
    }
}
