package com.bharathva.auth.service;

import com.bharathva.auth.dto.LoginRequest;
import com.bharathva.auth.dto.LoginResponse;
import com.bharathva.auth.entity.User;
import com.bharathva.auth.entity.UserSession;
import com.bharathva.auth.exception.InvalidCredentialsException;
import com.bharathva.auth.repository.UserRepository;
import com.bharathva.auth.repository.UserSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationService Login Tests")
class AuthenticationServiceTest {

    private UserRepository userRepository;
    private UserSessionRepository userSessionRepository;
    private JwtService jwtService;
    private PasswordEncoder passwordEncoder;
    private AuthenticationService authenticationService;

    private User testUser;
    private LoginRequest validLoginRequest;
    private String testEmail;
    private String testPassword;
    private String hashedPassword;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testEmail = "nishal08@gmail.com";
        testPassword = "TestPassword123";
        hashedPassword = "$2a$10$hashedPasswordString";

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail(testEmail);
        testUser.setUsername("nishal08");
        testUser.setFullName("Nishal Poojary");
        testUser.setPasswordHash(hashedPassword);
        testUser.setIsEmailVerified(true);

        validLoginRequest = new LoginRequest();
        validLoginRequest.setEmail(testEmail);
        validLoginRequest.setPassword(testPassword);
        
        // Create mocks manually to avoid Java 25 compatibility issues with Mockito
        // Java 25 is not fully supported by Byte Buddy (Mockito's dependency)
        userRepository = mock(UserRepository.class);
        userSessionRepository = mock(UserSessionRepository.class);
        jwtService = mock(JwtService.class);
        passwordEncoder = mock(PasswordEncoder.class);
        
