package com.bharathva.feed.controller;

import com.bharathva.feed.dto.CreateFeedRequest;
import com.bharathva.feed.dto.FeedResponse;
import com.bharathva.feed.service.FeedService;
import com.bharathva.feed.service.UserClient;
import com.bharathva.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FeedController.class)
class FeedControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FeedService feedService;

    @MockBean
    private UserClient userClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void createFeed_Success() throws Exception {
        // Given
        CreateFeedRequest request = new CreateFeedRequest("test-user-id", "Hello World!");
        FeedResponse response = new FeedResponse();
        response.setId("feed-123");
        response.setUserId("test-user-id");
        response.setMessage("Hello World!");

        when(userClient.validateUser("test-user-id")).thenReturn(true);
        when(feedService.createFeed(any(CreateFeedRequest.class), any(String.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/feed/create")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("feed-123"))
                .andExpect(jsonPath("$.data.userId").value("test-user-id"))
                .andExpect(jsonPath("$.data.message").value("Hello World!"));
    }

    @Test
    @WithMockUser
    void createFeed_InvalidUser() throws Exception {
        // Given
        CreateFeedRequest request = new CreateFeedRequest("invalid-user-id", "Hello World!");

        when(userClient.validateUser("invalid-user-id")).thenReturn(false);

        // When & Then
        mockMvc.perform(post("/api/feed/create")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid user"));
    }

    @Test
    void createFeed_Unauthenticated() throws Exception {
        // Given
        CreateFeedRequest request = new CreateFeedRequest("test-user-id", "Hello World!");

        // When & Then
        mockMvc.perform(post("/api/feed/create")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void createFeed_EmptyMessage() throws Exception {
        // Given
        CreateFeedRequest request = new CreateFeedRequest("test-user-id", "");

        // When & Then
        mockMvc.perform(post("/api/feed/create")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void createFeed_MessageTooLong() throws Exception {
        // Given
        String longMessage = "a".repeat(501); // 501 characters
        CreateFeedRequest request = new CreateFeedRequest("test-user-id", longMessage);

        // When & Then
        mockMvc.perform(post("/api/feed/create")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
