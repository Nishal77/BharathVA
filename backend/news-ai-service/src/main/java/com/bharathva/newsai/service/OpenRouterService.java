package com.bharathva.newsai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Production-grade OpenRouter API service for BharathVA news-ai-service.
 * Provides intelligent AI-powered text summarization with comprehensive error handling.
 * 
 * Features:
 * - Automatic retry logic with exponential backoff
 * - Rate limit detection and handling (429 errors)
 * - Server overload detection (5xx errors)
 * - Comprehensive logging and monitoring
 * - Configurable timeout and connection pooling
 * 
 * @author BharathVA Engineering Team
 */
@Service
public class OpenRouterService {

    private static final Logger log = LoggerFactory.getLogger(OpenRouterService.class);
    
    private static final String API_BASE_URL = "https://openrouter.ai/api/v1";
    private static final int MAX_RETRIES = 2;
    private static final Duration TIMEOUT = Duration.ofSeconds(60);
    private static final Duration INITIAL_RETRY_DELAY = Duration.ofMillis(500);
    
    @Value("${openrouter.api-key}")
    private String apiKey;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    /**
     * Initialize OpenRouter service with optimized WebClient configuration.
     */
    public OpenRouterService() {
        this.objectMapper = new ObjectMapper();
        this.webClient = WebClient.builder()
                .baseUrl(API_BASE_URL)
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer
                .build();
        
        log.info("========================================");
        log.info("OpenRouterService initialized");
        log.info("API Base URL: {}", API_BASE_URL);
        log.info("========================================");
    }
    