        // Create service instance and inject mocks manually
        authenticationService = new AuthenticationService();
        ReflectionTestUtils.setField(authenticationService, "userRepository", userRepository);
        ReflectionTestUtils.setField(authenticationService, "userSessionRepository", userSessionRepository);
        ReflectionTestUtils.setField(authenticationService, "jwtService", jwtService);
        ReflectionTestUtils.setField(authenticationService, "passwordEncoder", passwordEncoder);
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLogin_Success() {
        // Arrange
        String ipAddress = "192.168.0.1";
        String deviceInfo = "iOS 18.6 | iPhone";
        String accessToken = "test-access-token";
        String refreshToken = "test-refresh-token";
        long accessExpiration = 3600000L;
        long refreshExpiration = 604800000L;

        when(userRepository.findByEmail(testEmail.toLowerCase().trim()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, hashedPassword))
                .thenReturn(true);
        when(jwtService.generateAccessToken(testUserId, testEmail, "nishal08"))
                .thenReturn(accessToken);
        when(jwtService.generateRefreshToken())
                .thenReturn(refreshToken);
        when(jwtService.getAccessExpirationMillis())
                .thenReturn(accessExpiration);
        when(jwtService.getRefreshExpirationMillis())
                .thenReturn(refreshExpiration);
        when(userSessionRepository.save(any(UserSession.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        LoginResponse response = authenticationService.login(validLoginRequest, ipAddress, deviceInfo);

        // Assert
        assertNotNull(response);
        assertEquals(accessToken, response.getAccessToken());
        assertEquals(refreshToken, response.getRefreshToken());
        assertEquals(testUserId, response.getUserId());
        assertEquals(testEmail, response.getEmail());
        assertEquals("nishal08", response.getUsername());
        assertEquals("Nishal Poojary", response.getFullName());
        assertEquals(accessExpiration, response.getExpiresIn());
        assertEquals(refreshExpiration, response.getRefreshExpiresIn());
        assertEquals("Login successful", response.getMessage());

        // Verify interactions
        verify(userRepository, times(1)).findByEmail(testEmail.toLowerCase().trim());
        verify(passwordEncoder, times(1)).matches(testPassword, hashedPassword);
        verify(jwtService, times(1)).generateAccessToken(testUserId, testEmail, "nishal08");
        verify(jwtService, times(1)).generateRefreshToken();
        verify(userSessionRepository, times(1)).deleteAllByUserId(testUserId);
        verify(userSessionRepository, times(1)).save(any(UserSession.class));
    }

    @Test
    @DisplayName("Should normalize email to lowercase and trim")
    void testLogin_EmailNormalization() {
        // Arrange
        LoginRequest requestWithUpperCase = new LoginRequest();
        requestWithUpperCase.setEmail("  NISHAL08@GMAIL.COM  ");
        requestWithUpperCase.setPassword(testPassword);

        when(userRepository.findByEmail("nishal08@gmail.com"))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, hashedPassword))
                .thenReturn(true);
        when(jwtService.generateAccessToken(any(), any(), any()))
                .thenReturn("token");
        when(jwtService.generateRefreshToken())
                .thenReturn("refresh");
        when(jwtService.getAccessExpirationMillis())
                .thenReturn(3600000L);
        when(jwtService.getRefreshExpirationMillis())
                .thenReturn(604800000L);
        when(userSessionRepository.save(any(UserSession.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        authenticationService.login(requestWithUpperCase, "192.168.0.1", "device");

        // Assert
        verify(userRepository, times(1)).findByEmail("nishal08@gmail.com");
    }

    @Test
    @DisplayName("Should throw exception when email is empty")
    void testLogin_EmptyEmail() {
        // Arrange
        LoginRequest emptyEmailRequest = new LoginRequest();
        emptyEmailRequest.setEmail("");
        emptyEmailRequest.setPassword(testPassword);

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authenticationService.login(emptyEmailRequest, "192.168.0.1", "device")
        );

        assertEquals("Email is required", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("Should throw exception when email is null")
    void testLogin_NullEmail() {
        // Arrange
        LoginRequest nullEmailRequest = new LoginRequest();
        nullEmailRequest.setEmail(null);
        nullEmailRequest.setPassword(testPassword);

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authenticationService.login(nullEmailRequest, "192.168.0.1", "device")
        );

        assertEquals("Email is required", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testLogin_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail(testEmail.toLowerCase().trim()))
                .thenReturn(Optional.empty());

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authenticationService.login(validLoginRequest, "192.168.0.1", "device")
        );

        assertEquals("Incorrect email or password", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(testEmail.toLowerCase().trim());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when email not verified")
    void testLogin_EmailNotVerified() {
        // Arrange
        testUser.setIsEmailVerified(false);
        when(userRepository.findByEmail(testEmail.toLowerCase().trim()))
                .thenReturn(Optional.of(testUser));

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authenticationService.login(validLoginRequest, "192.168.0.1", "device")
        );

        assertEquals("Please verify your email before logging in", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(testEmail.toLowerCase().trim());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when password is incorrect")
    void testLogin_IncorrectPassword() {
        // Arrange
        when(userRepository.findByEmail(testEmail.toLowerCase().trim()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, hashedPassword))
                .thenReturn(false);

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authenticationService.login(validLoginRequest, "192.168.0.1", "device")
        );

        assertEquals("Incorrect email or password", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(testEmail.toLowerCase().trim());
        verify(passwordEncoder, times(1)).matches(testPassword, hashedPassword);
        verify(jwtService, never()).generateAccessToken(any(), any(), any());
    }

    @Test
    @DisplayName("Should clear existing sessions before creating new one")
    void testLogin_ClearsExistingSessions() {
        // Arrange
        when(userRepository.findByEmail(testEmail.toLowerCase().trim()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, hashedPassword))
                .thenReturn(true);
        when(jwtService.generateAccessToken(any(), any(), any()))
                .thenReturn("token");
        when(jwtService.generateRefreshToken())
                .thenReturn("refresh");
        when(jwtService.getAccessExpirationMillis())
                .thenReturn(3600000L);
        when(jwtService.getRefreshExpirationMillis())
                .thenReturn(604800000L);
        when(userSessionRepository.save(any(UserSession.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        authenticationService.login(validLoginRequest, "192.168.0.1", "device");

        // Assert
        verify(userSessionRepository, times(1)).deleteAllByUserId(testUserId);
        verify(userSessionRepository, times(1)).save(any(UserSession.class));
    }

    @Test
    @DisplayName("Should continue login even if session cleanup fails")
    void testLogin_SessionCleanupFailure() {
        // Arrange
        when(userRepository.findByEmail(testEmail.toLowerCase().trim()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, hashedPassword))
                .thenReturn(true);
        doThrow(new RuntimeException("Database error"))
                .when(userSessionRepository).deleteAllByUserId(testUserId);
        when(jwtService.generateAccessToken(any(), any(), any()))
                .thenReturn("token");
        when(jwtService.generateRefreshToken())
                .thenReturn("refresh");
        when(jwtService.getAccessExpirationMillis())
                .thenReturn(3600000L);
        when(jwtService.getRefreshExpirationMillis())
                .thenReturn(604800000L);
        when(userSessionRepository.save(any(UserSession.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        LoginResponse response = authenticationService.login(validLoginRequest, "192.168.0.1", "device");

        // Assert - Login should succeed despite session cleanup failure
        assertNotNull(response);
        verify(userSessionRepository, times(1)).deleteAllByUserId(testUserId);
        verify(userSessionRepository, times(1)).save(any(UserSession.class));
    }

    @Test
    @DisplayName("Should create session with correct IP and device info")
    void testLogin_CreatesSessionWithMetadata() {
        // Arrange
        String ipAddress = "192.168.0.49";
        String deviceInfo = "iOS 18.6 | iPhone 16 Plus";

        when(userRepository.findByEmail(testEmail.toLowerCase().trim()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, hashedPassword))
                .thenReturn(true);
        when(jwtService.generateAccessToken(any(), any(), any()))
                .thenReturn("token");
        when(jwtService.generateRefreshToken())
                .thenReturn("refresh");
        when(jwtService.getAccessExpirationMillis())
                .thenReturn(3600000L);
        when(jwtService.getRefreshExpirationMillis())
                .thenReturn(604800000L);
        when(userSessionRepository.save(any(UserSession.class)))
                .thenAnswer(invocation -> {
                    UserSession session = invocation.getArgument(0);
                    assertEquals(ipAddress, session.getIpAddress());
                    assertEquals(deviceInfo, session.getDeviceInfo());
                    assertEquals(testUser, session.getUser());
                    assertNotNull(session.getRefreshToken());
                    assertNotNull(session.getExpiresAt());
                    return session;
                });

        // Act
        authenticationService.login(validLoginRequest, ipAddress, deviceInfo);

        // Assert
        verify(userSessionRepository, times(1)).save(any(UserSession.class));
    }
}

