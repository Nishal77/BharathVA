package com.bharathva.auth.service;

import com.bharathva.auth.dto.LoginRequest;
import com.bharathva.auth.dto.LoginResponse;
import com.bharathva.auth.entity.User;
import com.bharathva.auth.entity.UserSession;
import com.bharathva.auth.exception.InvalidCredentialsException;
import com.bharathva.auth.repository.UserRepository;
import com.bharathva.auth.repository.UserSessionRepository;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Transactional
    public LoginResponse login(LoginRequest loginRequest, String ipAddress, String deviceInfo) {
        log.info("===========================================");
        log.info("🔐 LOGIN ATTEMPT");
        log.info("===========================================");
        log.info("📧 Email: {}", loginRequest.getEmail());
        log.info("🔑 Password provided: {} characters", loginRequest.getPassword() != null ? loginRequest.getPassword().length() : 0);
        
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    log.error("❌ User not found in database for email: {}", loginRequest.getEmail());
                    return new InvalidCredentialsException("Incorrect email or password");
                });

        log.info("===========================================");
        log.info("✅ USER LOGIN - DATABASE VERIFICATION");
        log.info("===========================================");
        log.info("🆔 User ID: {}", user.getId());
        log.info("📧 Email: {}", user.getEmail());
        log.info("👤 Username: {}", user.getUsername());
        log.info("📛 Full Name: '{}'", user.getFullName());
        log.info("📛 Full Name Type: {}", user.getFullName() != null ? user.getFullName().getClass().getSimpleName() : "NULL");
        log.info("📛 Full Name Length: {}", user.getFullName() != null ? user.getFullName().length() : "NULL");
        log.info("📱 Phone: {}", user.getPhoneNumber());
        log.info("🌍 Country Code: {}", user.getCountryCode());
        log.info("📅 Date of Birth: {}", user.getDateOfBirth());
        log.info("✅ Email Verified: {}", user.getIsEmailVerified());
        log.info("🔒 Password Hash: {}...", user.getPasswordHash() != null ? user.getPasswordHash().substring(0, Math.min(20, user.getPasswordHash().length())) : "NULL");
        log.info("===========================================");

        if (!user.getIsEmailVerified()) {
            log.warn("❌ Login attempt for unverified email: {}", loginRequest.getEmail());
            throw new InvalidCredentialsException("Please verify your email before logging in");
        }

        log.info("🔍 Checking password match...");
        log.info("   Input password: {} characters", loginRequest.getPassword().length());
        log.info("   Stored hash starts with: {}", user.getPasswordHash().substring(0, Math.min(10, user.getPasswordHash().length())));
        
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash());
        log.info("   Password matches: {}", passwordMatches);
        
        if (!passwordMatches) {
            log.error("❌ PASSWORD MISMATCH!");
            log.error("   This means the password '{}' does not match the stored hash", loginRequest.getPassword());
            log.error("   Either the user entered wrong password, or registration didn't hash it correctly");
            throw new InvalidCredentialsException("Incorrect password");
        }
        
        log.info("✅ Password verified successfully!");
        log.info("===========================================");

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getUsername());
        String refreshToken = jwtService.generateRefreshToken();

        LocalDateTime refreshExpiresAt = LocalDateTime.now()
                .plusSeconds(jwtService.getRefreshExpirationMillis() / 1000);

        // Create and save session with immediate flush to database
        UserSession session = new UserSession(user, refreshToken, refreshExpiresAt, ipAddress, deviceInfo);
        UserSession savedSession = userSessionRepository.save(session);
        
        // Force immediate flush to database for real-time storage
        entityManager.flush();
        
        // Refresh to get the actual database state
        entityManager.refresh(savedSession);

        log.info("===========================================");
        log.info("✅ LOGIN SUCCESSFUL");
        log.info("===========================================");
        log.info("📧 User Email: {}", user.getEmail());
        log.info("🆔 User ID: {}", user.getId());
        log.info("👤 Username: {}", user.getUsername());
        log.info("📛 Full Name: '{}'", user.getFullName());
        log.info("-------------------------------------------");
        log.info("🔑 ACCESS TOKEN (JWT):");
        log.info("{}", accessToken);
        log.info("-------------------------------------------");
        log.info("🔄 REFRESH TOKEN (Session Token):");
        log.info("{}", refreshToken);
        log.info("-------------------------------------------");
        log.info("💾 SESSION SAVED TO DATABASE:");
        log.info("Session ID: {}", savedSession.getId());
        log.info("User ID: {}", savedSession.getUser().getId());
        log.info("Refresh Token: {}", savedSession.getRefreshToken());
        log.info("Expires At: {}", savedSession.getExpiresAt());
        log.info("Created At: {}", savedSession.getCreatedAt());
        log.info("IP Address: {}", savedSession.getIpAddress());
        log.info("Device Info: {}", savedSession.getDeviceInfo());
        log.info("-------------------------------------------");
        log.info("📊 Active sessions for this user: {}", userSessionRepository.countActiveSessionsByUserId(user.getId(), LocalDateTime.now()));
        log.info("===========================================");
        
        System.out.println("\n===========================================");
        System.out.println("✅ LOGIN SUCCESSFUL - SESSION CREATED");
        System.out.println("===========================================");
        System.out.println("📧 Email: " + user.getEmail());
        System.out.println("👤 Username: " + user.getUsername());
        System.out.println("🆔 User ID: " + user.getId());
        System.out.println("-------------------------------------------");
        System.out.println("🔑 JWT ACCESS TOKEN:");
        System.out.println(accessToken);
        System.out.println("-------------------------------------------");
        System.out.println("🔄 REFRESH TOKEN (Session Token):");
        System.out.println(refreshToken);
        System.out.println("-------------------------------------------");
        System.out.println("💾 DATABASE SESSION DETAILS:");
        System.out.println("Session ID: " + savedSession.getId());
        System.out.println("User ID (FK): " + savedSession.getUser().getId());
        System.out.println("Expires At: " + savedSession.getExpiresAt());
        System.out.println("Created At: " + savedSession.getCreatedAt());
        System.out.println("IP Address: " + savedSession.getIpAddress());
        System.out.println("Device Info: " + savedSession.getDeviceInfo());
        System.out.println("-------------------------------------------");
        System.out.println("📊 Total active sessions: " + userSessionRepository.countActiveSessionsByUserId(user.getId(), LocalDateTime.now()));
        System.out.println("===========================================\n");

        log.info("🔍 Creating LoginResponse with fullName: '{}'", user.getFullName());
        
        LoginResponse response = new LoginResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                jwtService.getAccessExpirationMillis(),
                jwtService.getRefreshExpirationMillis(),
                "Login successful"
        );
        
        log.info("🔍 LoginResponse created - fullName: '{}'", response.getFullName());
        return response;
    }

    public boolean validateToken(String token) {
        try {
            log.info("Validating token with database session check");
            
            // First validate JWT signature and expiration
            if (!jwtService.validateToken(token)) {
                log.warn("JWT validation failed - invalid or expired");
                return false;
            }
            
            // Extract user ID from JWT
            UUID userId = jwtService.extractUserId(token);
            
            // CRITICAL: Check if user has any active session in database
            long activeSessions = userSessionRepository.countActiveSessionsByUserId(userId, LocalDateTime.now());
            
            if (activeSessions == 0) {
                log.warn("Token validation failed - no active session in database for user: {}", userId);
                log.warn("This means the session was deleted (logout from another device or admin action)");
                return false;
            }
            
            log.info("Token validation successful - JWT valid and session exists in database");
            log.info("User {} has {} active session(s)", userId, activeSessions);
            return true;
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return false;
        }
    }

    public UUID getUserIdFromToken(String token) {
        try {
            return jwtService.extractUserId(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
    }

    @Transactional
    public LoginResponse refreshToken(String refreshToken) {
        log.info("Processing refresh token request");
        
        UserSession session = userSessionRepository.findByRefreshTokenAndNotExpired(refreshToken, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired refresh token"));

        if (!session.isValid()) {
            log.warn("Attempted to use expired refresh token");
            userSessionRepository.deleteByRefreshToken(refreshToken);
            throw new RuntimeException("Refresh token has expired");
        }

        // Update last_used_at timestamp
        session.setLastUsedAt(LocalDateTime.now());
        userSessionRepository.save(session);

        User user = session.getUser();

        String newAccessToken = jwtService.generateAccessToken(
                user.getId(), 
                user.getEmail(), 
                user.getUsername()
        );

        log.info("Access token refreshed successfully for user: {}", user.getEmail());

        return new LoginResponse(
                newAccessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                jwtService.getAccessExpirationMillis(),
                jwtService.getRefreshExpirationMillis(),
                "Token refreshed successfully"
        );
    }

    @Transactional
    public void logout(String refreshToken) {
        log.info("Processing logout request");
        userSessionRepository.deleteByRefreshToken(refreshToken);
        log.info("User session deleted successfully");
    }

    @Transactional
    public void logoutAllSessions(UUID userId) {
        log.info("Logging out all sessions for user: {}", userId);
        userSessionRepository.deleteAllByUserId(userId);
        log.info("All sessions deleted for user: {}", userId);
    }

    /**
     * Get user profile data by user ID
     */
    public Map<String, Object> getUserProfileData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.info("🔍 getUserProfileData - Retrieved user from database:");
        log.info("   User ID: {}", user.getId());
        log.info("   Username: {}", user.getUsername());
        log.info("   Full Name: '{}'", user.getFullName());
        log.info("   Full Name Type: {}", user.getFullName() != null ? user.getFullName().getClass().getSimpleName() : "NULL");

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", user.getId());
        profileData.put("email", user.getEmail());
        profileData.put("username", user.getUsername());
        profileData.put("fullName", user.getFullName());
        profileData.put("phoneNumber", user.getPhoneNumber());
        profileData.put("countryCode", user.getCountryCode());
        profileData.put("dateOfBirth", user.getDateOfBirth());
        profileData.put("isEmailVerified", user.getIsEmailVerified());
        profileData.put("createdAt", user.getCreatedAt());

        log.info("🔍 getUserProfileData - Profile data map:");
        log.info("   fullName in map: '{}'", profileData.get("fullName"));

        return profileData;
    }
}
