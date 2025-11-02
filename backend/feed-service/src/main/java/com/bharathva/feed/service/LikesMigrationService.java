package com.bharathva.feed.service;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

/**
 * Standalone service to migrate likes field in MongoDB
 * Can be run manually or automatically
 */
@Service
public class LikesMigrationService implements CommandLineRunner {
    
    private static final Logger log = LoggerFactory.getLogger(LikesMigrationService.class);
    
    @Autowired(required = false)
    private MongoClient mongoClient;
    
    @Value("${spring.data.mongodb.database:bharathva_feed}")
    private String databaseName;
    
    @Override
    public void run(String... args) {
        if (mongoClient != null) {
            log.info("🚀 Running Likes Migration Service...");
            migrateLikesFieldDirectly();
        } else {
            log.warn("⚠️  MongoClient not available, skipping likes migration");
        }
    }
    
    /**
     * Direct migration of likes field using MongoDB native driver
     * This bypasses Spring Data MongoDB to ensure direct updates
     */
    public void migrateLikesFieldDirectly() {
        log.info("📋 Running Direct Likes Field Migration...");
        log.info("📋 Database: {}", databaseName);
        
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName);
            log.info("✅ Connected to database: {}", databaseName);
            
            var feedsCollection = database.getCollection("feeds");
            
            // Count total feeds
            long totalFeeds = feedsCollection.countDocuments();
            log.info("📊 Total feeds in collection: {}", totalFeeds);
            
            // Find feeds without likes field
            var filterWithoutLikes = org.bson.Document.parse(
                "{\"$or\": [{\"likes\": {\"$exists\": false}}, {\"likes\": null}]}"
            );
            
            long feedsToMigrate = feedsCollection.countDocuments(filterWithoutLikes);
            log.info("📊 Feeds that need migration: {}", feedsToMigrate);
            
            if (feedsToMigrate > 0) {
                // Update operation
                var updateOperation = org.bson.Document.parse(
                    "{\"$set\": {\"likes\": []}}"
                );
                
                log.info("🔄 Executing updateMany operation...");
                var result = feedsCollection.updateMany(filterWithoutLikes, updateOperation);
                
                log.info("✅ Migration Results:");
                log.info("   - Matched: {}", result.getMatchedCount());
                log.info("   - Modified: {}", result.getModifiedCount());
                
                // Verify
                long remaining = feedsCollection.countDocuments(filterWithoutLikes);
                if (remaining == 0) {
                    log.info("✅ All feeds successfully migrated!");
                } else {
                    log.warn("⚠️  {} feeds still need migration", remaining);
                }
            }
            
            // Fix invalid types
            var invalidFilter = org.bson.Document.parse(
                "{\"likes\": {\"$not\": {\"$type\": \"array\"}}}"
            );
            
            var updateOperation = org.bson.Document.parse("{\"$set\": {\"likes\": []}}");
            
            long invalidCount = feedsCollection.countDocuments(invalidFilter);
            if (invalidCount > 0) {
                log.warn("⚠️  Fixing {} feeds with invalid likes type...", invalidCount);
                var fixResult = feedsCollection.updateMany(
                    invalidFilter, 
                    updateOperation
                );
                log.info("✅ Fixed {} feeds", fixResult.getModifiedCount());
            }
            
            // Final verification
            var validFilter = org.bson.Document.parse("{\"likes\": {\"$type\": \"array\"}}");
            long validCount = feedsCollection.countDocuments(validFilter);
            
            log.info("📊 Final Status:");
            log.info("   - Total feeds: {}", totalFeeds);
            log.info("   - Feeds with valid likes array: {}", validCount);
            
            if (validCount == totalFeeds) {
                log.info("🎉 All feeds have valid likes field!");
            } else {
                log.warn("⚠️  {} feeds missing valid likes field", totalFeeds - validCount);
            }
            
        } catch (Exception e) {
            log.error("❌ Direct migration failed", e);
            log.error("Error details: {}", e.getMessage(), e);
            throw new RuntimeException("Likes migration failed: " + e.getMessage(), e);
        }
    }
}

