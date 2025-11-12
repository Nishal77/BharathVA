package com.bharathva.newsai.controller;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import com.bharathva.newsai.service.IntelligentSummarizerService;
import com.bharathva.newsai.service.TopNewsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Test controller for debugging and testing news system.
 * Provides endpoints for manual triggers and system verification.
 * 
 * @author BharathVA Engineering Team
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final Logger log = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private NewsRepository newsRepository;
    
    @Autowired
    private IntelligentSummarizerService summarizerService;
    
    @Autowired
    private TopNewsService topNewsService;

    /**
     * Comprehensive system test endpoint.
     * Tests: Database, News Fetching, AI Summarization, IST Timestamps.
     */
    @GetMapping("/system")
    public ResponseEntity<?> testSystem() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Test 1: Database Connection
            log.info("Testing database connection...");
            long newsCount = newsRepository.count();
            result.put("1_database_connected", true);
            result.put("1_total_news_in_db", newsCount);
            
            // Test 2: Check summaries
            log.info("Checking summary coverage...");
            List<News> allNews = newsRepository.findAll();
            long withSummary = allNews.stream()
                    .filter(n -> n.getSummary() != null && !n.getSummary().isEmpty())
                    .count();
            long withoutSummary = newsCount - withSummary;
            
            result.put("2_news_with_summary", withSummary);
            result.put("2_news_without_summary", withoutSummary);
            result.put("2_summary_coverage_percent", newsCount > 0 ? (withSummary * 100 / newsCount) : 0);
            
            // Test 3: Fetch fresh news
            log.info("Fetching fresh news...");
            List<News> fetchedNews = topNewsService.fetchAndStoreTop10News();
            result.put("3_news_fetched", fetchedNews.size());
            
            // Test 4: Test AI Summarization
            if (!fetchedNews.isEmpty()) {
                log.info("Testing AI summarization...");
                News testNews = fetchedNews.get(0);
                try {
                    String summary = summarizerService.getSummaryForNews(testNews);
                    result.put("4_ai_summarization_working", true);
                    result.put("4_test_summary_length", summary != null ? summary.length() : 0);
                    result.put("4_test_news_title", testNews.getTitle());
                } catch (Exception e) {
                    result.put("4_ai_summarization_working", false);
                    result.put("4_ai_error", e.getMessage());
                }
            }
            
            // Test 5: IST Timestamp Formatting
            if (!fetchedNews.isEmpty()) {
                News sampleNews = fetchedNews.get(0);
                result.put("5_ist_timestamp_formatted", sampleNews.getPublishedAtIst());
                result.put("5_relative_time", sampleNews.getPublishedAtRelative());
            }
            
            // Test 6: Get latest news for display
            List<News> latestNews = newsRepository.findTop10News();
            result.put("6_latest_news_count", latestNews.size());
            if (!latestNews.isEmpty()) {
                Map<String, Object> firstNews = new HashMap<>();
                News first = latestNews.get(0);
                firstNews.put("title", first.getTitle());
                firstNews.put("source", first.getSource());
                firstNews.put("hasSummary", first.getSummary() != null && !first.getSummary().isEmpty());
                firstNews.put("publishedAtIst", first.getPublishedAtIst());
                firstNews.put("publishedAtRelative", first.getPublishedAtRelative());
                result.put("6_sample_news", firstNews);
            }
            
            result.put("status", "SUCCESS");
            result.put("message", "All systems operational");
            result.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("System test failed: {}", e.getMessage(), e);
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            result.put("errorType", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * Trigger immediate news fetch and summarization.
     */
    @PostMapping("/fetch-and-summarize")
    public ResponseEntity<?> fetchAndSummarize() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("=== MANUAL FETCH AND SUMMARIZE TRIGGERED ===");
            
            // Step 1: Fetch news
            List<News> fetchedNews = topNewsService.fetchAndStoreTop10News();
            result.put("fetched_count", fetchedNews.size());
            
            // Step 2: Summarize all
            summarizerService.autoSummarizeAllNews();
            
            // Step 3: Check results
            long totalNews = newsRepository.count();
            List<News> allNews = newsRepository.findAll();
            long withSummary = allNews.stream()
                    .filter(n -> n.getSummary() != null && !n.getSummary().isEmpty())
                    .count();
            
            result.put("total_news", totalNews);
            result.put("with_summary", withSummary);
            result.put("without_summary", totalNews - withSummary);
            result.put("status", "SUCCESS");
            result.put("message", "Fetch and summarize completed");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Fetch and summarize failed: {}", e.getMessage(), e);
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * Get summary statistics.
     */
    @GetMapping("/summary-stats")
    public ResponseEntity<?> getSummaryStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long total = newsRepository.count();
            List<News> allNews = newsRepository.findAll();
            
            long withSummary = allNews.stream()
                    .filter(n -> n.getSummary() != null && !n.getSummary().isEmpty())
                    .count();
            
            long withoutSummary = total - withSummary;
            
            stats.put("total_news", total);
            stats.put("with_summary", withSummary);
            stats.put("without_summary", withoutSummary);
            stats.put("coverage_percent", total > 0 ? (withSummary * 100 / total) : 0);
            stats.put("status", "SUCCESS");
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            stats.put("status", "ERROR");
            stats.put("error", e.getMessage());
            return ResponseEntity.status(500).body(stats);
        }
    }
}

