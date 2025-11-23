package com.bharathva.auth.service;

import com.bharathva.auth.entity.User;
import com.bharathva.auth.entity.UserSession;
import com.bharathva.auth.repository.UserSessionRepository;
import com.bharathva.auth.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionManagementServiceTest {

    @Mock
    private UserSessionRepository userSessionRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private SessionManagementService sessionManagementService;

    private User testUser;
    private UserSession testSession;
    private String testAccessToken;
    private String testRefreshToken;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testAccessToken = "test-access-token";
        testRefreshToken = "test-refresh-token-12345";

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");

        testSession = new UserSession();
        testSession.setId(UUID.randomUUID());
        testSession.setUser(testUser);
        testSession.setRefreshToken(testRefreshToken);
        testSession.setExpiresAt(LocalDateTime.now().plusDays(7));
        testSession.setCreatedAt(LocalDateTime.now());
        testSession.setLastUsedAt(LocalDateTime.now());
    }

    @Test
    void testGetCurrentSessionRefreshToken_Success() {
        when(jwtService.extractUserId(testAccessToken)).thenReturn(testUserId);
        
        List<UserSession> sessions = new ArrayList<>();
        sessions.add(testSession);
        when(userSessionRepository.findActiveSessionsByUserId(eq(testUserId), any(LocalDateTime.class)))
                .thenReturn(sessions);

        String result = sessionManagementService.getCurrentSessionRefreshToken(testAccessToken);

        assertNotNull(result);
        assertEquals(testRefreshToken, result);
        verify(jwtService, times(1)).extractUserId(testAccessToken);
        verify(userSessionRepository, times(1)).findActiveSessionsByUserId(eq(testUserId), any(LocalDateTime.class));
    }

    @Test
    void testGetCurrentSessionRefreshToken_NoActiveSession() {
        when(jwtService.extractUserId(testAccessToken)).thenReturn(testUserId);
        when(userSessionRepository.findActiveSessionsByUserId(eq(testUserId), any(LocalDateTime.class)))
                .thenReturn(new ArrayList<>());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sessionManagementService.getCurrentSessionRefreshToken(testAccessToken);
        });

        assertTrue(exception.getMessage().contains("No active session found"));
        verify(jwtService, times(1)).extractUserId(testAccessToken);
        verify(userSessionRepository, times(1)).findActiveSessionsByUserId(eq(testUserId), any(LocalDateTime.class));
    }

    @Test
    void testGetCurrentSessionRefreshToken_InvalidToken() {
        when(jwtService.extractUserId(testAccessToken))
                .thenThrow(new RuntimeException("Invalid token"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sessionManagementService.getCurrentSessionRefreshToken(testAccessToken);
        });

        assertTrue(exception.getMessage().contains("Failed to get current session refresh token"));
        verify(jwtService, times(1)).extractUserId(testAccessToken);
    }

    @Test
    void testGetCurrentSessionRefreshToken_MultipleSessions() {
        when(jwtService.extractUserId(testAccessToken)).thenReturn(testUserId);
        
        List<UserSession> sessions = new ArrayList<>();
        sessions.add(testSession);
        
        UserSession olderSession = new UserSession();
        olderSession.setId(UUID.randomUUID());
        olderSession.setUser(testUser);
        olderSession.setRefreshToken("older-refresh-token");
        olderSession.setExpiresAt(LocalDateTime.now().plusDays(7));
        olderSession.setCreatedAt(LocalDateTime.now().minusDays(1));
        sessions.add(olderSession);
        
        when(userSessionRepository.findActiveSessionsByUserId(eq(testUserId), any(LocalDateTime.class)))
                .thenReturn(sessions);

        String result = sessionManagementService.getCurrentSessionRefreshToken(testAccessToken);

        assertNotNull(result);
        assertEquals(testRefreshToken, result);
    }
}




