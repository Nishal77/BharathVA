// MongoDB Migration Script for Notifications Collection
// Run this script to create the notifications collection and indexes
// Usage: mongosh "your-connection-string" < migrate-notifications-collection.js

db = db.getSiblingDB('bharathva_feed');

print("📋 Starting Notifications Collection Migration...");
print("📋 Database: bharathva_feed");

// Step 1: Create collection by inserting a temporary document
print("\n🔄 Step 1: Creating notifications collection...");
try {
  db.notifications.insertOne({
    _id: "temp_migration_notification",
    senderId: "temp_sender",
    receiverId: "temp_receiver",
    postId: "temp_post",
    type: "LIKE",
    message: "Temp notification for migration",
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  print("✅ Temporary document inserted");
  
  // Delete the temporary document
  db.notifications.deleteOne({ _id: "temp_migration_notification" });
  print("✅ Temporary document removed");
  print("✅ Notifications collection created");
} catch (e) {
  if (e.code === 48) {
    print("ℹ️  Collection already exists, continuing...");
  } else {
    print("❌ Error creating collection: " + e.message);
    throw e;
  }
}

// Step 2: Create indexes
print("\n🔄 Step 2: Creating indexes...");

// Index 1: senderId
try {
  db.notifications.createIndex({ "senderId": 1 }, { name: "idx_sender_id" });
  print("✅ Created index: idx_sender_id");
} catch (e) {
  if (e.code === 85) {
    print("⏭️  Index idx_sender_id already exists");
  } else {
    print("⚠️  Could not create idx_sender_id: " + e.message);
  }
}

// Index 2: receiverId
try {
  db.notifications.createIndex({ "receiverId": 1 }, { name: "idx_receiver_id" });
  print("✅ Created index: idx_receiver_id");
} catch (e) {
  if (e.code === 85) {
    print("⏭️  Index idx_receiver_id already exists");
  } else {
    print("⚠️  Could not create idx_receiver_id: " + e.message);
  }
}

// Index 3: postId
try {
  db.notifications.createIndex({ "postId": 1 }, { name: "idx_post_id" });
  print("✅ Created index: idx_post_id");
} catch (e) {
  if (e.code === 85) {
    print("⏭️  Index idx_post_id already exists");
  } else {
    print("⚠️  Could not create idx_post_id: " + e.message);
  }
}

// Index 4: type
try {
  db.notifications.createIndex({ "type": 1 }, { name: "idx_type" });
  print("✅ Created index: idx_type");
} catch (e) {
  if (e.code === 85) {
    print("⏭️  Index idx_type already exists");
  } else {
    print("⚠️  Could not create idx_type: " + e.message);
  }
}

// Index 5: createdAt (descending)
try {
  db.notifications.createIndex({ "createdAt": -1 }, { name: "idx_created_at_desc" });
  print("✅ Created index: idx_created_at_desc");
} catch (e) {
  if (e.code === 85) {
    print("⏭️  Index idx_created_at_desc already exists");
  } else {
    print("⚠️  Could not create idx_created_at_desc: " + e.message);
  }
}

// Index 6: Compound index (receiverId, isRead, createdAt)
try {
  db.notifications.createIndex(
    { "receiverId": 1, "isRead": 1, "createdAt": -1 }, 
    { name: "idx_receiver_read_created" }
  );
  print("✅ Created index: idx_receiver_read_created");
} catch (e) {
  if (e.code === 85) {
    print("⏭️  Index idx_receiver_read_created already exists");
  } else {
    print("⚠️  Could not create idx_receiver_read_created: " + e.message);
  }
}

// Step 3: Verify migration
print("\n🔄 Step 3: Verifying migration...");
const collectionExists = db.getCollectionNames().includes("notifications");
const indexes = db.notifications.getIndexes();

print("📊 Migration Results:");
print("   - Collection exists: " + (collectionExists ? "✅ Yes" : "❌ No"));
print("   - Total indexes: " + indexes.length);
print("   - Indexes:");
indexes.forEach(function(index) {
  print("      • " + index.name + ": " + JSON.stringify(index.key));
});

if (collectionExists && indexes.length >= 7) {
  print("\n🎉 Migration completed successfully!");
  print("✅ Notifications collection is ready for use");
} else {
  print("\n⚠️  Migration may be incomplete");
  print("   - Expected at least 7 indexes (including _id_)");
  print("   - Current indexes: " + indexes.length);
}

print("\n📋 Migration Summary:");
print("   - Collection: notifications");
print("   - Database: bharathva_feed");
print("   - Schema: senderId, receiverId, postId, type, message, isRead, createdAt");
print("   - Indexes: 6 indexes created");
print("✅ Migration script completed");

