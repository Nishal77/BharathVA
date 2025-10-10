package com.bharathva.auth.security;

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

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String requestURI = request.getRequestURI();
        
        // Skip JWT validation for public endpoints
        if (isPublicEndpoint(requestURI)) {
            logger.debug("Public endpoint accessed: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No valid Authorization header found for: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            
            // Validate token
            if (jwtService.validateToken(jwt)) {
                // Extract user information from JWT
                UUID userId = jwtService.extractUserId(jwt);
                String email = jwtService.extractEmail(jwt);
                String username = jwtService.extractUsername(jwt);
                
                logger.info("🔓 Authenticated user: {} ({})", username, email);
                
                // Create authentication token with user details
                // Using email as principal for better identification
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, // principal
                        null, // credentials (not needed for JWT)
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
                
                // Add additional details
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                logger.debug("Security context set for user: {}", email);
            } else {
                logger.warn("❌ Invalid JWT token for request: {}", requestURI);
            }
        } catch (Exception e) {
            logger.error("❌ JWT authentication error: {}", e.getMessage());
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
