# Likes Field Migration - MongoDB Migration V2

## Overview

This migration adds the `likes` field to all existing feeds in the MongoDB `feeds` collection. The `likes` field stores an array of user IDs who have liked each feed post.

## Problem Statement

- The Java `Feed` model has a `likes` field defined
- Existing MongoDB documents are missing the `likes` field
- When users try to like posts, the field doesn't exist in old documents
- This causes inconsistency and potential errors

## Migration Strategy

### V2 Migration: Add Likes Field

**What it does:**
1. Finds all feeds that don't have a `likes` field or have it set to `null`
2. Initializes `likes` as an empty array `[]` for all such feeds
3. Fixes any feeds where `likes` is not an array type
4. Verifies all feeds have a valid `likes` array

**MongoDB Operation:**
```javascript
db.feeds.updateMany(
  {
    $or: [
      { likes: { $exists: false } },
      { likes: null }
    ]
  },
  {
    $set: { likes: [] }
  }
)
```

## Migration Implementation

### Location
`backend/feed-service/src/main/java/com/bharathva/feed/config/MongoMigrationConfig.java`

### Method
`migrateLikesField()` - Called automatically during application startup

### Features

1. **Idempotent**: Safe to run multiple times
2. **Comprehensive**: Handles missing fields, null values, and invalid types
3. **Verified**: Logs detailed statistics after migration
4. **Non-destructive**: Only adds missing fields, doesn't modify existing like data

## Migration Execution

### Automatic Execution
- Runs on application startup if `feed.migration.enabled=true` (default)
- Executes before sample data insertion
- Always runs to ensure data consistency

### Manual Execution
The migration runs automatically. To verify it ran:
```bash
# Check application logs
grep "Likes Field Migration" feed-service.log

# Expected output:
# 📋 Running Likes Field Migration (V2)...
# 📊 Found X feeds that need likes field migration
# ✅ Successfully migrated X feeds - added empty likes array
# ✅ All feeds have valid likes field - migration successful!
```

## Verification

### Check MongoDB Directly
```javascript
// Connect to MongoDB
use bharathva_feed

// Count feeds with likes field
db.feeds.countDocuments({ likes: { $type: "array" } })

// Count feeds without likes field
db.feeds.countDocuments({ 
  $or: [
    { likes: { $exists: false } },
    { likes: null },
    { likes: { $not: { $type: "array" } } }
  ]
})

// View a sample feed
db.feeds.findOne({}, { likes: 1 })
```

### Expected Result
- All feeds should have `likes: []` (empty array) or `likes: [userId1, userId2, ...]`
- No feeds should have missing, null, or non-array `likes` field

## Data Structure

### Before Migration
```json
{
  "_id": "68fc94c2e280e615a9ef7b22",
  "userId": "9c58dc97-390f-43ed-8950-cdef29930756",
  "message": "Hello world",
  "imageUrls": [],
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
  // No likes field
}
```

### After Migration
```json
{
  "_id": "68fc94c2e280e615a9ef7b22",
  "userId": "9c58dc97-390f-43ed-8950-cdef29930756",
  "message": "Hello world",
  "imageUrls": [],
  "likes": [],  // ← Added empty array
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}
```

### After Users Like
```json
{
  "_id": "68fc94c2e280e615a9ef7b22",
  "userId": "9c58dc97-390f-43ed-8950-cdef29930756",
  "message": "Hello world",
  "imageUrls": [],
  "likes": [
    "user-123",
    "user-456"
  ],  // ← Array of user IDs who liked
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-02T00:00:00Z")
}
```

## Backend Integration

### FeedService.toggleLike()
The existing `toggleLike()` method already handles:
- Adding userId to likes array if not present
- Removing userId from likes array if present
- Preventing duplicate likes
- Updating `updatedAt` timestamp

### Example Usage
```java
// User likes a post
FeedResponse response = feedService.toggleLike(feedId, userId);
// Response includes: likesCount, userLiked status

// Check if user liked
boolean hasLiked = feedService.hasUserLiked(feedId, userId);
```

## Migration Logs

Expected log output:
```
📋 Running Likes Field Migration (V2)...
📊 Found 3 feeds that need likes field migration
✅ Successfully migrated 3 feeds - added empty likes array
📊 Migration verification:
   - Total feeds: 3
   - Feeds with valid likes array: 3
✅ All feeds have valid likes field - migration successful!
```

## Rollback

This migration is **non-destructive** and **safe**. However, if rollback is needed:

```javascript
// Remove likes field from all feeds (NOT RECOMMENDED - data loss)
db.feeds.updateMany({}, { $unset: { likes: "" } })
```

**Note:** Rollback will lose all like data. Only use if absolutely necessary.

## Future Migrations

When adding new fields:
1. Add field to Java model (`Feed.java`)
2. Create migration method in `MongoMigrationConfig.java`
3. Call migration in `runMigration()`
4. Update migration version in `markMigrationCompleted()`
5. Document in this file

## Testing

### Unit Test Example
```java
@Test
void testLikesFieldExists() {
    Feed feed = feedRepository.findById("feed-id").orElseThrow();
    assertNotNull(feed.getLikes());
    assertTrue(feed.getLikes() instanceof List);
}
```

### Integration Test
```java
@Test
void testLikesMigration() {
    // Verify all feeds have likes field
    List<Feed> feeds = feedRepository.findAll();
    feeds.forEach(feed -> {
        assertNotNull(feed.getLikes());
        assertTrue(feed.getLikes() instanceof List);
    });
}
```

## Status

✅ **Migration Implemented**: V2 - Likes Field Migration
✅ **Status**: Ready for deployment
✅ **Idempotent**: Yes - safe to run multiple times
✅ **Non-destructive**: Yes - only adds missing fields

