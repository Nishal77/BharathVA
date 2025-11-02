/**
 * MongoDB Migration Script for Likes Field
 * 
 * This script ensures all feeds in the bharathva_feed database have a valid 'likes' array field.
 * 
 * Usage:
 * 1. Connect to MongoDB using MongoDB Compass, Mongo Shell, or MongoDB MCP
 * 2. Select database: bharathva_feed
 * 3. Run this script or execute the commands manually
 * 
 * Migration Steps:
 * 1. Add 'likes' array to feeds missing the field
 * 2. Fix feeds where 'likes' is null
 * 3. Fix feeds where 'likes' is not an array type
 * 4. Verify all feeds have valid 'likes' array
 */

// Database and collection
const databaseName = 'bharathva_feed';
const collectionName = 'feeds';

// Use the database
use(databaseName);

print('🚀 Starting Likes Field Migration...');
print(`📋 Database: ${databaseName}`);
print(`📋 Collection: ${collectionName}\n`);

// Step 1: Count total feeds
const totalFeeds = db[collectionName].countDocuments({});
print(`📊 Total feeds in collection: ${totalFeeds}\n`);

// Step 2: Find feeds without likes field or with null likes
const feedsWithoutLikes = db[collectionName].countDocuments({
    $or: [
        { likes: { $exists: false } },
        { likes: null }
    ]
});
print(`📊 Feeds missing likes field: ${feedsWithoutLikes}`);

// Step 3: Find feeds with invalid likes type (not array)
const feedsWithInvalidType = db[collectionName].countDocuments({
    likes: { $not: { $type: 'array' } }
});
print(`📊 Feeds with invalid likes type: ${feedsWithInvalidType}\n`);

// Step 4: Migration - Add likes array to missing/null feeds
if (feedsWithoutLikes > 0) {
    print(`🔄 Migrating ${feedsWithoutLikes} feeds...`);
    const result1 = db[collectionName].updateMany(
        {
            $or: [
                { likes: { $exists: false } },
                { likes: null }
            ]
        },
        {
            $set: { likes: [] }
        }
    );
    print(`✅ Added likes field to ${result1.modifiedCount} feeds`);
    print(`   - Matched: ${result1.matchedCount}`);
    print(`   - Modified: ${result1.modifiedCount}\n`);
}

// Step 5: Migration - Fix invalid types
if (feedsWithInvalidType > 0) {
    print(`🔄 Fixing ${feedsWithInvalidType} feeds with invalid likes type...`);
    const result2 = db[collectionName].updateMany(
        {
            likes: { $not: { $type: 'array' } }
        },
        {
            $set: { likes: [] }
        }
    );
    print(`✅ Fixed ${result2.modifiedCount} feeds`);
    print(`   - Matched: ${result2.matchedCount}`);
    print(`   - Modified: ${result2.modifiedCount}\n`);
}

// Step 6: Verification
print('📊 Verification:');
const feedsWithValidLikes = db[collectionName].countDocuments({
    likes: { $type: 'array' }
});
print(`   - Feeds with valid likes array: ${feedsWithValidLikes}`);
print(`   - Total feeds: ${totalFeeds}`);

if (feedsWithValidLikes === totalFeeds) {
    print('\n✅ Migration successful! All feeds have valid likes field.');
} else {
    const remaining = totalFeeds - feedsWithValidLikes;
    print(`\n⚠️  ${remaining} feeds still need migration.`);
}

// Step 7: Sample verification - show a few feeds
print('\n📋 Sample feeds (showing _id and likes):');
db[collectionName].find({}, { _id: 1, likes: 1 }).limit(5).forEach(doc => {
    print(`   - ${doc._id}: likes = ${JSON.stringify(doc.likes)}`);
});

print('\n🎉 Migration script completed!');

