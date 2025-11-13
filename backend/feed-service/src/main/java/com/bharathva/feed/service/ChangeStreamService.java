package com.bharathva.feed.service;

import com.mongodb.client.ChangeStreamIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.changestream.ChangeStreamDocument;
import com.mongodb.client.model.changestream.OperationType;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import jakarta.annotation.PreDestroy;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Service for monitoring MongoDB Change Streams to detect real-time database changes
 */
@Service
public class ChangeStreamService implements CommandLineRunner {
    
    private static final Logger log = LoggerFactory.getLogger(ChangeStreamService.class);
    
    @Autowired
    private MongoClient mongoClient;
    
    @Autowired
    private WebSocketService webSocketService;
    
    @Autowired
    private PostCountSyncService postCountSyncService;
    
    @Value("${spring.data.mongodb.database:bharathva_feed}")
    private String databaseName;
    
    private ExecutorService executorService;
    private volatile boolean running = false;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 Starting MongoDB Change Streams monitoring...");
        startChangeStreamMonitoring();
    }
    
    /**
     * Start monitoring MongoDB Change Streams for the feeds collection
     */
    public void startChangeStreamMonitoring() {
        if (running) {
            log.warn("⚠️ Change stream monitoring is already running");
            return;
        }
        
        executorService = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "change-stream-monitor");
            t.setDaemon(true);
            return t;
        });
        
        executorService.submit(() -> {
            try {
                running = true;
                log.info("📡 Starting change stream monitoring for database: {}", databaseName);
                
                MongoDatabase database = mongoClient.getDatabase(databaseName);
                MongoCollection<Document> feedsCollection = database.getCollection("feeds");
                
                // Create change stream to monitor all operations
                ChangeStreamIterable<Document> changeStream = feedsCollection.watch();
                
                log.info("✅ Change stream monitoring started successfully");
                
                // Process change stream events
                for (ChangeStreamDocument<Document> change : changeStream) {
                    processChangeEvent(change);
                }
                
            } catch (Exception e) {
                log.error("❌ Error in change stream monitoring: {}", e.getMessage(), e);
                running = false;
            }
        });
    }
    
    /**
     * Process individual change stream events
     */
    private void processChangeEvent(ChangeStreamDocument<Document> change) {
        try {
            OperationType operationType = change.getOperationType();
            Document documentKey = Document.parse(change.getDocumentKey().toJson());
            
            // Handle ObjectId conversion properly
            String feedId;
            Object idObject = documentKey.get("_id");
            if (idObject instanceof org.bson.types.ObjectId) {
                feedId = ((org.bson.types.ObjectId) idObject).toString();
            } else {
                feedId = idObject.toString();
            }
            
            log.info("🔄 Processing change event: {} for feed: {}", operationType, feedId);
            
            switch (operationType) {
                case INSERT:
                    handleInsertEvent(change);
                    break;
                case DELETE:
                    handleDeleteEvent(change);
                    break;
                case UPDATE:
                case REPLACE:
                    handleUpdateEvent(change);
                    break;
                default:
                    log.debug("📝 Unhandled operation type: {}", operationType);
            }
            
        } catch (Exception e) {
            log.error("❌ Error processing change event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Handle INSERT events
     */
    private void handleInsertEvent(ChangeStreamDocument<Document> change) {
        try {
            Document fullDocument = change.getFullDocument();
            if (fullDocument != null) {
                // Handle ObjectId conversion properly
                String feedId;
                Object idObject = fullDocument.get("_id");
                if (idObject instanceof org.bson.types.ObjectId) {
                    feedId = ((org.bson.types.ObjectId) idObject).toString();
                } else {
                    feedId = idObject.toString();
                }
                
                String userId = fullDocument.getString("userId");
                String message = fullDocument.getString("message");
                
                log.info("➕ Feed created: {} by user: {}", feedId, userId);
                
                // Notify WebSocket clients
                webSocketService.notifyFeedCreated(userId, feedId, message);
                
                // CRITICAL: Sync post count to NeonDB in real-time
                if (userId != null && !userId.trim().isEmpty()) {
                    log.info("🔄 [ChangeStream] Syncing post count for user: {} after INSERT", userId);
                    try {
                        postCountSyncService.syncUserPostCount(userId);
                        log.info("✅ [ChangeStream] Post count synced successfully for user: {}", userId);
                    } catch (Exception syncError) {
                        log.error("❌ [ChangeStream] Failed to sync post count for user: {} - {}", 
                            userId, syncError.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("❌ Error handling insert event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Handle DELETE events
     */
    private void handleDeleteEvent(ChangeStreamDocument<Document> change) {
        try {
            Document documentKey = Document.parse(change.getDocumentKey().toJson());
            
            // Handle ObjectId conversion properly
            String feedId;
            Object idObject = documentKey.get("_id");
            if (idObject instanceof org.bson.types.ObjectId) {
                feedId = ((org.bson.types.ObjectId) idObject).toString();
            } else {
                feedId = idObject.toString();
            }
            
            // For delete operations, we need to get the userId from the before state
            Document beforeDocument = change.getFullDocumentBeforeChange();
            String userId = null;
            
            if (beforeDocument != null) {
                userId = beforeDocument.getString("userId");
            }
            
            log.info("🗑️ Feed deleted: {} by user: {}", feedId, userId);
            
            if (userId != null) {
                webSocketService.notifyFeedDeleted(userId, feedId);
                
                // CRITICAL: Sync post count to NeonDB in real-time
                log.info("🔄 [ChangeStream] Syncing post count for user: {} after DELETE", userId);
                try {
                    postCountSyncService.syncUserPostCount(userId);
                    log.info("✅ [ChangeStream] Post count synced successfully for user: {}", userId);
                } catch (Exception syncError) {
                    log.error("❌ [ChangeStream] Failed to sync post count for user: {} - {}", 
                        userId, syncError.getMessage());
                }
            } else {
                // If we can't determine the user, send to all clients
                webSocketService.notifyFeedDeleted("unknown", feedId);
                log.warn("⚠️ [ChangeStream] Could not determine userId for deleted feed: {}", feedId);
            }
            
        } catch (Exception e) {
            log.error("❌ Error handling delete event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Handle UPDATE/REPLACE events
     */
    private void handleUpdateEvent(ChangeStreamDocument<Document> change) {
        try {
            Document fullDocument = change.getFullDocument();
            if (fullDocument != null) {
                // Handle ObjectId conversion properly
                String feedId;
                Object idObject = fullDocument.get("_id");
                if (idObject instanceof org.bson.types.ObjectId) {
                    feedId = ((org.bson.types.ObjectId) idObject).toString();
                } else {
                    feedId = idObject.toString();
                }
                
                String userId = fullDocument.getString("userId");
                String message = fullDocument.getString("message");
                
                log.info("✏️ Feed updated: {} by user: {}", feedId, userId);
                webSocketService.notifyFeedUpdated(userId, feedId, message);
            }
        } catch (Exception e) {
            log.error("❌ Error handling update event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Stop change stream monitoring
     */
    public void stopChangeStreamMonitoring() {
        log.info("🛑 Stopping change stream monitoring...");
        running = false;
        
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
        
        log.info("✅ Change stream monitoring stopped");
    }
    
    @PreDestroy
    public void cleanup() {
        stopChangeStreamMonitoring();
    }
}
