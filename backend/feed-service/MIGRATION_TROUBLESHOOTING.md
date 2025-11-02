# Likes Migration Troubleshooting Guide

## Issue: Migration runs but no changes in MongoDB

### Problem
- Migration code executes without errors
- Logs show "migration successful"
- But MongoDB documents still missing `likes` field

### Root Causes

1. **Write Concern Issues**: MongoDB update might not be committing
2. **Permissions**: Database user might not have write permissions
3. **Connection String**: Might be connecting to wrong database
4. **Transaction Issues**: Updates might be rolled back

## Solutions

### Solution 1: Run Migration via REST API (Recommended)

**Endpoint**: `POST http://localhost:8082/api/migration/likes`

```bash
curl -X POST http://localhost:8082/api/migration/likes
```

**Response**:
```json
{
  "totalFeeds": 9,
  "feedsToMigrate": 9,
  "matched": 9,
  "modified": 9,
  "status": "success",
  "message": "Successfully migrated 9 feeds"
}
```

### Solution 2: Check Migration Status

**Endpoint**: `POST http://localhost:8082/api/migration/likes/status`

```bash
curl -X POST http://localhost:8082/api/migration/likes/status
```

### Solution 3: Run Direct MongoDB Update

Connect to MongoDB and run:

```javascript
use('bharathva_feed');

// Check current state
db.feeds.countDocuments({
  $or: [
    { likes: { $exists: false } },
    { likes: null }
  ]
});

// Run update
db.feeds.updateMany(
  {
    $or: [
      { likes: { $exists: false } },
      { likes: null }
    ]
  },
  {
    $set: { likes: [] }
  },
  {
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

// Verify
db.feeds.find({}, { _id: 1, likes: 1 }).limit(5);
```

### Solution 4: Check Application Logs

Look for:
```
📋 Running Likes Field Migration (V2)...
📊 Found X feeds that need likes field migration
✅ Successfully migrated X feeds
```

If you see "Matched: X but Modified: 0", there's a write concern issue.

## Verification Commands

### Check MongoDB Directly
```javascript
use('bharathva_feed');

// Count feeds without likes
db.feeds.countDocuments({
  $or: [
    { likes: { $exists: false } },
    { likes: null }
  ]
});

// Count feeds with valid likes array
db.feeds.countDocuments({
  likes: { $type: "array" }
});

// View sample feed
db.feeds.findOne({}, { likes: 1, userId: 1 });
```

### Expected Results After Migration
- All feeds should have `likes: []` or `likes: [userId1, userId2, ...]`
- Count of feeds without likes should be 0
- All feeds should have `likes` as an array type

## Debug Steps

1. **Verify Database Connection**:
   - Check `application.yml` for correct `MONGO_DATABASE`
   - Verify MongoDB URI is correct
   - Test connection manually

2. **Check Write Permissions**:
   - Ensure MongoDB user has `readWrite` permissions
   - Check if database is read-only

3. **Verify Collection Name**:
   - Ensure collection is `feeds` (not `feed` or `Feeds`)
   - Check database name matches

4. **Check for Errors**:
   - Look for exceptions in logs
   - Check if migration method is actually being called
   - Verify `migrationEnabled=true` in config

5. **Test Update Directly**:
   ```javascript
   // Test update on single document
   db.feeds.updateOne(
     { _id: ObjectId("68fc94c2e280e615a9ef7b22") },
     { $set: { likes: [] } }
   );
   
   // Verify it worked
   db.feeds.findOne({ _id: ObjectId("68fc94c2e280e615a9ef7b22") }, { likes: 1 });
   ```

## Manual Migration Script

Save this as `migrate-likes.js` and run:
```bash
mongosh <connection-string> < migrate-likes.js
```

Script content:
```javascript
use('bharathva_feed');

print("Starting likes migration...");

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

print("Matched: " + result.matchedCount);
print("Modified: " + result.modifiedCount);

// Verify
const remaining = db.feeds.countDocuments({
  $or: [
    { likes: { $exists: false } },
    { likes: null }
  ]
});

print("Remaining feeds without likes: " + remaining);

if (remaining === 0) {
  print("✅ Migration successful!");
} else {
  print("❌ Migration incomplete");
}
```

