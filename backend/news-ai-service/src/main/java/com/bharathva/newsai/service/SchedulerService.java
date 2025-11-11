package com.bharathva.newsai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SchedulerService.class);

    private final RssFetchService rssFetchService;
    private final SummarizerService summarizerService;
    private final CleanupService cleanupService;
    private final com.bharathva.newsai.service.TopNewsService topNewsService;

    public SchedulerService(RssFetchService rssFetchService, 
                           SummarizerService summarizerService, 
                           CleanupService cleanupService,
                           com.bharathva.newsai.service.TopNewsService topNewsService) {
        this.rssFetchService = rssFetchService;
        this.summarizerService = summarizerService;
        this.cleanupService = cleanupService;
        this.topNewsService = topNewsService;
        log.info("SchedulerService initialized - News will auto-refresh every 15 minutes");
    }

    @Scheduled(fixedRateString = "${scheduler.interval-minutes:15}000", initialDelay = 60000)
    public void refreshNewsJob() {
        log.info("========================================");
        log.info("AUTO REFRESH CYCLE STARTED at: {}", LocalDateTime.now());
        log.info("========================================");
        
        try {
            // Step 1: Fetch latest news from RSS feeds
            topNewsService.fetchAndStoreTop10News();
            log.info("✓ News fetch and store completed");
            
            // Step 2: Auto-summarize ALL news articles using AI
            try {
                summarizerService.autoSummarizeAllNews();
                log.info("✓ Auto-summarization completed");
            } catch (Exception e) {
                log.warn("⚠ Summarization failed (non-critical): {}", e.getMessage());
            }
            
            // Step 3: Clean up old news articles
            try {
                cleanupService.cleanupOldNews();
                log.info("✓ Cleanup completed");
            } catch (Exception e) {
                log.warn("⚠ Cleanup failed (non-critical): {}", e.getMessage());
            }
            
            log.info("========================================");
            log.info("AUTO REFRESH CYCLE COMPLETED at: {}", LocalDateTime.now());
            log.info("========================================");
        } catch (Exception e) {
            log.error("========================================");
            log.error("AUTO REFRESH CYCLE FAILED at: {}", LocalDateTime.now());
            log.error("Error: {}", e.getMessage(), e);
            log.error("========================================");
        }
    }
}
