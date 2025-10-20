package com.bharathva.feed.model;

import java.util.List;

public class MediaContent {
    
    private String type; // 'grid', 'single', 'carousel'
    private List<MediaItem> items;
    
    // Constructors
    public MediaContent() {}
    
    public MediaContent(String type, List<MediaItem> items) {
        this.type = type;
        this.items = items;
    }
    
    // Getters and Setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public List<MediaItem> getItems() {
        return items;
    }
    
    public void setItems(List<MediaItem> items) {
        this.items = items;
    }
}
