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

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public int saveNewsArticles(List<News> newsArticles) {
        if (newsArticles == null || newsArticles.isEmpty()) {
            log.warn("No news articles to save");
            return 0;
        }

        int savedCount = 0;
        int skippedCount = 0;
        int errorCount = 0;

        log.info("Starting to save {} news articles to database", newsArticles.size());

        for (News news : newsArticles) {
            try {
                if (news.getLink() == null || news.getLink().trim().isEmpty()) {
                    log.warn("Skipping news article with empty link: {}", news.getTitle());
                    skippedCount++;
                    continue;
                }

                String link = news.getLink().trim();

                if (newsRepository.existsByLink(link)) {
                    log.debug("News article already exists, skipping: {}", link);
                    skippedCount++;
                    continue;
                }

                News savedNews = newsRepository.save(news);
                entityManager.flush();
                savedCount++;

                log.info("Successfully saved news article [ID: {}] - Title: {} | Source: {} | Link: {}", 
                        savedNews.getId(), 
                        savedNews.getTitle(), 
                        savedNews.getSource(),
                        savedNews.getLink());

            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                log.warn("Duplicate entry detected, skipping: {} - {}", news.getLink(), e.getMessage());
                skippedCount++;
            } catch (Exception e) {
                log.error("Failed to save news article: {} | Error: {}", news.getLink(), e.getMessage(), e);
                errorCount++;
            }
        }

        entityManager.flush();
        log.info("News storage completed - Saved: {}, Skipped: {}, Errors: {}", savedCount, skippedCount, errorCount);

        return savedCount;
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

