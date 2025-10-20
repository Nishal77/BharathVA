package com.bharathva.auth.security;

import com.bharathva.auth.service.FastAuthService;
import com.bharathva.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

/**
 * Optimized JWT Authentication Filter.
 * Uses FAST stateless validation (no database queries) for maximum performance.
 * Target: <10ms per request
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private FastAuthService fastAuthService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String requestURI = request.getRequestURI();
        
        // Skip authentication for public endpoints
        if (isPublicEndpoint(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        
        // No token present - continue without authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            
            // FAST VALIDATION: Stateless JWT check (no database)
            // This is ~5-10ms vs 50-200ms with database check
            if (fastAuthService.validateTokenFast(jwt)) {
                UUID userId = jwtService.extractUserId(jwt);
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId.toString(),
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                logger.debug("Invalid JWT token for request: {}", requestURI);
            }
        } catch (Exception e) {
            logger.debug("JWT authentication failed: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/auth/register") ||
               requestURI.startsWith("/auth/login") ||
               requestURI.startsWith("/auth/health") ||
               requestURI.startsWith("/actuator") ||
               requestURI.equals("/error");
    }
}
