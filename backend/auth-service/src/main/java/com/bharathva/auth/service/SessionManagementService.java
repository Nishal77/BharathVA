package com.bharathva.auth.service;

import com.bharathva.auth.dto.UserSessionResponse;
import com.bharathva.auth.entity.UserSession;
import com.bharathva.auth.repository.UserSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionManagementService {

    private static final Logger log = LoggerFactory.getLogger(SessionManagementService.class);

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private JwtService jwtService;

    public List<UserSessionResponse> getActiveSessions(String accessToken) {
        try {
            UUID userId = jwtService.extractUserId(accessToken);
            List<UserSession> sessions = userSessionRepository.findActiveSessionsByUserId(userId, LocalDateTime.now());
            
            return sessions.stream()
                    .map(session -> {
                        UserSessionResponse response = new UserSessionResponse(
                                session.getId(),
                                session.getDeviceInfo() != null ? session.getDeviceInfo() : "Unknown Device",
                                session.getIpAddress() != null ? session.getIpAddress() : "Unknown IP",
                                session.getLastUsedAt(),
                                session.getCreatedAt(),
                                session.getExpiresAt(),
                                false
                        );
                        return response;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get active sessions: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch active sessions");
        }
    }

    @Transactional
    public void logoutSession(UUID sessionId, String accessToken) {
        try {
            UUID userId = jwtService.extractUserId(accessToken);
            
            UserSession session = userSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            if (!session.getUser().getId().equals(userId)) {
                throw new RuntimeException("Unauthorized to logout this session");
            }
            
            userSessionRepository.delete(session);
        } catch (Exception e) {
            log.error("Failed to logout session: {}", e.getMessage());
            throw new RuntimeException("Failed to logout session: " + e.getMessage());
        }
    }

    @Transactional
    public int logoutAllOtherSessions(String accessToken) {
        try {
            UUID userId = jwtService.extractUserId(accessToken);
            List<UserSession> allSessions = userSessionRepository.findActiveSessionsByUserId(userId, LocalDateTime.now());
            
            if (allSessions.size() <= 1) {
                return 0;
            }
            
            int loggedOutCount = allSessions.size() - 1;
            
            allSessions.stream()
                    .skip(1)
                    .forEach(userSessionRepository::delete);
            
            return loggedOutCount;
        } catch (Exception e) {
            log.error("Failed to logout other sessions: {}", e.getMessage());
            throw new RuntimeException("Failed to logout other sessions: " + e.getMessage());
        }
    }
}

