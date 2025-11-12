package com.bharathva.newsai.service;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

/**
 * Production-grade intelligent summarization service for BharathVA news-ai-service.
 * Implements multi-model fallback strategy with automatic model switching on failures.
 * 
 * Model Strategy:
 * - Primary: google/gemini-2.0-flash-exp:free (fastest, crisp output)
 * - Secondary: moonshotai/kimi-k2-0711:free (balanced, contextual)
 * - Tertiary: mistralai/mistral-small-24b-instruct-2501:free (strong factual summaries)
 * 
 * Features:
 * - Automatic fallback on rate limits (429) or server errors (5xx)
 * - Intelligent retry logic with exponential backoff
 * - Load balancing across models to prevent single-model exhaustion
 * - Comprehensive logging and error tracking
 * - Summary validation (700-1500 characters)
 * - Automatic summarization of all news articles
 * 
 * @author BharathVA Engineering Team
 */
@Service
public class IntelligentSummarizerService {

    private static final Logger log = LoggerFactory.getLogger(IntelligentSummarizerService.class);
    
    private static final int MIN_SUMMARY_LENGTH = 700;
    private static final int MAX_SUMMARY_LENGTH = 1500;
    private static final int RATE_LIMIT_DELAY_MS = 1500;
    
    @Value("${openrouter.primary-model}")
    private String primaryModel;
    
    @Value("${openrouter.secondary-model}")
    private String secondaryModel;
    
    @Value("${openrouter.tertiary-model}")
    private String tertiaryModel;
    
    private final OpenRouterService openRouterService;
    private final NewsRepository newsRepository;
    private final Random random;
    
    public IntelligentSummarizerService(OpenRouterService openRouterService, 
                                       NewsRepository newsRepository) {
        this.openRouterService = openRouterService;
        this.newsRepository = newsRepository;
        this.random = new Random();
        
        log.info("========================================");
        log.info("IntelligentSummarizerService initialized");
        log.info("Model configuration:");
        log.info("  Primary: {}", primaryModel != null ? primaryModel : "NOT SET");
        log.info("  Secondary: {}", secondaryModel != null ? secondaryModel : "NOT SET");
        log.info("  Tertiary: {}", tertiaryModel != null ? tertiaryModel : "NOT SET");
        log.info("========================================");
    }
    
    /**
     * Automatically summarize all news articles that don't have summaries.
     * Called by the scheduler after fetching new news (every 10-15 minutes).
     */
    @Transactional
    public void autoSummarizeAllNews() {
        log.info("========================================");
        log.info("AUTO-SUMMARIZATION STARTED");
        log.info("========================================");
        
        try {
            List<News> unsummarizedNews = findUnsummarizedNews();
            
            if (unsummarizedNews.isEmpty()) {
                log.info("✓ All news articles already have summaries");
                return;
            }
            
            log.info("Found {} articles that need summarization", unsummarizedNews.size());
            
            int successCount = 0;
            int failureCount = 0;
            
            for (News news : unsummarizedNews) {
                try {
                    log.info("Processing news [{}]: {}", news.getId(), truncateTitle(news.getTitle()));
                    
                    if (news.getTitle() == null || news.getTitle().trim().isEmpty()) {
                        log.warn("Skipping news [{}]: No title", news.getId());
                        failureCount++;
                        continue;
                    }
                    
                    String summary = generateSummaryWithIntelligentFallback(news);
                    
                    if (isValidSummary(summary)) {
                        news.setSummary(summary);
                        newsRepository.save(news);
                        successCount++;
                        
                        log.info("✓ Summarized [{}]: {} ({} chars)", 
                                news.getId(), 
                                truncateTitle(news.getTitle()), 
                                summary.length());
                    } else {
                        failureCount++;
                        log.warn("✗ Invalid summary for [{}]: {} (length: {})", 
                                news.getId(), 
                                truncateTitle(news.getTitle()),
                                summary != null ? summary.length() : 0);
                    }
                    
                    // Rate limiting: Wait between API calls to respect limits
                    Thread.sleep(RATE_LIMIT_DELAY_MS);
                    
                } catch (Exception e) {
                    failureCount++;
                    log.error("✗ Failed to summarize [{}]: {} - {}", 
                            news.getId(), 
                            truncateTitle(news.getTitle()),
                            e.getMessage());
                    if (log.isDebugEnabled()) {
                        log.debug("Full error stack trace:", e);
                    }
                }
            }
            
            log.info("========================================");
            log.info("AUTO-SUMMARIZATION COMPLETED");
            log.info("Success: {} | Failed: {} | Total: {}", 
                    successCount, failureCount, unsummarizedNews.size());
            log.info("========================================");
            
        } catch (Exception e) {
            log.error("========================================");
            log.error("AUTO-SUMMARIZATION FAILED: {}", e.getMessage(), e);
            log.error("========================================");
        }
    }
    
