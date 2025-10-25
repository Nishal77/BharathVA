package com.bharathva.feed.controller;

import com.bharathva.feed.dto.FeedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for handling real-time feed events
 */
@Controller
public class WebSocketController {
    
    private static final Logger log = LoggerFactory.getLogger(WebSocketController.class);
    
    /**
     * Handle client connection and send welcome message
     */
    @MessageMapping("/feeds/connect")
    @SendTo("/topic/feeds")
    public FeedEvent handleConnection() {
        log.info("🔌 Client connected to WebSocket feed channel");
        return new FeedEvent("CONNECTION_ESTABLISHED", null, null, "Connected to real-time feed updates");
    }
    
    /**
     * Handle client disconnection
     */
    @MessageMapping("/feeds/disconnect")
    @SendTo("/topic/feeds")
    public FeedEvent handleDisconnection() {
        log.info("🔌 Client disconnected from WebSocket feed channel");
        return new FeedEvent("CONNECTION_CLOSED", null, null, "Disconnected from real-time feed updates");
    }
}
