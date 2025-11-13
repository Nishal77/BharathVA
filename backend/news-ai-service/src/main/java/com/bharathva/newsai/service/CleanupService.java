package com.bharathva.newsai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to clean up old and outdated news entries from the database.
 * Removes news older than 48 hours, keeping only recent and relevant articles.
 */
@Service
public class CleanupService {

    private static final Logger log = LoggerFactory.getLogger(CleanupService.class);
    private static final int MAX_AGE_HOURS = 48; // Keep news from last 48 hours

    private final JdbcTemplate jdbcTemplate;

    public CleanupService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Remove old and outdated news entries from the database.
     * This should be called BEFORE fetching new news to ensure fresh data.
     */
    @Transactional
    public void cleanupOldNews() {
        try {
            log.info("========================================");
            log.info("CLEANUP: Removing old news entries");
            log.info("========================================");

            // Remove news older than 48 hours
            String deleteOldQuery = String.format(
                "DELETE FROM news WHERE pub_date < NOW() - INTERVAL '%d hours'",
                MAX_AGE_HOURS
            );

            int deletedCount = jdbcTemplate.update(deleteOldQuery);
            
            log.info("Removed {} news articles older than {} hours", deletedCount, MAX_AGE_HOURS);

            // Also remove news without images (low quality)
            String deleteNoImageQuery = """
                DELETE FROM news
                WHERE image_url IS NULL OR image_url = ''
                """;

            int deletedNoImage = jdbcTemplate.update(deleteNoImageQuery);
            
            if (deletedNoImage > 0) {
                log.info("Removed {} news articles without images", deletedNoImage);
            }

            // Get final count
            Long finalCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM news", Long.class);
            log.info("Database cleanup completed. Remaining articles: {}", finalCount);
            log.info("========================================");

        } catch (Exception e) {
            log.error("Error during cleanup: {}", e.getMessage(), e);
            throw e;
        }
    }
}
