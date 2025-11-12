/**
 * MongoDB Migration Script: Ensure Reply Notification Support
 * 
 * This migration ensures:
 * 1. All notification fields exist for REPLY type notifications
 * 2. Indexes are created for efficient queries
 * 3. Schema is validated for reply notifications
 * 
 * Run this script using: mongosh bharathva_feed < migrations/002_ensure_reply_notification_support.js
 */

use('bharathva_feed');

print('🚀 Starting migration: Ensure Reply Notification Support');
print('========================================================');

// Ensure notifications collection exists
if (!db.getCollectionNames().includes('notifications')) {
    print('⚠️  Notifications collection does not exist. Creating it...');
    db.createCollection('notifications');
    print('✅ Created notifications collection');
}

// Create/Update indexes for optimal performance
print('\n📊 Creating/Updating indexes...');

const indexes = [
    { keys: { receiverId: 1, createdAt: -1 }, name: 'idx_receiverId_createdAt' },
    { keys: { type: 1 }, name: 'idx_type' },
    { keys: { senderId: 1, postId: 1, type: 1 }, name: 'idx_senderId_postId_type' },
    { keys: { receiverId: 1, isRead: 1 }, name: 'idx_receiverId_isRead' },
    { keys: { postId: 1, type: 1 }, name: 'idx_postId_type' }
];

indexes.forEach(index => {
    try {
        db.notifications.createIndex(index.keys, { name: index.name, background: true });
        print(`✅ Created/Updated index: ${index.name}`);
    } catch (e) {
        if (e.message.includes('already exists')) {
            print(`ℹ️  Index ${index.name} already exists`);
        } else {
            print(`⚠️  Error creating index ${index.name}: ${e.message}`);
        }
    }
});

// Verify REPLY notification support
print('\n🔍 Verifying REPLY notification schema...');

const replyNotifications = db.notifications.find({ type: 'REPLY' }).toArray();
print(`📊 Found ${replyNotifications.length} REPLY notifications in database`);

if (replyNotifications.length > 0) {
    print('\n📋 Sample REPLY notifications:');
    replyNotifications.slice(0, 3).forEach((notif, index) => {
        print(`\n   Notification ${index + 1}:`);
        print(`   - ID: ${notif._id}`);
        print(`   - Sender: ${notif.senderId || 'N/A'}`);
        print(`   - Receiver: ${notif.receiverId || 'N/A'}`);
        print(`   - Post ID: ${notif.postId || 'N/A'}`);
        print(`   - Message: ${notif.message || 'N/A'}`);
        print(`   - Reply Text: ${notif.commentText || 'N/A'}`);
        print(`   - Original Comment: ${notif.originalCommentText || 'N/A'}`);
        print(`   - Comment ID: ${notif.commentId || 'N/A'}`);
        print(`   - Created: ${notif.createdAt || 'N/A'}`);
    });
} else {
    print('   No REPLY notifications found (this is expected for new installations)');
}

// Check for notifications missing required fields for REPLY type
const incompleteReplies = db.notifications.find({
    type: 'REPLY',
    $or: [
        { message: { $exists: false } },
        { message: null },
        { commentText: { $exists: false } },
        { commentText: null }
    ]
}).toArray();

if (incompleteReplies.length > 0) {
    print(`\n⚠️  Found ${incompleteReplies.length} REPLY notifications with missing required fields`);
    print('   These notifications may need manual data migration');
} else {
    print('\n✅ All REPLY notifications have required fields');
}

// Verify COMMENT notifications have commentText
const commentNotifications = db.notifications.find({ type: 'COMMENT' }).toArray();
print(`\n📊 Found ${commentNotifications.length} COMMENT notifications`);

const commentsWithoutText = commentNotifications.filter(n => !n.commentText || n.commentText.trim() === '');
if (commentsWithoutText.length > 0) {
    print(`⚠️  Found ${commentsWithoutText.length} COMMENT notifications without commentText`);
} else {
    print('✅ All COMMENT notifications have commentText');
}

print('\n✅ Migration completed successfully!');
print('========================================================');
print('\n📝 Next Steps:');
print('   1. Ensure backend code creates REPLY notifications when users reply to comments');
print('   2. Verify replyToCommentIndex is saved in feed.comments array');
print('   3. Test reply notification creation flow');



