package com.bharathva.newsai.service;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Intelligent AI-powered news summarization service with automatic model fallback.
 * Uses Google Gemini with multi-model strategy to handle rate limits and availability.
 * 
 * Fallback Strategy:
 * 1. Primary: gemini-1.5-flash (fastest, most cost-effective)
 * 2. Fallback 1: gemini-1.5-pro (more capable, higher rate limits)
 * 3. Fallback 2: gemini-1.0-pro (stable, reliable backup)
 * 
 * Automatically summarizes ALL news articles as they're published.
 */
@Service
public class SummarizerService {

    private static final Logger log = LoggerFactory.getLogger(SummarizerService.class);

    // Multi-model fallback strategy (using available models)
    // Verified models from Gemini API: gemini-2.5-flash, gemini-2.0-flash, gemini-2.0-flash-exp, gemini-2.5-pro
    private static final List<String> GEMINI_MODELS = Arrays.asList(
        "gemini-2.5-flash",       // Primary: Latest stable Flash model (best performance)
        "gemini-2.0-flash",       // Fallback 1: Stable Flash model
        "gemini-2.0-flash-exp",   // Fallback 2: Experimental Flash version
        "gemini-2.5-pro"          // Fallback 3: Pro model for complex tasks (if available)
    );
    
    private static final String API_BASE_URL = 
        "https://generativelanguage.googleapis.com/v1beta/models/";
    
    private static final int MIN_SUMMARY_LENGTH = 700;
    private static final int MAX_SUMMARY_LENGTH = 1500;
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private final String geminiApiKey;
    private final OkHttpClient httpClient;
    private final NewsRepository newsRepository;
    private final Gson gson;

