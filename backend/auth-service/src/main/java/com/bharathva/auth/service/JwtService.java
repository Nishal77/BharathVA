package com.bharathva.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int REFRESH_TOKEN_LENGTH = 64;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateAccessToken(UUID userId, String email, String username) {
        return generateAccessToken(new HashMap<>(), userId, email, username);
    }

    public String generateAccessToken(Map<String, Object> extraClaims, UUID userId, String email, String username) {
        log.info("Generating JWT access token for user: {}", email);
        log.debug("User ID: {}, Username: {}", userId, username);
        
        Date issuedAt = new Date(System.currentTimeMillis());
        Date expiresAt = new Date(System.currentTimeMillis() + jwtExpiration);
        
        String token = Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userId.toString())
                .claim("email", email)
                .claim("username", username)
                .claim("userId", userId.toString())
                .claim("type", "access")
                .setIssuedAt(issuedAt)
                .setExpiration(expiresAt)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
        
        log.info("JWT Access Token Generated Successfully");
        log.info("Token Preview: {}...{}", token.substring(0, Math.min(20, token.length())), 
                 token.length() > 20 ? token.substring(token.length() - 10) : "");
        log.info("Issued At: {}", issuedAt);
        log.info("Expires At: {}", expiresAt);
        log.info("Token Valid For: {} milliseconds ({} hours)", jwtExpiration, jwtExpiration / 3600000);
        
        return token;
    }

    public String generateRefreshToken() {
        byte[] randomBytes = new byte[REFRESH_TOKEN_LENGTH];
        secureRandom.nextBytes(randomBytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        log.info("Refresh token generated successfully");
        return refreshToken;
    }

    public long getRefreshExpirationMillis() {
        return refreshExpiration;
    }

    public long getAccessExpirationMillis() {
        return jwtExpiration;
    }

    public String generateToken(UUID userId, String email, String username) {
        return generateAccessToken(userId, email, username);
    }

    public String generateToken(Map<String, Object> extraClaims, UUID userId, String email, String username) {
        return generateAccessToken(extraClaims, userId, email, username);
    }

    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.get("username", String.class));
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public UUID extractUserId(String token) {
        String userIdStr = extractClaim(token, claims -> claims.get("userId", String.class));
        if (userIdStr == null || userIdStr.trim().isEmpty()) {
            log.error("❌ JWT token does not contain 'userId' claim");
            throw new IllegalArgumentException("Invalid user ID in token - userId claim missing");
        }
        try {
            return UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            log.error("❌ JWT token contains invalid userId format: {}", userIdStr);
            throw new IllegalArgumentException("Invalid user ID in token - invalid UUID format");
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            log.debug("🔍 JWT Claims extracted: {}", claims);
            log.debug("🔍 JWT Claims keys: {}", claims.keySet());
            log.debug("🔍 JWT userId claim: {}", claims.get("userId"));
            log.debug("🔍 JWT sub claim: {}", claims.getSubject());
            
            return claims;
        } catch (Exception e) {
            log.error("❌ Failed to extract claims from JWT: {}", e.getMessage());
            throw e;
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UUID userId) {
        try {
            log.info("Validating JWT token for user ID: {}", userId);
            final UUID extractedUserId = extractUserId(token);
            boolean isValid = (extractedUserId.equals(userId) && !isTokenExpired(token));
            
            if (isValid) {
                log.info("Token is VALID for user: {}", extractedUserId);
            } else {
                log.warn("Token is INVALID - User ID mismatch or expired");
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public Boolean validateToken(String token) {
        try {
            log.info("Validating JWT token (no user check)");
            boolean isValid = !isTokenExpired(token);
            
            if (isValid) {
                UUID userId = extractUserId(token);
                String email = extractEmail(token);
                String username = extractUsername(token);
                Date expiration = extractExpiration(token);
                
                log.info("Token is VALID");
                log.info("User ID: {}", userId);
                log.info("Email: {}", email);
                log.info("Username: {}", username);
                log.info("Expires At: {}", expiration);
            } else {
                log.warn("Token is EXPIRED");
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String refreshAccessToken(UUID userId, String email, String username) {
        try {
            log.info("Generating new access token from refresh for user: {}", email);
            String newToken = generateAccessToken(userId, email, username);
            log.info("Access token refreshed successfully");
            return newToken;
        } catch (Exception e) {
            log.error("Unable to refresh access token: {}", e.getMessage());
            throw new RuntimeException("Unable to refresh access token", e);
        }
    }

    public String refreshToken(String token) {
        return refreshAccessToken(
            extractUserId(token),
            extractEmail(token),
            extractUsername(token)
        );
    }
}
