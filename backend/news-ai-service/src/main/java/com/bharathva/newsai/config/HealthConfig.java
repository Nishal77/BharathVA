package com.bharathva.newsai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HealthConfig {

    private static final Logger log = LoggerFactory.getLogger(HealthConfig.class);

    @Bean
    public HealthIndicator customHealthIndicator() {
        return new HealthIndicator() {
            @Override
            public Health health() {
                try {
                    return Health.up()
                            .withDetail("service", "news-ai-service")
                            .withDetail("status", "UP")
                            .withDetail("timestamp", System.currentTimeMillis())
                            .build();
                } catch (Exception e) {
                    log.error("Health check failed: {}", e.getMessage());
                    return Health.down()
                            .withDetail("service", "news-ai-service")
                            .withDetail("error", e.getMessage())
                            .build();
                }
            }
        };
    }
}

