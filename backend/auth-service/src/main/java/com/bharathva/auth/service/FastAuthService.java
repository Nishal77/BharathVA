package com.bharathva.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Fast Authentication Service for high-performance token validation.
 * This service performs STATELESS JWT validation without database queries.
 * 
 * Use this for:
 * - Regular API requests requiring authentication
 * - High-frequency validation checks
 * - Performance-critical endpoints
 * 
 * For security-critical operations (logout, password change, etc.),
 * use AuthenticationService.validateTokenWithSessionCheck() instead.
 */
@Service
public class FastAuthService {

    private static final Logger log = LoggerFactory.getLogger(FastAuthService.class);

    @Autowired
    private JwtService jwtService;

    /**
     * Fast, stateless JWT validation.
     * This method ONLY checks:
     * 1. JWT signature validity
     * 2. Token expiration
     * 3. Token structure and claims
     * 
     * It does NOT check:
     * - Database session status
     * - User account status
     * - Revoked tokens
     * 
     * Performance: <5ms (in-memory only)
     * 
     * @param token JWT access token
     * @return true if token is valid, false otherwise
     */
    public boolean validateTokenFast(String token) {
        try {
            return jwtService.validateToken(token);
        } catch (Exception e) {
            log.debug("Fast token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Fast extraction of user ID from JWT without database lookup.
     * 
     * @param token JWT access token
     * @return UUID of the user
     * @throws RuntimeException if token is invalid
     */
    public UUID getUserIdFromTokenFast(String token) {
        try {
            return jwtService.extractUserId(token);
        } catch (Exception e) {
            log.error("Failed to extract user ID from token: {}", e.getMessage());
            throw new RuntimeException("Invalid token");
        }
    }

    /**
     * Fast extraction of username from JWT.
     * 
     * @param token JWT access token
     * @return username
     */
    public String getUsernameFromToken(String token) {
        try {
            return jwtService.extractUsername(token);
        } catch (Exception e) {
            log.error("Failed to extract username from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Fast extraction of email from JWT.
     * 
     * @param token JWT access token
     * @return email address
     */
    public String getEmailFromToken(String token) {
        try {
            return jwtService.extractEmail(token);
        } catch (Exception e) {
            log.error("Failed to extract email from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if token is expired (fast, in-memory check).
     * 
     * @param token JWT access token
     * @return true if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            return !jwtService.validateToken(token);
        } catch (Exception e) {
            return true;
        }
    }
}