    @Autowired
    public SummarizerService(NewsRepository newsRepository, @Value("${gemini.api-key}") String apiKey) {
        this.newsRepository = newsRepository;
        this.gson = new Gson();
        this.geminiApiKey = apiKey;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        
        log.info("========================================");
        log.info("SummarizerService initialized");
        log.info("Available models: {}", GEMINI_MODELS);
        log.info("API Key configured: {}", geminiApiKey != null && !geminiApiKey.isEmpty() ? "YES (***" + geminiApiKey.substring(Math.max(0, geminiApiKey.length() - 4)) + ")" : "NO - CHECK CONFIGURATION!");
        log.info("========================================");
        
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.error("⚠⚠⚠ GEMINI API KEY IS NOT CONFIGURED! Summarization will fail!");
        }
    }

    /**
     * Automatically summarize ALL news articles that don't have summaries yet.
     * This method is called by the scheduler after fetching new news.
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
                    
                    // Check if news has title and description
                    if (news.getTitle() == null || news.getTitle().trim().isEmpty()) {
                        log.warn("Skipping news [{}]: No title", news.getId());
                        failureCount++;
                        continue;
                    }
                    
                    if (news.getDescription() == null || news.getDescription().trim().isEmpty()) {
                        log.warn("News [{}] has no description, will use title only", news.getId());
                    }
                    
                    String summary = generateSummaryWithFallback(news);
                    
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
                    
                    // Rate limiting: Wait between API calls
                    Thread.sleep(1500); // 1.5 second delay to respect rate limits
                    
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
     * Generate summary with intelligent fallback across multiple Gemini models.
     * Tries models in order until one succeeds.
     */
    private String generateSummaryWithFallback(News news) {
        String lastError = null;
        
        for (String model : GEMINI_MODELS) {
            try {
                log.debug("Trying model: {}", model);
                String summary = generateSummaryWithModel(news, model);
                
                if (isValidSummary(summary)) {
                    log.debug("✓ Success with model: {}", model);
                    return summary;
                }
                
                log.debug("✗ Invalid summary from model: {}", model);
                
            } catch (IOException e) {
                lastError = e.getMessage();
                String errorMsg = e.getMessage();
                
                // Check for quota exceeded (429 with quota message)
                if (errorMsg.contains("429") || errorMsg.contains("quota") || errorMsg.contains("RESOURCE_EXHAUSTED")) {
                    log.error("⚠ QUOTA EXCEEDED for model {}: {}", model, errorMsg);
                    log.error("⚠ Daily quota limit reached. Please check your Gemini API quota or wait for reset.");
                    // Still try next model in case it has different quota
                    continue;
                }
                
                // If rate limited or overloaded, try next model
                if (errorMsg.contains("503") || errorMsg.contains("overloaded") || errorMsg.contains("SERVICE_UNAVAILABLE")) {
                    log.warn("✗ Model {} unavailable: {}", model, errorMsg);
                    log.info("→ Falling back to next model due to: {}", errorMsg);
                    continue;
                }
                
                log.warn("✗ Model {} failed: {}", model, errorMsg);
                
                // For other errors, wait a bit before retrying
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            } catch (RuntimeException e) {
                lastError = e.getMessage();
                log.error("✗ Model {} threw runtime exception: {}", model, e.getMessage());
                // Continue to next model
                continue;
            }
        }
        
        log.error("✗ All models failed. Last error: {}", lastError);
        throw new RuntimeException("All Gemini models failed: " + lastError);
    }

    /**
     * Generate summary using a specific Gemini model.
     */
    private String generateSummaryWithModel(News news, String modelName) throws IOException {
        String title = news.getTitle();
        String description = news.getDescription();
        
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("News title cannot be empty");
        }
        
        // Prepare content for summarization
        String content = prepareContent(title, description);
        log.debug("Prepared content for model {}: {} characters", modelName, content.length());
        
        // Build Gemini API request
        String requestJson = buildGeminiRequest(title, content);
        log.debug("Built Gemini API request for model {}: {} characters", modelName, requestJson.length());
        
        // Call Gemini API with specific model
        String apiUrl = API_BASE_URL + modelName + ":generateContent?key=" + geminiApiKey;
        log.debug("Calling Gemini API: {}", apiUrl.replace(geminiApiKey, "***"));

        Request request = new Request.Builder()
                .url(apiUrl)
                .post(RequestBody.create(requestJson, JSON))
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            
            if (!response.isSuccessful()) {
                log.error("Gemini API error for model {}: Status {} - Response: {}", 
                    modelName, response.code(), 
                    responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody);
                
                String error = String.format("Model %s returned status: %d. Response: %s", 
                    modelName, response.code(), 
                    responseBody.length() > 200 ? responseBody.substring(0, 200) : responseBody);
                throw new IOException(error);
            }

            log.debug("Received successful response from model {}: {} characters", 
                modelName, responseBody.length());
            return parseGeminiResponse(responseBody);
        } catch (IOException e) {
            log.error("IO error calling Gemini API for model {}: {}", modelName, e.getMessage());
            throw e;
        }
    }

    /**
     * Prepare content for summarization from title and description.
     * ALWAYS uses both title and description to provide context.
     */
    private String prepareContent(String title, String description) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty for summarization");
        }
        
        StringBuilder content = new StringBuilder();
        content.append("Title: ").append(title.trim());
        
        // ALWAYS include description if available for better context
        if (description != null && !description.trim().isEmpty()) {
            content.append("\n\nDescription: ").append(description.trim());
        } else {
            // If no description, just use title but note it
            content.append("\n\n(No additional description provided)");
        }
        
        String result = content.toString();
        
        // Limit content length for API efficiency
        if (result.length() > 8000) {
            result = result.substring(0, 8000) + "...";
        }
        
        log.debug("Prepared content for summarization: {} characters", result.length());
        return result;
    }

    /**
     * Build a clean, optimized prompt for Gemini.
     * Targets 700-1500 character summaries with Perplexity-style output.
     * Uses BOTH title and description for comprehensive context.
     */
    private String buildGeminiRequest(String title, String content) {
        String prompt = String.format(
            """
            You are an expert AI news analyst for BharathVA, India's premier social platform.
            
            Task: Analyze the provided news TITLE and DESCRIPTION, then create a comprehensive, intelligent summary.
            
            Your summary MUST:
            1. Be between 700-1500 characters (strict requirement - aim for 1000-1200 characters for optimal length)
            2. Provide full context from BOTH the title AND description
            3. Explain the significance and broader implications
            4. Cover Who, What, When, Where, Why, and How
            5. Include relevant background or historical context if applicable
            6. Use clear, engaging, journalistic language
            7. Write in flowing paragraphs (NO bullet points, NO numbered lists)
            8. Maintain complete objectivity while being engaging
            9. Make sense even to readers unfamiliar with the topic
            10. Be informative and comprehensive
            
            Style: Write like Perplexity AI - comprehensive, contextual, deeply informative, and well-researched.
            
            News Article Information:
            %s
            
            Generate a comprehensive 700-1500 character summary NOW. Ensure it is detailed and informative:
            """, 
            content.replace("\"", "'").replace("\\", "")
        );
        
        // Build proper Gemini API request JSON structure
        // Format: { "contents": [{ "parts": [{ "text": "prompt" }] }] }
        JsonObject requestJson = new JsonObject();
        
        // Create part with text
        JsonObject part = new JsonObject();
        part.addProperty("text", prompt);
        
        // Create parts array
        com.google.gson.JsonArray partsArray = new com.google.gson.JsonArray();
        partsArray.add(part);
        
        // Create content object with parts
        JsonObject contentObj = new JsonObject();
        contentObj.add("parts", partsArray);
        
        // Create contents array
        com.google.gson.JsonArray contentsArray = new com.google.gson.JsonArray();
        contentsArray.add(contentObj);
        
        // Add contents to request
        requestJson.add("contents", contentsArray);
        
        return gson.toJson(requestJson);
    }

    /**
     * Parse Gemini API response and extract the generated summary.
     */
    private String parseGeminiResponse(String responseBody) throws IOException {
        try {
            JsonObject json = gson.fromJson(responseBody, JsonObject.class);

            // Check for errors in response
            if (json.has("error")) {
                JsonObject error = json.getAsJsonObject("error");
                String errorMessage = error.has("message") ? error.get("message").getAsString() : "Unknown error";
                int errorCode = error.has("code") ? error.get("code").getAsInt() : 0;
                throw new IOException(String.format("Gemini API error [%d]: %s", errorCode, errorMessage));
            }

            if (!json.has("candidates") || json.getAsJsonArray("candidates").isEmpty()) {
                log.error("No candidates in Gemini response. Full response: {}", responseBody);
                throw new IOException("No candidates in Gemini response");
            }

            JsonObject candidate = json.getAsJsonArray("candidates").get(0).getAsJsonObject();
            
            // Check for finish reason
            if (candidate.has("finishReason")) {
                String finishReason = candidate.get("finishReason").getAsString();
                if (!"STOP".equals(finishReason)) {
                    log.warn("Gemini finish reason: {} (expected STOP)", finishReason);
                }
            }

            // Extract text from response
            JsonObject content = candidate.getAsJsonObject("content");
            if (content == null || !content.has("parts")) {
                throw new IOException("Invalid content structure in Gemini response");
            }

            com.google.gson.JsonArray parts = content.getAsJsonArray("parts");
            if (parts == null || parts.isEmpty()) {
                throw new IOException("No parts in Gemini response content");
            }

            String summary = parts.get(0).getAsJsonObject()
                    .get("text").getAsString()
                    .trim();
            
            if (summary == null || summary.isEmpty()) {
                throw new IOException("Empty summary generated by Gemini");
            }
            
            log.debug("Generated summary length: {} characters", summary.length());
            
            // Ensure summary meets length requirements
            if (summary.length() < MIN_SUMMARY_LENGTH) {
                log.warn("Summary too short: {} chars (min {}). Will still accept if >= 500 chars", 
                    summary.length(), MIN_SUMMARY_LENGTH);
                // Accept summaries >= 500 chars even if below minimum (to avoid rejecting good summaries)
                if (summary.length() < 500) {
                    throw new IOException(String.format("Summary too short: %d chars (minimum: %d)", 
                        summary.length(), MIN_SUMMARY_LENGTH));
                }
            } else if (summary.length() > MAX_SUMMARY_LENGTH) {
                log.info("Truncating summary from {} to {} chars", 
                    summary.length(), MAX_SUMMARY_LENGTH);
                summary = summary.substring(0, MAX_SUMMARY_LENGTH).trim();
            }
            
            log.debug("Final summary length: {} characters", summary.length());
            return summary;
            
        } catch (IOException e) {
            throw e; // Re-throw IOExceptions
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}. Response body: {}", 
                e.getMessage(), responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody);
            throw new IOException("Invalid Gemini response format: " + e.getMessage(), e);
        }
    }

    /**
     * Find all news articles that need summarization.
     */
    private List<News> findUnsummarizedNews() {
        return newsRepository.findAll().stream()
                .filter(news -> !hasSummary(news))
                .toList();
    }

    /**
     * Check if a news article has a valid summary.
     * Accepts summaries >= 500 characters (flexible minimum) or >= 700 (preferred minimum).
     */
    private boolean hasSummary(News news) {
        String summary = news.getSummary();
        if (summary == null || summary.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = summary.trim();
        
        // Reject error messages
        if (trimmed.equals("Summary unavailable") || 
            trimmed.contains("unavailable") ||
            trimmed.toLowerCase().contains("error") ||
            trimmed.length() < 500) {
            return false;
        }
        
        // Accept summaries >= 500 chars (flexible) or >= 700 chars (preferred)
        return trimmed.length() >= 500;
    }

    /**
     * Validate that a generated summary meets quality standards.
     * Accepts summaries >= 500 characters (flexible minimum) or >= 700 (preferred minimum).
     */
    private boolean isValidSummary(String summary) {
        if (summary == null || summary.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = summary.trim();
        
        // Reject error messages
        if (trimmed.equals("Summary unavailable") || 
            trimmed.contains("unavailable") ||
            trimmed.toLowerCase().contains("error")) {
            return false;
        }
        
        // Accept summaries >= 500 chars (flexible) or >= 700 chars (preferred)
        // This allows for good summaries that might be slightly shorter than 700
        return trimmed.length() >= 500;
    }

    /**
     * Truncate title for logging purposes.
     */
    private String truncateTitle(String title) {
        if (title == null) return "Unknown";
        return title.length() > 60 ? title.substring(0, 60) + "..." : title;
    }

    /**
     * Get summary on-demand for a specific news article with intelligent fallback.
     * First checks if summary exists, otherwise generates one using fallback strategy.
     */
    @Transactional
    public String getSummaryForNews(News news) {
        if (hasSummary(news)) {
            log.info("Using existing summary for news [{}]", news.getId());
            return news.getSummary();
        }
        
        try {
            log.info("Generating new summary for news [{}]", news.getId());
            String summary = generateSummaryWithFallback(news);
            
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
