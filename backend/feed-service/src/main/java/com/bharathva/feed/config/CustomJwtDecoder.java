package com.bharathva.feed.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * Custom JWT Decoder with enhanced logging and error handling
 * This ensures consistent JWT validation with auth-service
 */
public class CustomJwtDecoder implements JwtDecoder {
    
    private static final Logger log = LoggerFactory.getLogger(CustomJwtDecoder.class);
    private final SecretKey secretKey;
    
    public CustomJwtDecoder(String jwtSecret) {
        // CRITICAL: Use same key generation method as auth-service
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        log.info("CustomJwtDecoder initialized with secret key length: {}", jwtSecret.length());
    }
    
    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            // CRITICAL: Log at INFO level to see validation attempts
            String tokenPrefix = token.length() > 20 ? token.substring(0, 20) + "..." : token;
            log.info("🔐 [CustomJwtDecoder] Attempting to decode JWT token (prefix: {})", tokenPrefix);
            
            // Parse and validate JWT using same library and method as auth-service
            // Using the same parser configuration as JwtService.extractAllClaims()
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Extract claims
            String subject = claims.getSubject();
            String userId = claims.get("userId", String.class);
            String email = claims.get("email", String.class);
            String username = claims.get("username", String.class);
            Date issuedAt = claims.getIssuedAt();
            Date expiration = claims.getExpiration();
            
            log.info("✅ [CustomJwtDecoder] JWT decoded successfully - userId: {}, email: {}, issuedAt: {}, expiresAt: {}", 
                    userId, email, issuedAt, expiration);
            
            // Check expiration with 60 second clock skew tolerance
            if (expiration != null) {
                long now = System.currentTimeMillis();
                long expTime = expiration.getTime();
                long skew = 60000; // 60 seconds
                
                if (expTime < (now - skew)) {
                    log.warn("JWT token expired - exp: {}, now: {}, diff: {}ms", 
                            expTime, now, (now - expTime));
                    throw new OAuth2AuthenticationException(
                            new OAuth2Error("invalid_token", "Token expired", null));
                }
            }
            
            // Build Spring Security Jwt object
            return Jwt.withTokenValue(token)
                    .header("alg", "HS256")
                    .claim("sub", subject)
                    .claim("userId", userId)
                    .claim("email", email)
                    .claim("username", username)
                    .claim("type", claims.get("type", String.class))
                    .issuedAt(issuedAt != null ? Instant.ofEpochMilli(issuedAt.getTime()) : Instant.now())
                    .expiresAt(expiration != null ? Instant.ofEpochMilli(expiration.getTime()) : Instant.now().plusSeconds(3600))
                    .build();
                    
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.error("❌ [CustomJwtDecoder] JWT token expired - exp: {}, now: {}, message: {}", 
                    e.getClaims().getExpiration(), new Date(), e.getMessage());
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_token", "Token expired", null), e);
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.error("❌ [CustomJwtDecoder] JWT signature validation failed - message: {}, token prefix: {}", 
                    e.getMessage(), token.length() > 20 ? token.substring(0, 20) + "..." : token);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_token", "Invalid token signature", null), e);
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.error("❌ [CustomJwtDecoder] Malformed JWT token - message: {}", e.getMessage());
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_token", "Malformed token", null), e);
        } catch (Exception e) {
            log.error("❌ [CustomJwtDecoder] Unexpected error decoding JWT - type: {}, message: {}, token prefix: {}", 
                    e.getClass().getSimpleName(), e.getMessage(), 
                    token.length() > 20 ? token.substring(0, 20) + "..." : token, e);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_token", "Token validation failed: " + e.getMessage(), null), e);
        }
    }
}

