package com.bharathva.feed.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class PostStatsClient {
    
    private static final Logger log = LoggerFactory.getLogger(PostStatsClient.class);
    
    @Autowired
    private WebClient authServiceWebClient;
    
    @Value("${gateway.url:http://localhost:8080}")
    private String gatewayUrl;
    
    public void incrementPostCount(String userId) {
        try {
            String endpoint = gatewayUrl != null && !gatewayUrl.trim().isEmpty() 
                ? "/api/auth/stats/posts/increment/{userId}" 
                : "/auth/stats/posts/increment/{userId}";
            
            log.info("Incrementing post count for user: {} via endpoint: {}", userId, endpoint);
            
            Map<String, Object> response = authServiceWebClient
                    .post()
                    .uri(endpoint, userId)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse -> {
                        log.error("HTTP error response: {} - {}", clientResponse.statusCode(), 
                            clientResponse.statusCode().value());
                        return clientResponse.bodyToMono(String.class)
                            .doOnNext(body -> log.error("Error body: {}", body))
                            .then(Mono.error(new RuntimeException("HTTP " + clientResponse.statusCode())));
                    })
                    .bodyToMono(Map.class)
                    .block();
            
            if (response != null) {
                Boolean success = (Boolean) response.get("success");
                if (Boolean.TRUE.equals(success)) {
                    Map<String, Object> data = (Map<String, Object>) response.get("data");
                    Integer postsCount = data != null ? (Integer) data.get("postsCount") : null;
                    log.info("Successfully incremented post count for user: {} - new count: {}", userId, postsCount);
                } else {
                    String message = (String) response.get("message");
                    String error = (String) response.get("error");
                    String errorMessage = message != null ? message : (error != null ? error : "Unknown error");
                    log.error("Post count increment failed for user: {} - message: {}", userId, errorMessage);
                    throw new RuntimeException("Failed to increment post count: " + errorMessage);
                }
            } else {
                log.error("Null response from auth service for user: {}", userId);
                throw new RuntimeException("Null response from auth service when incrementing post count");
            }
        } catch (WebClientResponseException e) {
            log.error("HTTP error incrementing post count for user: {} - HTTP {} - Response: {}", 
                userId, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("HTTP error incrementing post count: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error incrementing post count for user: {} - {}", userId, e.getMessage(), e);
            throw new RuntimeException("Error incrementing post count: " + e.getMessage(), e);
        }
    }
    
    public void decrementPostCount(String userId) {
        try {
            String endpoint = gatewayUrl != null && !gatewayUrl.trim().isEmpty() 
                ? "/api/auth/stats/posts/decrement/{userId}" 
                : "/auth/stats/posts/decrement/{userId}";
            
            log.info("Decrementing post count for user: {} via endpoint: {}", userId, endpoint);
            
            Map<String, Object> response = authServiceWebClient
                    .post()
                    .uri(endpoint, userId)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse -> {
                        log.error("HTTP error response: {} - {}", clientResponse.statusCode(), 
                            clientResponse.statusCode().value());
                        return clientResponse.bodyToMono(String.class)
                            .doOnNext(body -> log.error("Error body: {}", body))
                            .then(Mono.error(new RuntimeException("HTTP " + clientResponse.statusCode())));
                    })
                    .bodyToMono(Map.class)
                    .block();
            
            if (response != null) {
                Boolean success = (Boolean) response.get("success");
                if (Boolean.TRUE.equals(success)) {
                    Map<String, Object> data = (Map<String, Object>) response.get("data");
                    Integer postsCount = data != null ? (Integer) data.get("postsCount") : null;
                    log.info("Successfully decremented post count for user: {} - new count: {}", userId, postsCount);
                } else {
                    String message = (String) response.get("message");
                    String error = (String) response.get("error");
                    String errorMessage = message != null ? message : (error != null ? error : "Unknown error");
                    log.error("Post count decrement failed for user: {} - message: {}", userId, errorMessage);
                    throw new RuntimeException("Failed to decrement post count: " + errorMessage);
                }
            } else {
                log.error("Null response from auth service for user: {}", userId);
                throw new RuntimeException("Null response from auth service when decrementing post count");
            }
        } catch (WebClientResponseException e) {
            log.error("HTTP error decrementing post count for user: {} - HTTP {} - Response: {}", 
                userId, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("HTTP error decrementing post count: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error decrementing post count for user: {} - {}", userId, e.getMessage(), e);
            throw new RuntimeException("Error decrementing post count: " + e.getMessage(), e);
        }
    }
    
    public void setPostCount(String userId, Integer count) {
        try {
            String endpoint = gatewayUrl != null && !gatewayUrl.trim().isEmpty() 
                ? "/api/auth/stats/posts/set/{userId}" 
                : "/auth/stats/posts/set/{userId}";
            
            log.info("Setting post count to {} for user: {} via endpoint: {}", count, userId, endpoint);
            
            Map<String, Object> requestBody = Map.of("count", count);
            
            Map<String, Object> response = authServiceWebClient
                    .post()
                    .uri(endpoint, userId)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse -> {
                        log.error("HTTP error response: {} - {}", clientResponse.statusCode(), 
                            clientResponse.statusCode().value());
                        return clientResponse.bodyToMono(String.class)
                            .doOnNext(body -> log.error("Error body: {}", body))
                            .then(Mono.error(new RuntimeException("HTTP " + clientResponse.statusCode())));
                    })
                    .bodyToMono(Map.class)
                    .block();
            
            if (response != null) {
                Boolean success = (Boolean) response.get("success");
                if (Boolean.TRUE.equals(success)) {
                    Map<String, Object> data = (Map<String, Object>) response.get("data");
                    Integer postsCount = data != null ? (Integer) data.get("postsCount") : null;
                    log.info("Successfully set post count to {} for user: {} - verified count: {}", 
                        count, userId, postsCount);
                } else {
                    String message = (String) response.get("message");
                    String error = (String) response.get("error");
                    String errorMessage = message != null ? message : (error != null ? error : "Unknown error");
                    log.error("Post count set failed for user: {} - message: {}", userId, errorMessage);
                    throw new RuntimeException("Failed to set post count: " + errorMessage);
                }
            } else {
                log.error("Null response from auth service for user: {}", userId);
                throw new RuntimeException("Null response from auth service when setting post count");
            }
        } catch (WebClientResponseException e) {
            log.error("HTTP error setting post count for user: {} - HTTP {} - Response: {}", 
                userId, e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("HTTP error setting post count: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error setting post count for user: {} - {}", userId, e.getMessage(), e);
            throw new RuntimeException("Error setting post count: " + e.getMessage(), e);
        }
    }
}

