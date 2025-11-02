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
            log.info("📋 Running MongoDB migration...");
            log.info("📋 Database name: {}", databaseName);
            
            // Create database and collections
            createDatabaseAndCollections();
            
            // Create indexes
            createIndexes();
            
            // Run likes migration (always run to ensure data consistency)
            // This is critical and must run every time
            log.info("🔄 Starting likes field migration...");
            migrateLikesField();
            
            // Insert sample data if enabled
            if (includeSampleData) {
                insertSampleData();
            }
            
            // Mark migration as completed
            markMigrationCompleted();
            
            log.info("🎉 MongoDB migration completed successfully!");
            
        } catch (Exception e) {
            log.error("❌ MongoDB migration failed", e);
            e.printStackTrace();
            throw new RuntimeException("Migration failed", e);
        }
    }
    
    @SuppressWarnings("unused")
    private boolean isMigrationCompleted() {
        // Migration is now idempotent - always run to ensure data consistency
        // This method kept for potential future use
        return false;
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
        
        try {
            // Create indexes with error handling for existing indexes
            createIndexIfNotExists(database.getCollection("feeds"), 
                    org.bson.Document.parse("{'userId': 1}"), 
                    "idx_user_id");
            
            createIndexIfNotExists(database.getCollection("feeds"), 
                    org.bson.Document.parse("{'createdAt': -1}"), 
                    "idx_created_at_desc");
            
            createIndexIfNotExists(database.getCollection("feeds"), 
                    org.bson.Document.parse("{'userId': 1, 'createdAt': -1}"), 
                    "idx_user_created_desc");
            
            // Create text index for search
            createIndexIfNotExists(database.getCollection("feeds"), 
                    org.bson.Document.parse("{'message': 'text'}"), 
                    "idx_text_search");
            
            // Create index for feed_metadata collection
            createIndexIfNotExists(database.getCollection("feed_metadata"), 
                    org.bson.Document.parse("{'key': 1}"), 
                    "idx_metadata_key_unique", true);
            
            log.info("✅ Indexes created successfully");
            
        } catch (Exception e) {
            log.warn("⚠️ Some indexes may already exist, continuing... {}", e.getMessage());
        }
    }
    
    private void createIndexIfNotExists(com.mongodb.client.MongoCollection<org.bson.Document> collection, 
                                      org.bson.Document indexKeys, String indexName) {
        createIndexIfNotExists(collection, indexKeys, indexName, false);
    }
    
    private void createIndexIfNotExists(com.mongodb.client.MongoCollection<org.bson.Document> collection, 
                                      org.bson.Document indexKeys, String indexName, boolean unique) {
        try {
            // Check if index already exists
            boolean indexExists = false;
            for (org.bson.Document index : collection.listIndexes()) {
                if (indexName.equals(index.getString("name"))) {
                    indexExists = true;
                    break;
                }
            }
            
            if (!indexExists) {
                IndexOptions options = new IndexOptions().name(indexName);
                if (unique) {
                    options.unique(true);
                }
                collection.createIndex(indexKeys, options);
                log.info("✅ Created index: {}", indexName);
            } else {
                log.info("⏭️ Index already exists: {}", indexName);
            }
            
        } catch (Exception e) {
            log.warn("⚠️ Could not create index {}: {}", indexName, e.getMessage());
        }
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
    
    /**
     * Migration V2: Add likes field to all existing feeds
     * Ensures all feeds have a likes array initialized as empty array
     */
    private void migrateLikesField() {
        log.info("📋 Running Likes Field Migration (V2)...");
        log.info("📋 Connecting to database: {}", databaseName);
        
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName);
            log.info("✅ Connected to database: {}", databaseName);
            
            com.mongodb.client.MongoCollection<org.bson.Document> feedsCollection = 
                database.getCollection("feeds");
            
            // Verify collection exists
            long collectionExists = database.listCollectionNames().into(new java.util.ArrayList<>())
                .stream().filter(name -> name.equals("feeds")).count();
            
            if (collectionExists == 0) {
                log.warn("⚠️  Collection 'feeds' does not exist - creating...");
                database.createCollection("feeds");
                log.info("✅ Collection 'feeds' created");
            }
            
            log.info("✅ Using collection: feeds");
            
            // Use MongoDB JSON query for more reliable filtering
            // Find all feeds that don't have the likes field or have it as null
            org.bson.Document filter = org.bson.Document.parse(
                "{\"$or\": [{\"likes\": {\"$exists\": false}}, {\"likes\": null}]}"
            );
            
            // Update operation using JSON for reliability
            org.bson.Document updateOperation = org.bson.Document.parse(
                "{\"$set\": {\"likes\": []}}"
            );
            
            // Count feeds that need migration
            long feedsToMigrate = feedsCollection.countDocuments(filter);
            log.info("📊 Found {} feeds that need likes field migration", feedsToMigrate);
            log.debug("   Filter: {}", filter.toJson());
            log.debug("   Update: {}", updateOperation.toJson());
            
            if (feedsToMigrate > 0) {
                log.info("🔄 Executing updateMany operation...");
                
                try {
                    // Update all feeds: set likes to empty array if missing or null
                    com.mongodb.client.result.UpdateResult result = feedsCollection.updateMany(
                        filter,
                        updateOperation
                    );
                    
                    long modifiedCount = result.getModifiedCount();
                    long matchedCount = result.getMatchedCount();
                    
                    log.info("✅ UpdateMany completed:");
                    log.info("   - Matched: {}", matchedCount);
                    log.info("   - Modified: {}", modifiedCount);
                    
                    if (modifiedCount == 0 && matchedCount > 0) {
                        log.error("❌ CRITICAL: Matched {} but modified 0 - check MongoDB permissions!", matchedCount);
                    }
                    
                    if (modifiedCount != feedsToMigrate) {
                        log.warn("⚠️  Expected to migrate {} but only migrated {}", feedsToMigrate, modifiedCount);
                    }
                    
                    // Immediate verification
                    long remaining = feedsCollection.countDocuments(filter);
                    if (remaining > 0) {
                        log.error("❌ {} feeds still missing likes field after update!", remaining);
                    } else {
                        log.info("✅ All feeds successfully migrated!");
                    }
                } catch (Exception updateEx) {
                    log.error("❌ UpdateMany failed", updateEx);
                    updateEx.printStackTrace();
                    throw new RuntimeException("Migration update failed", updateEx);
                }
            } else {
                log.info("✅ All feeds already have likes field - no migration needed");
            }
            
            // Also ensure feeds with non-array likes are fixed
            org.bson.Document invalidLikesFilter = org.bson.Document.parse(
                "{\"likes\": {\"$not\": {\"$type\": \"array\"}}}"
            );
            
            long invalidLikesCount = feedsCollection.countDocuments(invalidLikesFilter);
            if (invalidLikesCount > 0) {
                log.warn("⚠️  Found {} feeds with invalid likes field type - fixing...", invalidLikesCount);
                
                com.mongodb.client.result.UpdateResult fixResult = feedsCollection.updateMany(
                    invalidLikesFilter,
                    updateOperation
                );
                
                log.info("✅ Fixed {} feeds with invalid likes field type", fixResult.getModifiedCount());
            }
            
            // Verify migration: count feeds with valid likes array
            org.bson.Document validLikesFilter = org.bson.Document.parse(
                "{\"likes\": {\"$type\": \"array\"}}"
            );
            long validLikesCount = feedsCollection.countDocuments(validLikesFilter);
            long totalFeeds = feedsCollection.countDocuments();
            
            log.info("📊 Migration verification:");
            log.info("   - Total feeds: {}", totalFeeds);
            log.info("   - Feeds with valid likes array: {}", validLikesCount);
            
            if (validLikesCount == totalFeeds) {
                log.info("✅ All feeds have valid likes field - migration successful!");
            } else {
                log.warn("⚠️  {} feeds still missing valid likes field", totalFeeds - validLikesCount);
            }
            
        } catch (Exception e) {
            log.error("❌ Likes field migration failed", e);
            throw new RuntimeException("Likes migration failed", e);
        }
    }
    
    private void markMigrationCompleted() {
        try {
            MongoDatabase database = mongoClient.getDatabase(databaseName);
            
            // Check if migration info already exists
            org.bson.Document existingMigration = database.getCollection("feed_metadata")
                    .find(org.bson.Document.parse("{'key': 'migration_info'}"))
                    .first();
            
            if (existingMigration != null) {
                // Update existing migration info
                org.bson.Document updateDoc = new org.bson.Document("$set", 
                    new org.bson.Document()
                        .append("value.version", "V2")
                        .append("value.description", "Feed schema with likes field support")
                        .append("value.updatedAt", new java.util.Date())
                        .append("updatedAt", new java.util.Date())
                );
                
                database.getCollection("feed_metadata").updateOne(
                    org.bson.Document.parse("{'key': 'migration_info'}"),
                    updateDoc
                );
                log.info("✅ Migration info updated to V2");
            } else {
                // Create new migration info
                long totalFeeds = database.getCollection("feeds").countDocuments();
                
                org.bson.Document migrationDoc = new org.bson.Document()
                        .append("key", "migration_info")
                        .append("value", new org.bson.Document()
                                .append("version", "V2")
                                .append("description", "Feed schema with likes field support")
                                .append("migratedAt", new java.util.Date())
                                .append("sampleDataIncluded", includeSampleData)
                                .append("feedsCount", totalFeeds))
                        .append("updatedAt", new java.util.Date());
                
                database.getCollection("feed_metadata").insertOne(migrationDoc);
                log.info("✅ Migration marked as completed (V2)");
            }
            
        } catch (Exception e) {
            log.warn("Could not mark migration as completed: {}", e.getMessage());
        }
    }
}