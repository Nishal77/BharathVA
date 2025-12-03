package com.bharathva.auth.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import com.bharathva.auth.service.JwtService;
import org.mockito.Mockito;

/**
 * Test configuration to provide mockable JWT service for unit tests
 * This works around Java 25 compatibility issues with Mockito inline mocking
 */
@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    @Primary
    public JwtService jwtService() {
        return Mockito.mock(JwtService.class);
    }
}


