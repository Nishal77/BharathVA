package com.bharathva.auth.controller;

import com.bharathva.auth.service.SessionManagementService;
import com.bharathva.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SessionController.class)
class SessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SessionManagementService sessionManagementService;

    @Autowired
    private ObjectMapper objectMapper;

    private String validAccessToken;
    private String validRefreshToken;

    @BeforeEach
    void setUp() {
        validAccessToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1MjA1YjY0Mi1hNzNlLTQwZjUtYjFkZC1iZjMzZWE1ZjIwYTIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwidXNlcklkIjoiNTIwNWI2NDItYTczZS00MGY1LWIxZGQtYmYzM2VhNWYyMGEyIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2Mjc3MTQ3NCwiZXhwIjoxNzYyNzc1MDc0fQ.test";
        validRefreshToken = "test-refresh-token-12345";
    }

    @Test
    void testGetCurrentRefreshToken_Success() throws Exception {
        when(sessionManagementService.getCurrentSessionRefreshToken(anyString()))
                .thenReturn(validRefreshToken);

        mockMvc.perform(get("/auth/sessions/current-refresh-token")
                .header("Authorization", validAccessToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Current refresh token retrieved successfully"))
                .andExpect(jsonPath("$.data.refreshToken").value(validRefreshToken));
    }

    @Test
    void testGetCurrentRefreshToken_MissingAuthHeader() throws Exception {
        mockMvc.perform(get("/auth/sessions/current-refresh-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid or missing authorization header"));
    }

    @Test
    void testGetCurrentRefreshToken_InvalidAuthHeader() throws Exception {
        mockMvc.perform(get("/auth/sessions/current-refresh-token")
                .header("Authorization", "InvalidToken")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testGetCurrentRefreshToken_NoActiveSession() throws Exception {
        when(sessionManagementService.getCurrentSessionRefreshToken(anyString()))
                .thenThrow(new RuntimeException("No active session found"));

        mockMvc.perform(get("/auth/sessions/current-refresh-token")
                .header("Authorization", validAccessToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("No active session found"));
    }
}




