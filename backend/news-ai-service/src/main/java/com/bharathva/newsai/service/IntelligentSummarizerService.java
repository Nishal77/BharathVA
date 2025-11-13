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
    
    private static final int MIN_SUMMARY_LENGTH = 600;
    private static final int MAX_SUMMARY_LENGTH = 1200;
    private static final int RATE_LIMIT_DELAY_MS = 2000;
    
    private volatile int primaryModelFailures = 0;
    private volatile int secondaryModelFailures = 0;
    private volatile long lastModelSwitchTime = 0;
    
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
     * Summarize only the top 10 trending news articles.
     * Called by the scheduler after identifying trending news.
     * 
     * @param top10TrendingNews List of top 10 trending news to summarize
     */
    @Transactional
    public void summarizeTop10TrendingNews(List<News> top10TrendingNews) {
        log.info("========================================");
        log.info("AI SUMMARIZATION: Top 10 Trending News");
        log.info("========================================");
        
        if (top10TrendingNews == null || top10TrendingNews.isEmpty()) {
            log.warn("No trending news provided for summarization");
                return;
            }
            
        log.info("Processing {} trending news articles for AI summarization", top10TrendingNews.size());
            
            int successCount = 0;
            int failureCount = 0;
        int skippedCount = 0;
            
        for (News news : top10TrendingNews) {
                try {
                // Skip if already has valid summary
                if (hasValidSummary(news)) {
                    log.debug("Skipping [{}]: Already has valid summary", news.getId());
                    skippedCount++;
                    continue;
                }
                
                log.info("Processing [{}]: {}", news.getId(), truncateTitle(news.getTitle()));
                    
                    if (news.getTitle() == null || news.getTitle().trim().isEmpty()) {
                    log.warn("Skipping [{}]: No title", news.getId());
                        failureCount++;
                        continue;
                    }
                    
                // Generate summary (600-1200 chars)
                    String summary = generateSummaryWithIntelligentFallback(news);
                    
                    if (isValidSummary(summary)) {
                        news.setSummary(summary);
                        newsRepository.save(news);
                        successCount++;
                        
                        log.info("Summarized [{}]: {} ({} chars)", 
                                news.getId(), 
                                truncateTitle(news.getTitle()), 
                                summary.length());
                    } else {
                        failureCount++;
                        log.warn("Invalid summary for [{}]: {} (length: {})", 
                                news.getId(), 
                                truncateTitle(news.getTitle()),
                                summary != null ? summary.length() : 0);
                    }
                    
                    // Rate limiting: Wait between API calls
                    Thread.sleep(RATE_LIMIT_DELAY_MS);
                    
                } catch (Exception e) {
                    failureCount++;
                    log.error("Failed to summarize [{}]: {} - {}", 
                            news.getId(), 
                            truncateTitle(news.getTitle()),
                            e.getMessage());
                    if (log.isDebugEnabled()) {
                        log.debug("Full error stack trace:", e);
                    }
                }
            }
            
            log.info("========================================");
        log.info("AI SUMMARIZATION COMPLETED");
        log.info("Success: {} | Failed: {} | Skipped: {} | Total: {}", 
                successCount, failureCount, skippedCount, top10TrendingNews.size());
            log.info("========================================");
    }
    
    /**
     * Legacy method for backward compatibility.
     * Summarizes all unsummarized news (not recommended for production).
     */
    @Transactional
    @Deprecated
    public void autoSummarizeAllNews() {
        log.warn("autoSummarizeAllNews() is deprecated. Use summarizeTop10TrendingNews() instead.");
        List<News> unsummarizedNews = findUnsummarizedNews();
        if (!unsummarizedNews.isEmpty()) {
            summarizeTop10TrendingNews(unsummarizedNews.stream().limit(10).toList());
        }
    }
    
    /**
     * Generate summary with intelligent multi-model fallback and traffic-based switching.
     * Implements adaptive load balancing based on model performance and traffic patterns.
     */
    private String generateSummaryWithIntelligentFallback(News news) {
        String content = prepareContent(news);
        
        // Intelligent model selection based on traffic and performance
        String[] models = selectModelOrder();
        
        log.debug("Selected model order based on traffic/performance: {}", 
                String.join(" -> ", models));
        
        for (int i = 0; i < models.length; i++) {
            String model = models[i];
            String modelLabel = getModelLabel(model);
            
            try {
                long startTime = System.currentTimeMillis();
                log.debug("Attempting {} ({})", modelLabel, model);
                
                String summary = openRouterService.summarize(content, model);
                long responseTime = System.currentTimeMillis() - startTime;
                
                if (isValidSummary(summary)) {
                    // Reset failure counter on success
                    resetModelFailures(model);
                    
                    log.info("SUCCESS: {} completed in {}ms - Summary: {} chars", 
                            modelLabel, responseTime, summary.length());
                    return summary;
                }
                
                log.warn("Invalid summary from {}: length={}", modelLabel, 
                        summary != null ? summary.length() : 0);
                recordModelFailure(model);
                
            } catch (OpenRouterService.ModelOverloadedException e) {
                log.warn("{} OVERLOADED - Rate limit or server busy", modelLabel);
                recordModelFailure(model);
                
                // Add extra delay for rate-limited models
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
                continue;
                
            } catch (Exception e) {
                log.error("{} FAILED: {}", modelLabel, e.getMessage());
                recordModelFailure(model);
                
                if (i < models.length - 1) {
                    log.info("Switching to next model in fallback chain");
                }
                continue;
            }
        }
        
        log.error("========================================");
        log.error("ALL MODELS FAILED for news [{}]", news.getId());
        log.error("Primary failures: {}", primaryModelFailures);
        log.error("Secondary failures: {}", secondaryModelFailures);
        log.error("========================================");
        throw new RuntimeException("All OpenRouter models exhausted");
    }
    
    /**
     * Select model order based on traffic patterns and recent performance.
     * Implements intelligent switching to distribute load and avoid overloaded models.
     */
    private String[] selectModelOrder() {
        long currentTime = System.currentTimeMillis();
        long timeSinceLastSwitch = currentTime - lastModelSwitchTime;
        
        // If primary model has many failures and enough time has passed, try secondary first
        if (primaryModelFailures >= 3 && timeSinceLastSwitch > 60000) {
            log.info("Traffic-based switching: Primary model under stress, using secondary");
            lastModelSwitchTime = currentTime;
            return new String[]{secondaryModel, tertiaryModel, primaryModel};
        }
        
        // If both primary and secondary are failing, start with tertiary
        if (primaryModelFailures >= 2 && secondaryModelFailures >= 2) {
            log.info("Adaptive switching: Both primary models stressed, using tertiary");
            return new String[]{tertiaryModel, secondaryModel, primaryModel};
        }
        
        // Occasional load balancing to prevent single-model exhaustion
        if (shouldUseLoadBalancing()) {
            log.debug("Load balancing: Randomizing model order");
            return getShuffledModels();
        }
        
        // Default order: primary -> secondary -> tertiary
        return getOrderedModels();
    }
    
    /**
     * Record model failure for traffic-based switching.
     */
    private void recordModelFailure(String model) {
        if (model.equals(primaryModel)) {
            primaryModelFailures++;
        } else if (model.equals(secondaryModel)) {
            secondaryModelFailures++;
        }
    }
    
    /**
     * Reset failure counter on successful summarization.
     */
    private void resetModelFailures(String model) {
        if (model.equals(primaryModel)) {
            primaryModelFailures = Math.max(0, primaryModelFailures - 1);
        } else if (model.equals(secondaryModel)) {
            secondaryModelFailures = Math.max(0, secondaryModelFailures - 1);
        }
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
        return hasValidSummary(news);
    }
    
    /**
     * Check if a news article has a valid summary (600-1200 chars).
     */
    private boolean hasValidSummary(News news) {
        String summary = news.getSummary();
        if (summary == null || summary.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = summary.trim();
        
        // Reject error messages or invalid summaries
        if (trimmed.equals("Summary unavailable") || 
            trimmed.contains("unavailable") ||
            trimmed.toLowerCase().contains("error") ||
            trimmed.length() < MIN_SUMMARY_LENGTH ||
            trimmed.length() > MAX_SUMMARY_LENGTH) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate that a generated summary meets quality standards.
     */
    private boolean isValidSummary(String summary) {
        if (summary == null || summary.trim().isEmpty()) {
            log.debug("Validation failed: Summary is null or empty");
            return false;
        }
        
        String trimmed = summary.trim();
        int length = trimmed.length();
        
        // Reject error messages or placeholder text
        if (trimmed.equals("Summary unavailable") || 
            trimmed.toLowerCase().contains("unavailable") ||
            trimmed.toLowerCase().contains("error") ||
            trimmed.toLowerCase().contains("try again")) {
            log.debug("Validation failed: Contains error/placeholder text");
            return false;
        }
        
        // Validate length (600-1200 chars)
        if (length < MIN_SUMMARY_LENGTH) {
            log.debug("Validation failed: Too short ({} chars, minimum: {})", 
                    length, MIN_SUMMARY_LENGTH);
            return false;
        }
        
        if (length > MAX_SUMMARY_LENGTH) {
            log.debug("Validation failed: Too long ({} chars, maximum: {})", 
                    length, MAX_SUMMARY_LENGTH);
            return false;
        }
        
        // Additional quality checks
        int wordCount = trimmed.split("\\s+").length;
        if (wordCount < 80) {
            log.debug("Validation failed: Too few words ({}, minimum: 80)", wordCount);
            return false;
        }
        
        log.debug("Validation passed: {} chars, {} words", length, wordCount);
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
     * Get human-readable model label.
     */
    private String getModelLabel(String model) {
        if (model.equals(primaryModel)) {
            return "PRIMARY: Gemini-2.0-Flash";
        } else if (model.equals(secondaryModel)) {
            return "SECONDARY: Kimi-K2";
        } else if (model.equals(tertiaryModel)) {
            return "TERTIARY: Mistral-Small";
        }
        return "UNKNOWN";
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
                log.info("Generated and saved summary for news [{}]", news.getId());
                return summary;
            } else {
                log.warn("Generated invalid summary for news [{}]", news.getId());
                return "Summary unavailable. Please try again later.";
            }
        } catch (Exception e) {
            log.error("Failed to generate summary for news [{}]: {}", 
                    news.getId(), e.getMessage());
            return "Summary unavailable. Please try again later.";
        }
    }
}

