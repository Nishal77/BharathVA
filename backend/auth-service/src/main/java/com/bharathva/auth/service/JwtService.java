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
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(UUID userId, String email, String username) {
        return generateToken(new HashMap<>(), userId, email, username);
    }

    public String generateToken(Map<String, Object> extraClaims, UUID userId, String email, String username) {
        log.info("🔐 Generating JWT token for user: {}", email);
        log.debug("User ID: {}, Username: {}", userId, username);
        
        Date issuedAt = new Date(System.currentTimeMillis());
        Date expiresAt = new Date(System.currentTimeMillis() + jwtExpiration);
        
        String token = Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userId.toString())
                .claim("email", email)
                .claim("username", username)
                .claim("userId", userId.toString())
                .setIssuedAt(issuedAt)
                .setExpiration(expiresAt)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
        
        log.info("✅ JWT Token Generated Successfully");
        log.info("📋 Token Preview: {}...{}", token.substring(0, Math.min(20, token.length())), 
                 token.length() > 20 ? token.substring(token.length() - 10) : "");
        log.info("⏰ Issued At: {}", issuedAt);
        log.info("⏰ Expires At: {}", expiresAt);
        log.info("⏱️  Token Valid For: {} milliseconds ({} hours)", jwtExpiration, jwtExpiration / 3600000);
        
        return token;
    }

    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.get("username", String.class));
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public UUID extractUserId(String token) {
        String userIdStr = extractClaim(token, claims -> claims.get("userId", String.class));
        return UUID.fromString(userIdStr);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UUID userId) {
        try {
            log.info("🔍 Validating JWT token for user ID: {}", userId);
            final UUID extractedUserId = extractUserId(token);
            boolean isValid = (extractedUserId.equals(userId) && !isTokenExpired(token));
            
            if (isValid) {
                log.info("✅ Token is VALID for user: {}", extractedUserId);
            } else {
                log.warn("❌ Token is INVALID - User ID mismatch or expired");
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("❌ Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public Boolean validateToken(String token) {
        try {
            log.info("🔍 Validating JWT token (no user check)");
            boolean isValid = !isTokenExpired(token);
            
            if (isValid) {
                UUID userId = extractUserId(token);
                String email = extractEmail(token);
                String username = extractUsername(token);
                Date expiration = extractExpiration(token);
                
                log.info("✅ Token is VALID");
                log.info("👤 User ID: {}", userId);
                log.info("📧 Email: {}", email);
                log.info("👤 Username: {}", username);
                log.info("⏰ Expires At: {}", expiration);
            } else {
                log.warn("❌ Token is EXPIRED");
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("❌ Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String refreshToken(String token) {
        try {
            log.info("🔄 Refreshing JWT token");
            final Claims claims = extractAllClaims(token);
            final UUID userId = UUID.fromString(claims.get("userId", String.class));
            final String email = claims.get("email", String.class);
            final String username = claims.get("username", String.class);
            
            log.info("🔄 Generating new token for user: {}", email);
            String newToken = generateToken(userId, email, username);
            
            log.info("✅ Token refreshed successfully");
            return newToken;
        } catch (Exception e) {
            log.error("❌ Unable to refresh token: {}", e.getMessage());
            throw new RuntimeException("Unable to refresh token", e);
        }
    }
}