    /**
     * Validate API key on first use.
     */
    private void validateApiKey() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.error("========================================");
            log.error("CRITICAL: OpenRouter API key is not configured!");
            log.error("Set OPENROUTER_API_KEY in .env.local file");
            log.error("========================================");
            throw new IllegalStateException("OpenRouter API key is not configured");
        }
        
        if (!apiKey.startsWith("sk-or-v1-")) {
            log.warn("========================================");
            log.warn("WARNING: API key format looks incorrect");
            log.warn("Expected format: sk-or-v1-...");
            log.warn("Current format: {}", apiKey.substring(0, Math.min(10, apiKey.length())) + "...");
            log.warn("========================================");
        }
    }
    
    /**
     * Generate a comprehensive summary using the specified OpenRouter model.
     * 
     * @param text The text to summarize
     * @param model The OpenRouter model identifier
     * @return The generated summary
     * @throws SummarizationException if summarization fails after retries
     */
    public String summarize(String text, String model) throws SummarizationException {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be null or empty");
        }
        
        if (model == null || model.trim().isEmpty()) {
            throw new IllegalArgumentException("Model cannot be null or empty");
        }
        
        validateApiKey();
        
        log.debug("Summarizing text with model: {} (length: {} chars)", model, text.length());
        
        Map<String, Object> requestBody = buildRequestBody(text, model);
        
        try {
            String response = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "https://bharathva.in")
                    .header("X-Title", "BharathVA News AI")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .retryWhen(Retry.backoff(MAX_RETRIES, INITIAL_RETRY_DELAY)
                            .filter(this::isRetryableError)
                            .doBeforeRetry(retrySignal -> 
                                log.warn("Retrying request to model {} (attempt {})", 
                                        model, retrySignal.totalRetries() + 1)))
                    .block();
            
            return extractSummaryFromResponse(response, model);
            
        } catch (WebClientResponseException.TooManyRequests e) {
            log.error("Rate limit exceeded for model {}: {}", model, e.getMessage());
            throw new ModelOverloadedException("Rate limit exceeded for model: " + model, e);
            
        } catch (WebClientResponseException.Unauthorized e) {
            log.error("========================================");
            log.error("UNAUTHORIZED (401) - OpenRouter API Key Invalid!");
            log.error("Model: {}", model);
            log.error("Response: {}", e.getResponseBodyAsString());
            log.error("========================================");
            log.error("ACTION REQUIRED:");
            log.error("1. Verify OPENROUTER_API_KEY in .env.local");
            log.error("2. Get new API key from https://openrouter.ai");
            log.error("3. Restart service after updating key");
            log.error("========================================");
            throw new SummarizationException("Invalid OpenRouter API key - please update OPENROUTER_API_KEY", e);
            
        } catch (WebClientResponseException e) {
            if (e.getStatusCode().is5xxServerError()) {
                log.error("Server error from model {}: {} - {}", 
                        model, e.getStatusCode(), e.getMessage());
                throw new ModelOverloadedException("Model overloaded or unavailable: " + model, e);
            }
            
            log.error("HTTP error from model {}: {} - {}", 
                    model, e.getStatusCode(), e.getResponseBodyAsString());
            throw new SummarizationException("Failed to summarize with model " + model, e);
            
        } catch (Exception e) {
            log.error("Unexpected error during summarization with model {}: {}", 
                    model, e.getMessage(), e);
            throw new SummarizationException("Unexpected error during summarization", e);
        }
    }
    
    /**
     * Build the OpenRouter API request body with optimized parameters for news summarization.
     * Uses title and description to generate comprehensive, contextual summaries.
     */
    private Map<String, Object> buildRequestBody(String text, String model) {
        String prompt = String.format(
            """
            You are an expert AI news analyst for BharathVA, India's premier social media platform that delivers breaking news with deep context.
            
            Task: Create a comprehensive, intelligent summary that readers will find valuable and informative.
            
            CRITICAL REQUIREMENTS:
            - Length: EXACTLY 600-1200 characters (aim for 900 characters)
            - Style: Professional journalism with engaging narrative flow
            - Tone: Objective, factual, and authoritative
            - Structure: 2-3 flowing paragraphs (NO bullet points, NO numbered lists)
            
            YOUR SUMMARY MUST INCLUDE:
            1. WHO: Key people, organizations, or entities involved
            2. WHAT: The core event or development
            3. WHEN: Temporal context (dates, timeline)
            4. WHERE: Geographical location and relevance
            5. WHY: Underlying reasons, motivations, or causes
            6. HOW: Methods, processes, or mechanisms involved
            7. IMPACT: Significance and implications for readers
            8. CONTEXT: Relevant background or historical perspective
            
            WRITING GUIDELINES:
            - Start strong with the most important information
            - Use clear, precise language that any reader can understand
            - Include specific facts, figures, and names mentioned
            - Explain technical terms or unfamiliar concepts
            - Connect the story to broader themes when relevant
            - End with forward-looking implications if applicable
            
            AVOID:
            - Generic statements or filler content
            - Redundant phrasing or repetition
            - Speculation or opinion
            - Bullet points or numbered lists
            - Incomplete sentences or thoughts
            
            News Article Content:
            %s
            
            Generate a comprehensive, engaging summary (600-1200 characters) NOW:
            """, 
            text.replace("\"", "'").replace("\\", "")
        );
        
        return Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a world-class news analyst who creates comprehensive, engaging summaries that readers trust and value. Your summaries are factual, well-structured, and provide complete context."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.4,
                "max_tokens", 500,
                "top_p", 0.95,
                "frequency_penalty", 0.2,
                "presence_penalty", 0.1
        );
    }
    
    /**
     * Extract summary text from OpenRouter API response.
     */
    private String extractSummaryFromResponse(String response, String model) throws SummarizationException {
        try {
            JsonNode json = objectMapper.readTree(response);
            
            if (json.has("error")) {
                String errorMessage = json.path("error").path("message").asText("Unknown error");
                log.error("API error from model {}: {}", model, errorMessage);
                throw new SummarizationException("API error: " + errorMessage);
            }
            
            JsonNode choices = json.path("choices");
            if (choices.isEmpty()) {
                log.error("No choices in response from model {}", model);
                throw new SummarizationException("No choices in API response");
            }
            
            String summary = choices.get(0)
                    .path("message")
                    .path("content")
                    .asText()
                    .trim();
            
            if (summary.isEmpty()) {
                log.error("Empty summary from model {}", model);
                throw new SummarizationException("Empty summary generated");
            }
            
            log.debug("Successfully extracted summary from model {}: {} characters", 
                    model, summary.length());
            
            return summary;
            
        } catch (Exception e) {
            log.error("Failed to parse response from model {}: {}", model, e.getMessage());
            throw new SummarizationException("Failed to parse API response", e);
        }
    }
    
    /**
     * Determine if an error is retryable.
     */
    private boolean isRetryableError(Throwable throwable) {
        if (throwable instanceof WebClientResponseException webEx) {
            int statusCode = webEx.getStatusCode().value();
            // Retry on server errors (5xx) but not on client errors (4xx) except 429
            return statusCode >= 500 || statusCode == 429;
        }
        return false;
    }
    
    /**
     * Custom exception for summarization failures.
     */
    public static class SummarizationException extends Exception {
        public SummarizationException(String message) {
            super(message);
        }
        
        public SummarizationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
    
    /**
     * Custom exception for model overload/rate limit scenarios.
     */
    public static class ModelOverloadedException extends SummarizationException {
        public ModelOverloadedException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

