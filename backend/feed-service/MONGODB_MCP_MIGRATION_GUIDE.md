# MongoDB Migration Guide - Likes Field (MCP Server)

## Overview

This guide explains how to run the likes field migration using MongoDB MCP server tools or directly through MongoDB operations.

## Current Status

Based on MongoDB MCP server analysis:
- ✅ **Total Feeds**: 9
- ✅ **Feeds with valid likes array**: 9 (100%)
- ✅ **Feeds missing likes field**: 0
- ✅ **Feeds with null likes**: 0

**Result**: All feeds already have the `likes` field properly initialized!

## Migration Analysis

### MongoDB MCP Server Capabilities

The MongoDB MCP server provides these tools:
- `find` - Query documents
- `aggregate` - Run aggregation pipelines
- `count` - Count documents
- `collection-schema` - Analyze collection structure
- `collection-indexes` - View indexes

**Note**: MCP server doesn't support `updateMany` directly, so migrations must be run:
1. Via Spring Boot application (automatic on startup)
2. Via MongoDB shell script
3. Via MongoDB Compass or other GUI tools

## Migration Scripts

### Option 1: Automatic Migration (Spring Boot)

The migration runs automatically on application startup via:
- `MongoMigrationConfig.java` - Runs on startup
- `LikesMigrationService.java` - Standalone service

**Location**: `backend/feed-service/src/main/java/com/bharathva/feed/config/MongoMigrationConfig.java`

**Method**: `migrateLikesField()`

### Option 2: MongoDB Shell Script

Run the provided JavaScript script directly:

```bash
mongosh "your-mongodb-connection-string" < mongodb-migration-likes.js
```

**Location**: `backend/feed-service/mongodb-migration-likes.js`

### Option 3: Manual MongoDB Commands

Connect to MongoDB and run:

```javascript
use('bharathva_feed');

// Step 1: Add likes to feeds without it
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
);

// Step 2: Fix invalid types
db.feeds.updateMany(
  {
    likes: { $not: { $type: "array" } }
  },
  {
    $set: { likes: [] }
  }
);

// Step 3: Verify
db.feeds.countDocuments({ likes: { $type: "array" } });
```

## Migration Verification (Using MCP)

You can verify the migration using MongoDB MCP tools:

```typescript
// Count feeds with valid likes array
mcp_MongoDB_count({
  database: 'bharathva_feed',
  collection: 'feeds',
  query: { likes: { $type: 'array' } }
});

// Count feeds missing likes
mcp_MongoDB_count({
  database: 'bharathva_feed',
  collection: 'feeds',
  query: { likes: { $exists: false } }
});

// View sample feeds
mcp_MongoDB_find({
  database: 'bharathva_feed',
  collection: 'feeds',
  projection: { _id: 1, likes: 1 },
  limit: 5
});
```

## Migration Status Check

### Via MCP Server

```typescript
// Aggregate to get migration status
mcp_MongoDB_aggregate({
  database: 'bharathva_feed',
  collection: 'feeds',
  pipeline: [
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        withLikes: { 
          $sum: { 
            $cond: [{ $ne: ['$likes', null] }, 1, 0] 
          } 
        },
        arrayType: { 
          $sum: { 
            $cond: [{ $eq: [{ $type: '$likes' }, 'array'] }, 1, 0] 
          } 
        }
      }
    }
  ]
});
```

## What the Migration Does

1. **Finds feeds without `likes` field** - Documents where `likes` doesn't exist
2. **Finds feeds with null `likes`** - Documents where `likes` is explicitly null
3. **Finds feeds with invalid type** - Documents where `likes` is not an array
4. **Sets `likes` to empty array `[]`** - Initializes all problematic feeds
5. **Verifies success** - Ensures all feeds have valid array type

## Idempotent Operation

The migration is **idempotent** - safe to run multiple times:
- If a feed already has `likes: []`, it won't be modified
- If a feed has `likes: ["user1", "user2"]`, it won't be modified
- Only feeds with missing/null/invalid `likes` are updated

## Expected Results

After successful migration:
- ✅ All feeds have `likes` field
- ✅ All `likes` fields are arrays
- ✅ Existing like data is preserved
- ✅ New feeds will automatically have `likes: []`

## Troubleshooting

### Issue: Migration reports success but some feeds still missing likes

**Solution**: Check MongoDB permissions and connection:
```javascript
// Verify connection
db.feeds.countDocuments();

// Check specific feed
db.feeds.findOne({ likes: { $exists: false } });
```

### Issue: Migration fails with permission error

**Solution**: Ensure MongoDB user has write permissions:
```javascript
// Check current user permissions
db.runCommand({ connectionStatus: 1 });
```

### Issue: Some feeds have non-array likes

**Solution**: Run the invalid type fix:
```javascript
db.feeds.updateMany(
  { likes: { $not: { $type: "array" } } },
  { $set: { likes: [] } }
);
```

## Next Steps

1. ✅ **Migration Complete**: All 9 feeds have valid `likes` arrays
2. ✅ **Backend Updated**: `FeedResponse` now includes `likes` in JSON
3. ✅ **Frontend Ready**: Will receive `likes` array from API
4. 🔄 **Test**: Restart backend and verify API returns `likes` array

## Related Files

- `backend/feed-service/src/main/java/com/bharathva/feed/config/MongoMigrationConfig.java`
- `backend/feed-service/src/main/java/com/bharathva/feed/service/LikesMigrationService.java`
- `backend/feed-service/src/main/java/com/bharathva/feed/dto/FeedResponse.java`
- `backend/feed-service/mongodb-migration-likes.js`
- `backend/feed-service/LIKES_MIGRATION_DOCUMENTATION.md`

