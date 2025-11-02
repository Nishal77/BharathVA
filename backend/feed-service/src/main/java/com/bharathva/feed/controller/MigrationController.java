package com.bharathva.feed.controller;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for running MongoDB migrations manually
 */
@RestController
@RequestMapping("/api/migration")
public class MigrationController {
    
    private static final Logger log = LoggerFactory.getLogger(MigrationController.class);
    
    @Autowired
    private MongoClient mongoClient;
    
    @Value("${spring.data.mongodb.database:bharathva_feed}")
    private String databaseName;
    
    /**
     * Manually trigger likes field migration
     * POST /api/migration/likes
     */
    @PostMapping("/likes")
    public ResponseEntity<Map<String, Object>> migrateLikes() {
        log.info("🚀 Manual likes migration triggered via API");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName);
            var feedsCollection = database.getCollection("feeds");
            
            // Count total feeds
            long totalFeeds = feedsCollection.countDocuments();
            
            // Find feeds without likes
            var filter = org.bson.Document.parse(
                "{\"$or\": [{\"likes\": {\"$exists\": false}}, {\"likes\": null}]}"
            );
            
            long feedsToMigrate = feedsCollection.countDocuments(filter);
            
            response.put("totalFeeds", totalFeeds);
            response.put("feedsToMigrate", feedsToMigrate);
            
            if (feedsToMigrate > 0) {
                // Update operation
                var updateOperation = org.bson.Document.parse("{\"$set\": {\"likes\": []}}");
                
                log.info("🔄 Updating {} feeds...", feedsToMigrate);
                var result = feedsCollection.updateMany(filter, updateOperation);
                
                long modifiedCount = result.getModifiedCount();
                long matchedCount = result.getMatchedCount();
                
                response.put("matched", matchedCount);
                response.put("modified", modifiedCount);
                response.put("status", "success");
                response.put("message", String.format("Successfully migrated %d feeds", modifiedCount));
                
                log.info("✅ Migration completed: matched={}, modified={}", matchedCount, modifiedCount);
                
                // Verify
                long remaining = feedsCollection.countDocuments(filter);
                response.put("remaining", remaining);
                
                // Count feeds with valid likes
                var validFilter = org.bson.Document.parse("{\"likes\": {\"$type\": \"array\"}}");
                long validCount = feedsCollection.countDocuments(validFilter);
                response.put("feedsWithValidLikes", validCount);
                
                if (remaining == 0 && validCount == totalFeeds) {
                    response.put("verification", "all_feeds_migrated");
                    log.info("✅ All feeds successfully migrated!");
                } else {
                    response.put("verification", "partial_migration");
                    log.warn("⚠️  Migration incomplete: {} remaining", remaining);
                }
                
            } else {
                response.put("status", "success");
                response.put("message", "No feeds need migration - all already have likes field");
                log.info("✅ All feeds already have likes field");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Migration failed", e);
            response.put("status", "error");
            response.put("message", "Migration failed: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Get migration status
     * GET /api/migration/likes/status
     */
    @PostMapping("/likes/status")
    public ResponseEntity<Map<String, Object>> getMigrationStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName);
            var feedsCollection = database.getCollection("feeds");
            
            long totalFeeds = feedsCollection.countDocuments();
            
            var filter = org.bson.Document.parse(
                "{\"$or\": [{\"likes\": {\"$exists\": false}}, {\"likes\": null}]}"
            );
            
            long feedsWithoutLikes = feedsCollection.countDocuments(filter);
            
            var validFilter = org.bson.Document.parse("{\"likes\": {\"$type\": \"array\"}}");
            long feedsWithValidLikes = feedsCollection.countDocuments(validFilter);
            
            response.put("totalFeeds", totalFeeds);
            response.put("feedsWithoutLikes", feedsWithoutLikes);
            response.put("feedsWithValidLikes", feedsWithValidLikes);
            response.put("migrationNeeded", feedsWithoutLikes > 0);
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to get migration status", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

