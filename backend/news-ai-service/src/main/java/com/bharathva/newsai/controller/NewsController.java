package com.bharathva.newsai.controller;

import com.bharathva.newsai.dto.NewsResponse;
import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import com.bharathva.newsai.service.RssFetchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private static final Logger log = LoggerFactory.getLogger(NewsController.class);

    @Autowired
    private NewsRepository repo;

    @Autowired
    private RssFetchService rssFetchService;

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/latest")
    public ResponseEntity<List<News>> getTop10News() {
        try {
            List<News> news = repo.findTop10News();
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("Error fetching latest news: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<NewsResponse> getTrendingNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Fetching trending news: page={}, size={}", page, size);
            
            if (repo == null) {
                log.warn("NewsRepository is not available - database connection may be unavailable");
                return ResponseEntity.status(503).build();
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<News> newsPage = repo.findTrendingNews(pageable);
            
            NewsResponse response = new NewsResponse(
                    newsPage.getContent(),
                    newsPage.getTotalElements(),
                    newsPage.getTotalPages(),
                    newsPage.getNumber(),
                    newsPage.getSize()
            );
            
            log.info("Returning {} trending news articles (page {} of {})", 
                    newsPage.getContent().size(), page, newsPage.getTotalPages());
            return ResponseEntity.ok(response);
        } catch (org.springframework.dao.DataAccessException e) {
            log.error("Database error fetching trending news: {}", e.getMessage(), e);
            return ResponseEntity.status(503)
                    .body(new NewsResponse(List.of(), 0, 0, page, size));
        } catch (Exception e) {
            log.error("Error fetching trending news: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(new NewsResponse(List.of(), 0, 0, page, size));
        }
    }

    @GetMapping
    public ResponseEntity<NewsResponse> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search) {
        try {
            log.info("Fetching news: page={}, size={}, category={}, source={}, search={}", 
                    page, size, category, source, search);
            Pageable pageable = PageRequest.of(page, size);
            Page<News> newsPage = repo.findNewsWithFilters(category, source, search, pageable);
            
            NewsResponse response = new NewsResponse(
                    newsPage.getContent(),
                    newsPage.getTotalElements(),
                    newsPage.getTotalPages(),
                    newsPage.getNumber(),
                    newsPage.getSize()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching news: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<NewsResponse> getRecentNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "24") int hours) {
        try {
            log.info("Fetching recent news: page={}, size={}, hours={}", page, size, hours);
            LocalDateTime since = LocalDateTime.now().minusHours(hours);
            Pageable pageable = PageRequest.of(page, size);
            Page<News> newsPage = repo.findRecentNews(since, pageable);
            
            NewsResponse response = new NewsResponse(
                    newsPage.getContent(),
                    newsPage.getTotalElements(),
                    newsPage.getTotalPages(),
                    newsPage.getNumber(),
                    newsPage.getSize()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching recent news: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        try {
            return repo.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching news by id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Autowired
    private com.bharathva.newsai.service.SummarizerService summarizerService;

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getNewsWithSummary(@PathVariable Long id) {
        try {
            log.info("Fetching news with AI summary for ID: {}", id);
            
            News news = repo.findById(id).orElse(null);
            if (news == null) {
                log.warn("News article not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // Get summary (uses cached or generates new one)
            String summary = summarizerService.getSummaryForNews(news);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", news.getId());
            response.put("title", news.getTitle());
            response.put("description", news.getDescription());
            response.put("summary", summary);
            response.put("imageUrl", news.getImageUrl());
            response.put("videoUrl", news.getVideoUrl());
            response.put("source", news.getSource());
            response.put("link", news.getLink());
            response.put("publishedAt", news.getPubDate());
            response.put("createdAt", news.getCreatedAt());
            
            log.info("✓ Returned news summary for ID: {} ({} chars)", 
                    id, summary != null ? summary.length() : 0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("✗ Error fetching news with summary for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to generate summary",
                "message", e.getMessage()
            ));
        }
    }

    @Autowired
    private com.bharathva.newsai.service.TopNewsService topNewsService;

    @PostMapping("/fetch")
    public ResponseEntity<?> triggerRssFetch() {
        try {
            log.info("Manual RSS fetch triggered");
            rssFetchService.fetchLatest();
            
            long count = repo.count();
            return ResponseEntity.ok(java.util.Map.of(
                "message", "RSS fetch completed successfully",
                "totalArticles", count,
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.error("Error triggering RSS fetch: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", "Failed to trigger RSS fetch: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/summarize-all")
    public ResponseEntity<?> triggerSummarization() {
        try {
            log.info("========================================");
            log.info("MANUAL SUMMARIZATION TRIGGERED");
            log.info("========================================");
            
            // Run auto-summarization in a separate thread to avoid blocking
            new Thread(() -> {
                try {
                    summarizerService.autoSummarizeAllNews();
                } catch (Exception e) {
                    log.error("Error in background summarization: {}", e.getMessage(), e);
                }
            }).start();
            
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Summarization process started in background",
                "status", "processing",
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.error("Error triggering summarization: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", "Failed to trigger summarization: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/fetch-top10")
    public ResponseEntity<?> fetchAndStoreTop10() {
        try {
            log.info("Fetching and storing top 10 news articles");
            List<News> topNews = topNewsService.fetchAndStoreTop10News();
            
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Top 10 news fetched and stored successfully",
                "count", topNews.size(),
                "articles", topNews,
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.error("Error fetching top 10 news: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", "Failed to fetch top 10 news: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("News AI Service is running");
    }

    @GetMapping("/test-gemini")
    public ResponseEntity<?> testGeminiApi() {
        try {
            log.info("Testing Gemini API connection...");
            
            // Create a test news article
            News testNews = new News();
            testNews.setTitle("Test Article: India's Economic Growth");
            testNews.setDescription("India's economy shows strong growth in Q1 2024 with GDP expanding by 7.2%. The manufacturing sector leads with 8.5% growth, while services sector grows at 6.8%. Experts attribute this to increased foreign investment and domestic consumption.");
            
            // Try to generate a summary
            String summary = summarizerService.getSummaryForNews(testNews);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Gemini API is working correctly");
            response.put("testSummary", summary);
            response.put("summaryLength", summary != null ? summary.length() : 0);
            response.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Gemini API test failed: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Gemini API test failed: " + e.getMessage());
            errorResponse.put("errorType", e.getClass().getSimpleName());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            
            // Check if it's a quota error
            if (e.getMessage() != null && (e.getMessage().contains("429") || e.getMessage().contains("quota"))) {
                errorResponse.put("quotaExceeded", true);
                errorResponse.put("suggestion", "Daily quota limit reached. Please wait for quota reset or upgrade your API plan.");
            }
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @Autowired
    private com.bharathva.newsai.service.NewsStorageService newsStorageService;

    @PostMapping("/test-data")
    public ResponseEntity<?> insertTestData() {
        try {
            log.info("Inserting test data to verify database connection and storage");
            
            String randomId = String.valueOf(System.currentTimeMillis());
            News testNews = new News();
            testNews.setTitle("Test News Article - " + randomId);
            testNews.setDescription("This is a test article to verify database storage functionality in Supabase");
            testNews.setSummary("Test summary for database verification");
            testNews.setLink("https://test.bharathva.com/news/test-" + randomId);
            testNews.setSource("Test Source");
            testNews.setImageUrl("https://via.placeholder.com/800x400?text=Test+News");
            testNews.setPubDate(LocalDateTime.now());
            
            long countBefore = repo.count();
            log.info("Articles in database before insert: {}", countBefore);
            
            News savedNews = repo.save(testNews);
            entityManager.flush();
            
            long countAfter = repo.count();
            log.info("Test data inserted successfully with ID: {}", savedNews.getId());
            log.info("Articles in database after insert: {} (added: {})", countAfter, countAfter - countBefore);
            
            News retrievedNews = repo.findById(savedNews.getId()).orElse(null);
            boolean verified = retrievedNews != null && retrievedNews.getId().equals(savedNews.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test data inserted and verified successfully");
            response.put("testArticleId", savedNews.getId());
            response.put("testArticleTitle", savedNews.getTitle());
            response.put("testArticleLink", savedNews.getLink());
            response.put("testArticleSource", savedNews.getSource());
            response.put("countBefore", countBefore);
            response.put("countAfter", countAfter);
            response.put("articlesAdded", countAfter - countBefore);
            response.put("verified", verified);
            response.put("totalArticlesInDatabase", countAfter);
            response.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error inserting test data: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", "Failed to insert test data: " + e.getMessage(),
                "errorType", e.getClass().getSimpleName(),
                "databaseConnected", false
            ));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            long totalCount = repo.count();
            List<News> latestNews = repo.findTop10News();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalArticles", totalCount);
            stats.put("latestCount", latestNews.size());
            stats.put("databaseConnected", true);
            stats.put("timestamp", LocalDateTime.now().toString());
            
            if (!latestNews.isEmpty()) {
                stats.put("latestArticle", latestNews.get(0).getTitle());
                stats.put("latestArticleDate", latestNews.get(0).getPubDate().toString());
            }
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching stats: {}", e.getMessage(), e);
            Map<String, Object> errorStats = new HashMap<>();
            errorStats.put("databaseConnected", false);
            errorStats.put("error", e.getMessage());
            return ResponseEntity.status(503).body(errorStats);
        }
    }
}
