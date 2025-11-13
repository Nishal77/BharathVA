package com.bharathva.feed.config;

import com.bharathva.feed.service.PostCountSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Map;

@Configuration
@EnableScheduling
public class PostCountSyncConfig {
    
    private static final Logger log = LoggerFactory.getLogger(PostCountSyncConfig.class);
    
    @Autowired
    private PostCountSyncService postCountSyncService;
    
    private boolean initialSyncCompleted = false;
    
    @Bean
    public CommandLineRunner syncPostCountsOnStartup() {
        return args -> {
            log.info("========================================");
            log.info("STARTING POST COUNT SYNC ON APPLICATION STARTUP");
            log.info("========================================");
            
            try {
                Map<String, Object> result = postCountSyncService.syncAllPostCounts();
                Boolean success = (Boolean) result.get("success");
                
                if (Boolean.TRUE.equals(success)) {
                    Integer syncedUsers = (Integer) result.get("syncedUsers");
                    Integer failedUsers = (Integer) result.get("failedUsers");
                    Long totalPosts = ((Number) result.get("totalPosts")).longValue();
                    
                    log.info("========================================");
                    log.info("STARTUP SYNC COMPLETED SUCCESSFULLY");
                    log.info("Synced users: {}", syncedUsers);
                    log.info("Failed users: {}", failedUsers);
                    log.info("Total posts: {}", totalPosts);
                    log.info("========================================");
                    
                    initialSyncCompleted = true;
                } else {
                    String error = (String) result.get("error");
                    log.error("Startup sync failed: {}", error);
                }
            } catch (Exception e) {
                log.error("Error during startup sync: {}", e.getMessage(), e);
            }
        };
    }
    
    /**
     * Periodic sync every 5 minutes to catch any missed updates
     * This acts as a safety net in case real-time sync fails
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void periodicSync() {
        if (!initialSyncCompleted) {
            log.debug("Skipping periodic sync - initial sync not completed yet");
            return;
        }
        
        log.info("Running periodic post count sync (every 5 minutes)");
        try {
            Map<String, Object> result = postCountSyncService.syncAllPostCounts();
            Boolean success = (Boolean) result.get("success");
            
            if (Boolean.TRUE.equals(success)) {
                Integer syncedUsers = (Integer) result.get("syncedUsers");
                Integer failedUsers = (Integer) result.get("failedUsers");
                log.info("Periodic sync completed: {} users synced, {} failed", syncedUsers, failedUsers);
            } else {
                log.warn("Periodic sync completed with errors");
            }
        } catch (Exception e) {
            log.error("Error during periodic sync: {}", e.getMessage(), e);
        }
    }
}

