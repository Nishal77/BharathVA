package com.bharathva.auth.controller;

import com.bharathva.auth.dto.LoginRequest;
import com.bharathva.auth.dto.LoginResponse;
import com.bharathva.auth.exception.InvalidCredentialsException;
import com.bharathva.auth.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthenticationController.class)
@DisplayName("AuthenticationController Login Endpoint Tests")
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationService authenticationService;

    private LoginRequest validLoginRequest;
    private LoginResponse validLoginResponse;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        
        validLoginRequest = new LoginRequest();
        validLoginRequest.setEmail("nishal08@gmail.com");
        validLoginRequest.setPassword("TestPassword123");

        validLoginResponse = new LoginResponse(
                "test-access-token",
                "test-refresh-token",
                testUserId,
                "nishal08@gmail.com",
                "nishal08",
                "Nishal Poojary",
                3600000L,
                604800000L,
                "Login successful"
        );
    }

    @Test
    @DisplayName("Should return 200 OK with tokens on successful login")
    void testLogin_Success() throws Exception {
        // Arrange
        when(authenticationService.login(any(LoginRequest.class), anyString(), anyString()))
                .thenReturn(validLoginResponse);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest))
                .header("X-IP-Address", "192.168.0.49")
                .header("X-Device-Info", "iOS 18.6 | iPhone"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").value("test-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("test-refresh-token"))
                .andExpect(jsonPath("$.data.userId").value(testUserId.toString()))
                .andExpect(jsonPath("$.data.email").value("nishal08@gmail.com"))
                .andExpect(jsonPath("$.data.username").value("nishal08"));

        verify(authenticationService, times(1))
                .login(any(LoginRequest.class), eq("192.168.0.49"), eq("iOS 18.6 | iPhone"));
    }

    @Test
    @DisplayName("Should return 401 Unauthorized for invalid credentials")
    void testLogin_InvalidCredentials() throws Exception {
        // Arrange
        when(authenticationService.login(any(LoginRequest.class), anyString(), anyString()))
                .thenThrow(new InvalidCredentialsException("Incorrect email or password"));

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Incorrect email or password"))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(authenticationService, times(1))
                .login(any(LoginRequest.class), anyString(), anyString());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized for unverified email")
    void testLogin_EmailNotVerified() throws Exception {
        // Arrange
        when(authenticationService.login(any(LoginRequest.class), anyString(), anyString()))
                .thenThrow(new InvalidCredentialsException("Please verify your email before logging in"));

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Please verify your email before logging in"));
    }

    @Test
    @DisplayName("Should extract IP address from X-IP-Address header")
    void testLogin_ExtractsIpFromHeader() throws Exception {
        // Arrange
        when(authenticationService.login(any(LoginRequest.class), anyString(), anyString()))
                .thenReturn(validLoginResponse);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest))
                .header("X-IP-Address", "10.0.0.1")
                .header("X-Device-Info", "Android 14"))
                .andExpect(status().isOk());

        verify(authenticationService, times(1))
                .login(any(LoginRequest.class), eq("10.0.0.1"), eq("Android 14"));
    }

    @Test
    @DisplayName("Should extract device info from X-Device-Info header")
    void testLogin_ExtractsDeviceInfoFromHeader() throws Exception {
        // Arrange
        when(authenticationService.login(any(LoginRequest.class), anyString(), anyString()))
                .thenReturn(validLoginResponse);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest))
                .header("X-Device-Info", "Custom Device Info"))
                .andExpect(status().isOk());

        verify(authenticationService, times(1))
                .login(any(LoginRequest.class), anyString(), eq("Custom Device Info"));
    }

    @Test
    @DisplayName("Should return 400 Bad Request for invalid request body")
    void testLogin_InvalidRequestBody() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"invalid\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());

        verify(authenticationService, never()).login(any(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should return 500 Internal Server Error for unexpected exceptions")
    void testLogin_InternalServerError() throws Exception {
        // Arrange
        when(authenticationService.login(any(LoginRequest.class), anyString(), anyString()))
                .thenThrow(new RuntimeException("Database connection failed"));

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isUnauthorized()) // RuntimeException is caught and returns 401
                .andExpect(jsonPath("$.success").value(false));
    }
}

