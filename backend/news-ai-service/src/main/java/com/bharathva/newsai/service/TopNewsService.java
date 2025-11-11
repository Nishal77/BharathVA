package com.bharathva.newsai.service;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TopNewsService {

    private static final Logger log = LoggerFactory.getLogger(TopNewsService.class);
    private static final int TOP_NEWS_COUNT = 10;

    @Autowired
    private RssFetchService rssFetchService;

    @Autowired
    private NewsStorageService newsStorageService;

    @Autowired
    private NewsRepository newsRepository;

    @Transactional
    public List<News> fetchAndStoreTop10News() {
        log.info("Starting fetch and store operation for top {} news articles", TOP_NEWS_COUNT);
        
        try {
            long countBefore = newsStorageService.getNewsCount();
            log.info("Current news count in database: {}", countBefore);

            rssFetchService.fetchLatest();

            long countAfter = newsStorageService.getNewsCount();
            log.info("News count after fetch: {} (Added: {})", countAfter, countAfter - countBefore);

            List<News> topNews = newsStorageService.getTop10News();
            
            if (topNews.isEmpty()) {
                log.warn("No news articles found in database after fetch operation");
            } else {
                log.info("Successfully retrieved {} top news articles", topNews.size());
                topNews.forEach(news -> 
                    log.debug("Top news: [ID: {}] {} - {}", news.getId(), news.getTitle(), news.getSource())
                );
            }

            return topNews;

        } catch (Exception e) {
            log.error("Failed to fetch and store top news: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch and store top news", e);
        }
    }

    @Transactional(readOnly = true)
    public List<News> getTop10News() {
        try {
            List<News> topNews = newsRepository.findTop10News();
            log.info("Retrieved {} top news articles from database", topNews.size());
            return topNews;
        } catch (Exception e) {
            log.error("Failed to retrieve top 10 news: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public boolean ensureTop10NewsAvailable() {
        try {
            List<News> currentNews = getTop10News();
            
            if (currentNews.size() < TOP_NEWS_COUNT) {
                log.info("Only {} news articles available, fetching more to reach {}", 
                        currentNews.size(), TOP_NEWS_COUNT);
                fetchAndStoreTop10News();
                return true;
            }
            
            log.info("Sufficient news articles available: {}", currentNews.size());
            return true;
        } catch (Exception e) {
            log.error("Failed to ensure top 10 news availability: {}", e.getMessage(), e);
            return false;
        }
    }
}

