# Run Likes Migration Directly

## Option 1: Using MongoDB MCP Tools (Recommended)

The migration can be run directly using MongoDB MCP server tools. 

## Option 2: Using MongoDB Shell

Connect to MongoDB and run:

```javascript
use('bharathva_feed');

// Update all feeds without likes field
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

// Verify
db.feeds.countDocuments({ likes: { $type: "array" } });
```

## Option 3: Restart Feed Service

The migration runs automatically on startup. Check logs for:
- "Running Likes Field Migration (V2)..."
- "Successfully migrated X feeds"

