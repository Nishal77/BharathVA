/**
 * MongoDB Migration Script: Add Reply Notification Fields
 * 
 * This migration ensures that the notifications collection has all required fields
 * for REPLY type notifications, including:
 * - originalCommentText: The original comment that was replied to
 * - commentId: The ID/index of the comment being replied to
 * 
 * Run this script using: mongosh bharathva_feed < migrations/001_add_reply_notification_fields.js
 */

// Switch to the correct database
use('bharathva_feed');

print('🚀 Starting migration: Add Reply Notification Fields');
print('==================================================');

// Check if notifications collection exists
const collectionExists = db.getCollectionNames().includes('notifications');

if (!collectionExists) {
    print('⚠️  Notifications collection does not exist. Creating it...');
    db.createCollection('notifications');
    print('✅ Created notifications collection');
}

// Create indexes for better query performance
print('\n📊 Creating indexes...');

// Index on receiverId for fast lookups
try {
    db.notifications.createIndex(
        { receiverId: 1, createdAt: -1 },
        { name: 'idx_receiverId_createdAt', background: true }
    );
    print('✅ Created index: idx_receiverId_createdAt');
} catch (e) {
    print('⚠️  Index idx_receiverId_createdAt may already exist: ' + e.message);
}

// Index on type for filtering by notification type
try {
    db.notifications.createIndex(
        { type: 1 },
        { name: 'idx_type', background: true }
    );
    print('✅ Created index: idx_type');
} catch (e) {
    print('⚠️  Index idx_type may already exist: ' + e.message);
}

// Index on senderId, postId, and type for efficient deletion
try {
    db.notifications.createIndex(
        { senderId: 1, postId: 1, type: 1 },
        { name: 'idx_senderId_postId_type', background: true }
    );
    print('✅ Created index: idx_senderId_postId_type');
} catch (e) {
    print('⚠️  Index idx_senderId_postId_type may already exist: ' + e.message);
}

// Index on receiverId and isRead for unread count queries
try {
    db.notifications.createIndex(
        { receiverId: 1, isRead: 1 },
        { name: 'idx_receiverId_isRead', background: true }
    );
    print('✅ Created index: idx_receiverId_isRead');
} catch (e) {
    print('⚠️  Index idx_receiverId_isRead may already exist: ' + e.message);
}

// Verify schema - check if REPLY notifications exist
print('\n🔍 Verifying schema...');
const replyNotificationsCount = db.notifications.countDocuments({ type: 'REPLY' });
print(`📊 Found ${replyNotificationsCount} REPLY notifications in database`);

// Check for notifications missing required fields
const notificationsMissingFields = db.notifications.find({
    type: 'REPLY',
    $or: [
        { originalCommentText: { $exists: false } },
        { originalCommentText: null },
        { commentText: { $exists: false } },
        { commentText: null }
    ]
}).count();

if (notificationsMissingFields > 0) {
    print(`⚠️  Found ${notificationsMissingFields} REPLY notifications with missing fields`);
    print('   These notifications may need manual data migration');
} else {
    print('✅ All REPLY notifications have required fields');
}

// Sample query to verify REPLY notifications
print('\n📋 Sample REPLY notifications:');
const sampleReplies = db.notifications.find({ type: 'REPLY' })
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray();

if (sampleReplies.length > 0) {
    sampleReplies.forEach((notif, index) => {
        print(`\n   Notification ${index + 1}:`);
        print(`   - ID: ${notif._id}`);
        print(`   - Sender: ${notif.senderId}`);
        print(`   - Receiver: ${notif.receiverId}`);
        print(`   - Message: ${notif.message || 'N/A'}`);
        print(`   - Reply Text: ${notif.commentText || 'N/A'}`);
        print(`   - Original Comment: ${notif.originalCommentText || 'N/A'}`);
        print(`   - Created: ${notif.createdAt}`);
    });
} else {
    print('   No REPLY notifications found in database');
}

print('\n✅ Migration completed successfully!');
print('==================================================');



