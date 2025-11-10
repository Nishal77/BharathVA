package com.bharathva.feed.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.io.IOException;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Bean
    public JwtDecoder jwtDecoder() {
        // CRITICAL: Use custom JWT decoder that matches auth-service validation logic
        // This ensures consistent JWT validation across services and provides detailed error logging
        log.info("Initializing JWT decoder with secret key length: {}", jwtSecret.length());
        return new CustomJwtDecoder(jwtSecret);
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/feed/health", "/actuator/**").permitAll()
                .requestMatchers("/api/feed/test/**").permitAll()
                .requestMatchers("/api/feed/public/**").permitAll()
                .requestMatchers("/api/feed/user/**").permitAll()
                .requestMatchers("/api/feed/notifications/health").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/feed/notifications/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/feed/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/feed/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/feed/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(new JwtAuthenticationConverter())
                )
                .authenticationEntryPoint((request, response, authException) -> {
                    log.error("OAuth2 authentication failed for {} {} - Error: {}, Message: {}", 
                        request.getMethod(), request.getRequestURI(), 
                        authException.getClass().getSimpleName(), authException.getMessage());
                    log.error("Authorization header present: {}", 
                        request.getHeader("Authorization") != null ? "Yes" : "No");
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    try {
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + 
                            authException.getMessage().replace("\"", "\\\"") + "\"}");
                    } catch (IOException e) {
                        log.error("Failed to write error response", e);
                    }
                })
            );
        
        log.info("Security filter chain configured - PUT requests for /api/feed/notifications/** are explicitly authenticated");
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
