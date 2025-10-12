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
        Date issuedAt = new Date(System.currentTimeMillis());
        Date expiresAt = new Date(System.currentTimeMillis() + jwtExpiration);
        
        return Jwts.builder()
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
    }

    public String generateRefreshToken() {
        byte[] randomBytes = new byte[REFRESH_TOKEN_LENGTH];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
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
            throw new IllegalArgumentException("Invalid user ID in token - userId claim missing");
        }
        try {
            return UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user ID in token - invalid UUID format");
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Failed to extract claims from JWT: {}", e.getMessage());
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
            final UUID extractedUserId = extractUserId(token);
            return extractedUserId.equals(userId) && !isTokenExpired(token);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String refreshAccessToken(UUID userId, String email, String username) {
        try {
            return generateAccessToken(userId, email, username);
        } catch (Exception e) {
            log.error("Failed to refresh access token: {}", e.getMessage());
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