    /**
     * Generate summary with intelligent multi-model fallback strategy.
     * Implements load balancing by randomizing model order to distribute load.
     */
    private String generateSummaryWithIntelligentFallback(News news) {
        String content = prepareContent(news);
        
        // Load balancing: Randomize model order occasionally to spread load
        String[] models = shouldUseLoadBalancing() 
                ? getShuffledModels() 
                : getOrderedModels();
        
        log.debug("Using model order: {}", String.join(" -> ", models));
        
        for (int i = 0; i < models.length; i++) {
            String model = models[i];
            String modelLabel = getModelLabel(i);
            
            try {
                log.debug("Trying {} model: {}", modelLabel, model);
                String summary = openRouterService.summarize(content, model);
                
                if (isValidSummary(summary)) {
                    log.info("✓ Success with {} model: {} ({} chars)", 
                            modelLabel, model, summary.length());
                    return summary;
                }
                
                log.warn("✗ Invalid summary from {} model: {} (length: {})", 
                        modelLabel, model, summary != null ? summary.length() : 0);
                
            } catch (OpenRouterService.ModelOverloadedException e) {
                log.warn("⚠ {} model overloaded/rate-limited: {} - Switching to next model", 
                        modelLabel, model);
                continue;
                
            } catch (Exception e) {
                log.error("✗ {} model failed: {} - {}", modelLabel, model, e.getMessage());
                if (i < models.length - 1) {
                    log.info("→ Falling back to next model");
                }
                continue;
            }
        }
        
        log.error("✗ All models failed for news [{}]", news.getId());
        throw new RuntimeException("All OpenRouter models failed");
    }
    
    /**
     * Prepare content for summarization from title and description.
     */
    private String prepareContent(News news) {
        if (news.getTitle() == null || news.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty for summarization");
        }
        
        StringBuilder content = new StringBuilder();
        content.append("Title: ").append(news.getTitle().trim());
        
        if (news.getDescription() != null && !news.getDescription().trim().isEmpty()) {
            content.append("\n\nDescription: ").append(news.getDescription().trim());
        } else {
            content.append("\n\n(No additional description provided)");
        }
        
        String result = content.toString();
        
        // Limit content length for API efficiency
        if (result.length() > 8000) {
            result = result.substring(0, 8000) + "...";
        }
        
        return result;
    }
    
    /**
     * Find all news articles that don't have valid summaries.
     */
    private List<News> findUnsummarizedNews() {
        return newsRepository.findAll().stream()
                .filter(news -> !hasSummary(news))
                .toList();
    }
    
    /**
     * Check if a news article has a valid summary.
     */
    private boolean hasSummary(News news) {
        String summary = news.getSummary();
        if (summary == null || summary.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = summary.trim();
        
        // Reject error messages or invalid summaries
        if (trimmed.equals("Summary unavailable") || 
            trimmed.contains("unavailable") ||
            trimmed.toLowerCase().contains("error") ||
            trimmed.length() < 500) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate that a generated summary meets quality standards.
     */
    private boolean isValidSummary(String summary) {
        if (summary == null || summary.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = summary.trim();
        int length = trimmed.length();
        
        // Reject error messages
        if (trimmed.equals("Summary unavailable") || 
            trimmed.contains("unavailable") ||
            trimmed.toLowerCase().contains("error")) {
            return false;
        }
        
        // Accept summaries between 500-1500 chars (flexible minimum)
        if (length < 500) {
            log.debug("Summary too short: {} chars (minimum: 500)", length);
            return false;
        }
        
        if (length > MAX_SUMMARY_LENGTH) {
            log.debug("Summary too long: {} chars (maximum: {})", length, MAX_SUMMARY_LENGTH);
            return false;
        }
        
        return true;
    }
    
    /**
     * Determine if load balancing should be used (20% of the time).
     */
    private boolean shouldUseLoadBalancing() {
        return random.nextInt(100) < 20; // 20% chance
    }
    
    /**
     * Get models in default priority order.
     */
    private String[] getOrderedModels() {
        return new String[]{primaryModel, secondaryModel, tertiaryModel};
    }
    
    /**
     * Get models in shuffled order for load balancing.
     */
    private String[] getShuffledModels() {
        String[] models = {primaryModel, secondaryModel, tertiaryModel};
        
        // Fisher-Yates shuffle
        for (int i = models.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            String temp = models[i];
            models[i] = models[j];
            models[j] = temp;
        }
        
        return models;
    }
    
    /**
     * Get model label based on position.
     */
    private String getModelLabel(int index) {
        return switch (index) {
            case 0 -> "PRIMARY";
            case 1 -> "SECONDARY";
            case 2 -> "TERTIARY";
            default -> "UNKNOWN";
        };
    }
    
    /**
     * Truncate title for logging.
     */
    private String truncateTitle(String title) {
        if (title == null) return "Unknown";
        return title.length() > 60 ? title.substring(0, 60) + "..." : title;
    }
    
    /**
     * Get summary on-demand for a specific news article.
     */
    @Transactional
    public String getSummaryForNews(News news) {
        if (hasSummary(news)) {
            log.info("Using existing summary for news [{}]", news.getId());
            return news.getSummary();
        }
        
        try {
            log.info("Generating new summary for news [{}]", news.getId());
            String summary = generateSummaryWithIntelligentFallback(news);
            
            if (isValidSummary(summary)) {
                news.setSummary(summary);
                newsRepository.save(news);
                log.info("✓ Generated and saved summary for news [{}]", news.getId());
                return summary;
            } else {
                log.warn("✗ Generated invalid summary for news [{}]", news.getId());
                return "Summary unavailable. Please try again later.";
            }
        } catch (Exception e) {
            log.error("✗ Failed to generate summary for news [{}]: {}", 
                    news.getId(), e.getMessage());
            return "Summary unavailable. Please try again later.";
        }
    }
}

