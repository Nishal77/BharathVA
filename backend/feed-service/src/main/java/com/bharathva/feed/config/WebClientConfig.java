package com.bharathva.feed.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    
    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;
    
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
    
    @Bean
    public WebClient authServiceWebClient(WebClient.Builder webClientBuilder) {
        return webClientBuilder
                .baseUrl(authServiceUrl)
                .build();
    }
}
