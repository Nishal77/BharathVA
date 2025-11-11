package com.bharathva.newsai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CleanupService {

    private static final Logger log = LoggerFactory.getLogger(CleanupService.class);

    private final JdbcTemplate jdbcTemplate;

    public CleanupService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void cleanupOldNews() {
        try {
            String query = """
                DELETE FROM news
                WHERE id NOT IN (
                    SELECT id FROM news
                    ORDER BY pub_date DESC
                    LIMIT 10
                )
                """;

            int deletedCount = jdbcTemplate.update(query);
            log.info("Cleaned up {} old news articles. Kept top 10. Time: {}", deletedCount, LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error during cleanup: {}", e.getMessage(), e);
            throw e;
        }
    }
}
