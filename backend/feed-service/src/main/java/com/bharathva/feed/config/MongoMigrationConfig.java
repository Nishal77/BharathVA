package com.bharathva.feed.config;

import com.bharathva.feed.model.Feed;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Simple MongoDB migration for BharathVA Feed Service
 * Creates database, collections, and indexes for simple message storage
 */
@Component
public class MongoMigrationConfig implements CommandLineRunner {
    
    private static final Logger log = LoggerFactory.getLogger(MongoMigrationConfig.class);
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private MongoClient mongoClient;
    
    @Value("${spring.data.mongodb.database}")
    private String databaseName;
    
    @Value("${feed.migration.enabled:true}")
    private boolean migrationEnabled;
    
    @Value("${feed.migration.sample-data:false}")
    private boolean includeSampleData;
    
    @Override
    public void run(String... args) throws Exception {
        if (migrationEnabled) {
            log.info("🚀 Starting MongoDB migration for BharathVA Feed Service...");
            runMigration();
        } else {
            log.info("⏭️  MongoDB migration is disabled");
        }
    }
    
    private void runMigration() {
        try {
            // Check if migration has already been run
            if (isMigrationCompleted()) {
                log.info("✅ Migration already completed, skipping...");
                return;
            }
            
            log.info("📋 Running MongoDB migration...");
            
            // Create database and collections
            createDatabaseAndCollections();
            
            // Create indexes
            createIndexes();
            
            // Insert sample data if enabled
            if (includeSampleData) {
                insertSampleData();
            }
            
            // Mark migration as completed
            markMigrationCompleted();
            
            log.info("🎉 MongoDB migration completed successfully!");
            
        } catch (Exception e) {
            log.error("❌ MongoDB migration failed", e);
            throw new RuntimeException("Migration failed", e);
        }
    }
    
    private boolean isMigrationCompleted() {
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName);
            return database.getCollection("feed_metadata")
                    .find(org.bson.Document.parse("{'key': 'migration_info'}"))
                    .first() != null;
        } catch (Exception e) {
            log.warn("Could not check migration status: {}", e.getMessage());
            return false;
        }
    }
    
    private void createDatabaseAndCollections() {
        log.info("📋 Creating database and collections...");
        
        // Create database by using it
        MongoDatabase database = mongoClient.getDatabase(databaseName);
        
        // Create collections by inserting a document and then removing it
        // This ensures the collections exist with proper structure
        
        // Create feeds collection
        Feed tempFeed = new Feed();
        tempFeed.setId("temp_migration_feed");
        tempFeed.setUserId("migration_user");
        tempFeed.setMessage("Temporary migration feed");
        mongoTemplate.insert(tempFeed);
        mongoTemplate.remove(tempFeed);
        
        // Create feed_metadata collection
        org.bson.Document tempMetadata = new org.bson.Document()
                .append("key", "temp_migration_metadata")
                .append("value", "temp")
                .append("updatedAt", new java.util.Date());
        database.getCollection("feed_metadata").insertOne(tempMetadata);
        database.getCollection("feed_metadata").deleteOne(org.bson.Document.parse("{'key': 'temp_migration_metadata'}"));
        
        log.info("✅ Database and collections created successfully");
    }
    
    private void createIndexes() {
        log.info("📋 Creating indexes...");
        
        // Create indexes for feeds collection using MongoDB native approach
        MongoDatabase database = mongoClient.getDatabase(databaseName);
        
        // Create indexes directly using MongoDB driver
        database.getCollection("feeds").createIndex(
                org.bson.Document.parse("{'userId': 1}"),
                new IndexOptions().name("idx_user_id")
        );
        
        database.getCollection("feeds").createIndex(
                org.bson.Document.parse("{'createdAt': -1}"),
                new IndexOptions().name("idx_created_at_desc")
        );
        
        database.getCollection("feeds").createIndex(
                org.bson.Document.parse("{'userId': 1, 'createdAt': -1}"),
                new IndexOptions().name("idx_user_created_desc")
        );
        
        // Create text index for search
        database.getCollection("feeds").createIndex(
                org.bson.Document.parse("{'message': 'text'}"),
                new IndexOptions().name("idx_text_search")
        );
        
        // Create index for feed_metadata collection
        database.getCollection("feed_metadata").createIndex(
                org.bson.Document.parse("{'key': 1}"),
                new IndexOptions().unique(true).name("idx_metadata_key_unique")
        );
        
        log.info("✅ Indexes created successfully");
    }
    
    private void insertSampleData() {
        log.info("📋 Inserting sample data...");
        
        // Sample Feed 1: Welcome to BharathVA
        Feed feed1 = new Feed();
        feed1.setId("feed_001");
        feed1.setUserId("user_001");
        feed1.setMessage("Welcome to BharathVA! The Voice of India is here to connect us all. 🇮🇳");
        feed1.setCreatedAt(LocalDateTime.now().minusDays(6));
        feed1.setUpdatedAt(LocalDateTime.now().minusDays(6));
        mongoTemplate.insert(feed1);
        
        // Sample Feed 2: Technology
        Feed feed2 = new Feed();
        feed2.setId("feed_002");
        feed2.setUserId("user_002");
        feed2.setMessage("Technology is transforming India at an unprecedented pace. From digital payments to space exploration, we are truly becoming a tech superpower! 🚀");
        feed2.setCreatedAt(LocalDateTime.now().minusDays(5));
        feed2.setUpdatedAt(LocalDateTime.now().minusDays(5));
        mongoTemplate.insert(feed2);
        
        // Sample Feed 3: Development Journey
        Feed feed3 = new Feed();
        feed3.setId("feed_003");
        feed3.setUserId("user_001");
        feed3.setMessage("Building BharathVA has been an incredible journey. Every line of code is written with the vision of connecting India and empowering voices across our diverse nation. 💻🇮🇳");
        feed3.setCreatedAt(LocalDateTime.now().minusDays(4));
        feed3.setUpdatedAt(LocalDateTime.now().minusDays(4));
        mongoTemplate.insert(feed3);
        
        log.info("✅ Sample data inserted successfully - 3 feeds created");
    }
    
    private void markMigrationCompleted() {
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName);
            org.bson.Document migrationDoc = new org.bson.Document()
                    .append("key", "migration_info")
                    .append("value", new org.bson.Document()
                            .append("version", "V1")
                            .append("description", "Simple feed schema for messages only")
                            .append("migratedAt", new java.util.Date())
                            .append("sampleDataIncluded", includeSampleData)
                            .append("feedsCount", 3))
                    .append("updatedAt", new java.util.Date());
            
            database.getCollection("feed_metadata").insertOne(migrationDoc);
            log.info("✅ Migration marked as completed");
            
        } catch (Exception e) {
            log.warn("Could not mark migration as completed: {}", e.getMessage());
        }
    }
}