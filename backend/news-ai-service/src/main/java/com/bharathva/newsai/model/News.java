package com.bharathva.newsai.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "news")
@NoArgsConstructor
@AllArgsConstructor
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "link", unique = true, nullable = false, length = 2048)
    private String link;

    @Column(length = 200)
    private String source;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Column(name = "video_url", length = 2048)
    private String videoUrl;

    @Column(name = "pub_date", nullable = false)
    private LocalDateTime pubDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "ready_for_display")
    private LocalDateTime readyForDisplay;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (pubDate == null) {
            pubDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    @JsonProperty("url")
    public String getUrl() {
        return link;
    }

    @JsonProperty("url")
    public void setUrl(String url) {
        this.link = url;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public LocalDateTime getPubDate() {
        return pubDate;
    }

    public void setPubDate(LocalDateTime pubDate) {
        this.pubDate = pubDate;
    }

    @JsonProperty("publishedAt")
    public LocalDateTime getPublishedAt() {
        return pubDate;
    }

    @JsonProperty("publishedAt")
    public void setPublishedAt(LocalDateTime publishedAt) {
        this.pubDate = publishedAt;
    }
    
    /**
     * Get published date formatted in IST for display.
     * Example: "12 Jan 2025, 03:30 PM IST"
     */
    @JsonProperty("publishedAtIst")
    public String getPublishedAtIst() {
        return com.bharathva.newsai.util.DateTimeUtil.formatAsIst(pubDate);
    }
    
    /**
     * Get published date as relative time (e.g., "5 hours ago").
     * This is for news card display.
     */
    @JsonProperty("publishedAtRelative")
    public String getPublishedAtRelative() {
        return com.bharathva.newsai.util.DateTimeUtil.formatRelativeTime(pubDate);
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

    public LocalDateTime getReadyForDisplay() {
        return readyForDisplay;
    }

    public void setReadyForDisplay(LocalDateTime readyForDisplay) {
        this.readyForDisplay = readyForDisplay;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        News news = (News) o;
        return Objects.equals(id, news.id) && Objects.equals(link, news.link);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, link);
    }

    @Override
    public String toString() {
        return "News{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", link='" + link + '\'' +
                ", source='" + source + '\'' +
                ", pubDate=" + pubDate +
                '}';
    }
}
