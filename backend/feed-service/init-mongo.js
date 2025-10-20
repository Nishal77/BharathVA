// MongoDB initialization script for BharathVA Feed Service
db = db.getSiblingDB('bharathva_feed');

// Create collections
db.createCollection('feeds');
db.createCollection('feed_interactions');
db.createCollection('feed_analytics');

// Create indexes for feeds collection
db.feeds.createIndex({ "userId": 1 });
db.feeds.createIndex({ "username": 1 });
db.feeds.createIndex({ "createdAt": -1 });
db.feeds.createIndex({ "threadId": 1 });
db.feeds.createIndex({ "parentFeedId": 1 });
db.feeds.createIndex({ "isDeleted": 1 });
db.feeds.createIndex({ "feedType": 1 });
db.feeds.createIndex({ "content": "text" });
db.feeds.createIndex({ "userId": 1, "createdAt": -1 });
db.feeds.createIndex({ "isDeleted": 1, "createdAt": -1 });

// Create compound indexes for better query performance
db.feeds.createIndex({ "userId": 1, "isDeleted": 1, "createdAt": -1 });
db.feeds.createIndex({ "isDeleted": 1, "feedType": 1, "createdAt": -1 });
db.feeds.createIndex({ "parentFeedId": 1, "isDeleted": 1, "createdAt": 1 });

// Create TTL index for automatic cleanup of deleted feeds (30 days)
db.feeds.createIndex({ "updatedAt": 1 }, { expireAfterSeconds: 2592000, partialFilterExpression: { "isDeleted": true } });

print('MongoDB initialization completed for BharathVA Feed Service');
print('Collections created: feeds, feed_interactions, feed_analytics');
print('Indexes created for optimal query performance');
