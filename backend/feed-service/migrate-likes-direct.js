// Direct MongoDB Migration Script for Likes Field
// Run this using MongoDB shell or MongoDB Compass

// Connect to database
use('bharathva_feed');

// Count feeds without likes field
print("📊 Checking feeds without likes field...");
const feedsWithoutLikes = db.feeds.countDocuments({
  $or: [
    { likes: { $exists: false } },
    { likes: null }
  ]
});
print(`Found ${feedsWithoutLikes} feeds that need migration`);

// Count total feeds
const totalFeeds = db.feeds.countDocuments({});
print(`Total feeds: ${totalFeeds}`);

// Update all feeds without likes field
if (feedsWithoutLikes > 0) {
  print("\n🔄 Running migration...");
  const result = db.feeds.updateMany(
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
  
  print(`✅ Updated ${result.modifiedCount} feeds`);
  print(`   Matched: ${result.matchedCount}`);
}

// Fix feeds with invalid likes type (non-array)
const invalidLikesCount = db.feeds.countDocuments({
  likes: { $not: { $type: "array" } }
});

if (invalidLikesCount > 0) {
  print(`\n⚠️  Found ${invalidLikesCount} feeds with invalid likes type, fixing...`);
  const fixResult = db.feeds.updateMany(
    {
      likes: { $not: { $type: "array" } }
    },
    {
      $set: { likes: [] }
    }
  );
  print(`✅ Fixed ${fixResult.modifiedCount} feeds`);
}

// Verify migration
const feedsWithValidLikes = db.feeds.countDocuments({
  likes: { $type: "array" }
});

print("\n📊 Verification:");
print(`   Total feeds: ${totalFeeds}`);
print(`   Feeds with valid likes array: ${feedsWithValidLikes}`);

if (feedsWithValidLikes === totalFeeds) {
  print("✅ Migration successful! All feeds have likes field.");
} else {
  print(`⚠️  ${totalFeeds - feedsWithValidLikes} feeds still need migration`);
}

// Show sample feed
print("\n📄 Sample feed after migration:");
const sampleFeed = db.feeds.findOne({}, { likes: 1, userId: 1, message: 1 });
printjson(sampleFeed);

