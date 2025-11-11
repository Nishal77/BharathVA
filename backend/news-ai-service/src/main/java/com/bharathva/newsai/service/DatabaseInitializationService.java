package com.bharathva.newsai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DatabaseInitializationService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializationService.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDatabase() {
        try {
            log.info("Checking database connection and table existence...");
            
            boolean tableExists = checkTableExists();
            
            if (!tableExists) {
                log.warn("News table does not exist. Creating table...");
                createNewsTable();
                log.info("News table created successfully");
            } else {
                log.info("News table already exists");
            }
            
            long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM news", Long.class);
            log.info("Database initialized successfully. Current news count: {}", count);
            
        } catch (Exception e) {
            log.error("Failed to initialize database: {}", e.getMessage(), e);
            log.warn("Service will continue to start, but database operations may fail. Please check database connection.");
        }
    }

    private boolean checkTableExists() {
        try {
            String query = """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'news'
                )
                """;
            Boolean exists = jdbcTemplate.queryForObject(query, Boolean.class);
            return exists != null && exists;
        } catch (Exception e) {
            log.warn("Error checking table existence: {}", e.getMessage());
            return false;
        }
    }

    private void createNewsTable() {
        try {
            String createTableSql = """
                CREATE TABLE IF NOT EXISTS news (
                    id BIGSERIAL PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    description TEXT,
                    summary TEXT,
                    link VARCHAR(2048) UNIQUE NOT NULL,
                    source VARCHAR(200),
                    image_url VARCHAR(2048),
                    video_url VARCHAR(2048),
                    pub_date TIMESTAMP NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """;
            
            jdbcTemplate.execute(createTableSql);
            
            String createIndexesSql = """
                CREATE INDEX IF NOT EXISTS idx_news_pub_date ON news(pub_date DESC);
                CREATE INDEX IF NOT EXISTS idx_news_source ON news(source);
                CREATE INDEX IF NOT EXISTS idx_news_link ON news(link);
                CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
                """;
            
            jdbcTemplate.execute(createIndexesSql);
            
        } catch (Exception e) {
            log.error("Error creating news table: {}", e.getMessage(), e);
            throw e;
        }
    }
}
