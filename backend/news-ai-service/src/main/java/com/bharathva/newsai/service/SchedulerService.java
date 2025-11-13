package com.bharathva.newsai.service;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler service that runs every 15 minutes to:
 * 1. Clean up old news entries
 * 2. Fetch fresh news from RSS feeds
 * 3. Identify top 10 trending/common news
 * 4. Generate AI summaries for those 10 items (600-1200 chars)
 * 5. Set ready_for_display timestamp (20 minutes delay)
 */
@Service
public class SchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SchedulerService.class);
    private static final int FRONTEND_DELAY_MINUTES = 20;

    private final RssFetchService rssFetchService;
    private final IntelligentSummarizerService intelligentSummarizerService;
    private final CleanupService cleanupService;
    private final TrendingNewsService trendingNewsService;
    
    @Autowired
    private NewsRepository newsRepository;

    public SchedulerService(RssFetchService rssFetchService, 
                           IntelligentSummarizerService intelligentSummarizerService, 
                           CleanupService cleanupService,
                           TrendingNewsService trendingNewsService) {
        this.rssFetchService = rssFetchService;
        this.intelligentSummarizerService = intelligentSummarizerService;
        this.cleanupService = cleanupService;
        this.trendingNewsService = trendingNewsService;
        log.info("========================================");
        log.info("SchedulerService initialized");
        log.info("Refresh interval: Every 15 minutes");
        log.info("Frontend display delay: {} minutes", FRONTEND_DELAY_MINUTES);
        log.info("========================================");
    }

    /**
     * Main refresh job that runs every 15 minutes.
     * 
     * Flow:
     * 1. Clean up old/outdated news entries
     * 2. Fetch fresh news from all RSS feeds
     * 3. Identify top 10 trending/common news across sources
     * 4. Generate AI summaries (600-1200 chars) for those 10 items
     * 5. Set ready_for_display timestamp (20 minutes from now)
     */
    @Scheduled(fixedRate = 900000, initialDelay = 60000) // 15 minutes = 900000ms
    @Transactional
    public void refreshNewsJob() {
        LocalDateTime cycleStart = LocalDateTime.now();
        log.info("========================================");
        log.info("AUTO REFRESH CYCLE STARTED");
        log.info("Time: {}", cycleStart);
        log.info("========================================");
        
        try {
            // Step 1: Clean up old and outdated news entries FIRST
            log.info("STEP 1: Cleaning up old news entries...");
            try {
                cleanupService.cleanupOldNews();
                log.info("Cleanup completed");
            } catch (Exception e) {
                log.error("Cleanup failed: {}", e.getMessage(), e);
                throw e; // Fail fast if cleanup fails
            }
            
            // Step 2: Fetch fresh news from all configured RSS feeds
            log.info("STEP 2: Fetching fresh news from RSS feeds...");
            try {
                rssFetchService.fetchLatest();
                log.info("News fetch completed");
            } catch (Exception e) {
                log.error("News fetch failed: {}", e.getMessage(), e);
                throw e; // Fail fast if fetch fails
            }
            
            // Step 3: Identify top 10 trending/common news across all sources
            log.info("STEP 3: Identifying top 10 trending news...");
            List<News> top10TrendingNews;
            try {
                top10TrendingNews = trendingNewsService.identifyTop10TrendingNews();
                log.info("Identified {} trending news articles", top10TrendingNews.size());
            } catch (Exception e) {
                log.error("Failed to identify trending news: {}", e.getMessage(), e);
                throw e;
            }
            
            if (top10TrendingNews.isEmpty()) {
                log.warn("No trending news found. Skipping summarization.");
                log.info("========================================");
                log.info("AUTO REFRESH CYCLE COMPLETED (No trending news)");
                log.info("Time: {}", LocalDateTime.now());
                log.info("========================================");
                return;
            }
            
            // Step 4: Generate AI summaries (600-1200 chars) for top 10 trending news
            log.info("STEP 4: Generating AI summaries for top 10 trending news...");
            try {
                intelligentSummarizerService.summarizeTop10TrendingNews(top10TrendingNews);
                log.info("AI summarization completed");
            } catch (Exception e) {
                log.error("AI summarization failed: {}", e.getMessage(), e);
                log.warn("Continuing without summaries - news will still be made available");
                // Non-critical: Continue even if summarization fails
            }
            
            // Step 5: Set ready_for_display timestamp (20 minutes from now)
            // IMPORTANT: Set this even if summarization failed, so news can still be displayed
            log.info("STEP 5: Setting frontend display timestamps ({} minutes delay)...", FRONTEND_DELAY_MINUTES);
            LocalDateTime readyForDisplay = cycleStart.plusMinutes(FRONTEND_DELAY_MINUTES);
            int updatedCount = 0;
            try {
                for (News news : top10TrendingNews) {
                    try {
                        // Refresh from database to get latest state (including any summary that was added)
                        News refreshedNews = newsRepository.findById(news.getId()).orElse(news);
                        if (refreshedNews != null) {
                            refreshedNews.setReadyForDisplay(readyForDisplay);
                            newsRepository.save(refreshedNews);
                            updatedCount++;
                        }
                    } catch (Exception e) {
                        log.warn("Failed to set ready_for_display for news [{}]: {}", 
                                news.getId(), e.getMessage());
                    }
                }
                log.info("Set ready_for_display timestamp for {} articles: {} ({} minutes from now)", 
                        updatedCount, readyForDisplay, FRONTEND_DELAY_MINUTES);
            } catch (Exception e) {
                log.error("Failed to set display timestamps: {}", e.getMessage(), e);
                // Non-critical: Continue even if timestamp setting fails
            }
            
            LocalDateTime cycleEnd = LocalDateTime.now();
            long durationSeconds = java.time.Duration.between(cycleStart, cycleEnd).getSeconds();
            
            log.info("========================================");
            log.info("AUTO REFRESH CYCLE COMPLETED");
            log.info("Start: {}", cycleStart);
            log.info("End: {}", cycleEnd);
            log.info("Duration: {} seconds", durationSeconds);
            log.info("Top 10 trending news ready for display at: {}", readyForDisplay);
            log.info("========================================");
            
        } catch (Exception e) {
            log.error("========================================");
            log.error("AUTO REFRESH CYCLE FAILED");
            log.error("Time: {}", LocalDateTime.now());
            log.error("Error: {}", e.getMessage(), e);
            log.error("========================================");
        }
    }
}
