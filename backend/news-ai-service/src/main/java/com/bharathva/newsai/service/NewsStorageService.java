package com.bharathva.newsai.service;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NewsStorageService {

    private static final Logger log = LoggerFactory.getLogger(NewsStorageService.class);

    @Autowired
    private NewsRepository newsRepository;
    
    @Autowired
    private DuplicateNewsDetectionService duplicateDetectionService;
    
    @Autowired
    private IntelligentSummarizerService summarizerService;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Save news articles with intelligent duplicate detection and automatic AI summarization.
     * 
     * Process Flow:
     * 1. Validate news article
     * 2. Check for duplicates using multi-strategy detection
     * 3. Save to database if not duplicate
     * 4. Queue for AI summarization (async)
     * 
     * @param newsArticles List of news articles to save
     * @return Number of successfully saved articles
     */
    @Transactional
    public int saveNewsArticles(List<News> newsArticles) {
        if (newsArticles == null || newsArticles.isEmpty()) {
            log.warn("No news articles to save");
            return 0;
        }

        int savedCount = 0;
        int skippedDuplicates = 0;
        int errorCount = 0;

        log.info("========================================");
        log.info("BULLETPROOF NEWS STORAGE STARTED");
        log.info("Processing {} news articles", newsArticles.size());
        log.info("========================================");

        for (News news : newsArticles) {
            try {
                // Validation: Check for required fields
                if (!isValidNews(news)) {
                    log.warn("Skipping invalid news article: {}", 
                            news.getTitle() != null ? truncate(news.getTitle(), 60) : "NO TITLE");
                    errorCount++;
                    continue;
                }

                // Duplicate Detection: Multi-strategy check
                if (duplicateDetectionService.isDuplicate(news)) {
                    log.debug("Duplicate detected, skipping: {}", truncate(news.getTitle(), 60));
                    skippedDuplicates++;
                    continue;
                }

                // Save to database
                News savedNews = newsRepository.save(news);
                entityManager.flush();
                savedCount++;

                log.info("✓ Saved news [ID: {}]: {} | Source: {}", 
                        savedNews.getId(), 
                        truncate(savedNews.getTitle(), 60),
                        savedNews.getSource());

            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                log.warn("Database constraint violation (duplicate), skipping: {} - {}", 
                        truncate(news.getLink(), 80), e.getMessage());
                skippedDuplicates++;
            } catch (Exception e) {
                log.error("Failed to save news article: {} | Error: {}", 
                        truncate(news.getLink(), 80), e.getMessage());
                if (log.isDebugEnabled()) {
                    log.debug("Full error stack trace:", e);
                }
                errorCount++;
            }
        }

        entityManager.flush();
        
        log.info("========================================");
        log.info("NEWS STORAGE COMPLETED");
        log.info("Saved: {} | Duplicates Skipped: {} | Errors: {} | Total: {}", 
                savedCount, skippedDuplicates, errorCount, newsArticles.size());
        log.info("========================================");

        return savedCount;
    }
    
    /**
     * Validate that a news article has all required fields.
     */
    private boolean isValidNews(News news) {
        if (news == null) {
            log.warn("Null news article provided");
            return false;
        }
        
        if (news.getTitle() == null || news.getTitle().trim().isEmpty()) {
            log.warn("News article missing title");
            return false;
        }
        
        if (news.getLink() == null || news.getLink().trim().isEmpty()) {
            log.warn("News article missing link");
            return false;
        }
        
        // Title should be at least 10 characters (filter out junk)
        if (news.getTitle().trim().length() < 10) {
            log.warn("News title too short (< 10 chars): {}", news.getTitle());
            return false;
        }
        
        return true;
    }
    
    /**
     * Truncate string for logging.
     */
    private String truncate(String str, int maxLength) {
        if (str == null) return "null";
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength) + "...";
    }

    @Transactional(readOnly = true)
    public List<News> getTop10News() {
        try {
            List<News> topNews = newsRepository.findTop10News();
            log.info("Retrieved {} news articles from database", topNews.size());
            return topNews;
        } catch (Exception e) {
            log.error("Failed to retrieve top 10 news: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve news articles", e);
        }
    }

    @Transactional(readOnly = true)
    public long getNewsCount() {
        try {
            long count = newsRepository.count();
            log.debug("Current news count in database: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Failed to get news count: {}", e.getMessage(), e);
            return 0;
        }
    }
}

