package com.bharathva.feed.controller;

import com.bharathva.feed.dto.NotificationResponse;
import com.bharathva.feed.model.Notification;
import com.bharathva.feed.repository.NotificationRepository;
import com.bharathva.feed.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for NotificationController
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    private String testUserId;
    private String testActorId;

    @BeforeEach
    public void setUp() {
        notificationRepository.deleteAll();
        testUserId = UUID.randomUUID().toString();
        testActorId = UUID.randomUUID().toString();
    }

    @Test
    public void testNotificationHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/feed/notifications/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("notification-controller"));
    }

    @Test
    public void testGetNotificationsWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/feed/notifications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testGetNotificationsWithAuth() throws Exception {
        Notification notification = new Notification();
        notification.setRecipientUserId(testUserId);
        notification.setActorUserId(testActorId);
        notification.setType(Notification.NotificationType.LIKE);
        notification.setFeedId(UUID.randomUUID().toString());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        Page<NotificationResponse> result = notificationService.getNotificationsForUser(testUserId, 0, 20);
        assertNotNull(result);
        assertTrue(result.getTotalElements() >= 1);
    }

    @Test
    public void testNotificationRepository() {
        Notification notification = new Notification();
        notification.setRecipientUserId(testUserId);
        notification.setActorUserId(testActorId);
        notification.setType(Notification.NotificationType.LIKE);
        notification.setFeedId(UUID.randomUUID().toString());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        assertNotNull(saved.getId());

        long count = notificationRepository.countByRecipientUserIdAndIsReadFalse(testUserId);
        assertEquals(1, count);

        Page<Notification> notifications = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(
                testUserId, 
                org.springframework.data.domain.PageRequest.of(0, 20)
        );
        assertEquals(1, notifications.getTotalElements());
    }
}

