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

    // Authenticate user and create session
    @Transactional
    public LoginResponse login(LoginRequest loginRequest, String ipAddress, String deviceInfo) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Incorrect email or password"));

        if (!user.getIsEmailVerified()) {
            throw new InvalidCredentialsException("Please verify your email before logging in");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Incorrect email or password");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getUsername());
        String refreshToken = jwtService.generateRefreshToken();

        LocalDateTime refreshExpiresAt = LocalDateTime.now()
                .plusSeconds(jwtService.getRefreshExpirationMillis() / 1000);

        UserSession session = new UserSession(user, refreshToken, refreshExpiresAt, ipAddress, deviceInfo);
        UserSession savedSession = userSessionRepository.save(session);
        
        entityManager.flush();
        entityManager.refresh(savedSession);

        log.info("Login successful for user: {}", user.getEmail());

        return new LoginResponse(
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
    }

    // Validate JWT and check active session in database
    public boolean validateToken(String token) {
        try {
            if (!jwtService.validateToken(token)) {
                return false;
            }
            
            UUID userId = jwtService.extractUserId(token);
            long activeSessions = userSessionRepository.countActiveSessionsByUserId(userId, LocalDateTime.now());
            
            if (activeSessions == 0) {
                log.warn("No active session found for user: {}", userId);
                return false;
            }
            
            return true;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
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

    // Generate new access token using refresh token
    @Transactional
    public LoginResponse refreshToken(String refreshToken) {
        UserSession session = userSessionRepository.findByRefreshTokenAndNotExpired(refreshToken, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired refresh token"));

        if (!session.isValid()) {
            userSessionRepository.deleteByRefreshToken(refreshToken);
            throw new RuntimeException("Refresh token has expired");
        }

        session.setLastUsedAt(LocalDateTime.now());
        userSessionRepository.save(session);

        User user = session.getUser();
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getUsername());

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

    // Delete user session by refresh token
    @Transactional
    public void logout(String refreshToken) {
        userSessionRepository.deleteByRefreshToken(refreshToken);
    }

    // Delete all sessions for a user
    @Transactional
    public void logoutAllSessions(UUID userId) {
        userSessionRepository.deleteAllByUserId(userId);
    }

    // Retrieve user profile data by user ID
    public Map<String, Object> getUserProfileData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

        return profileData;
    }
}
