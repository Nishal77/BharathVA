# Run Likes Migration - Immediate Instructions

## Quick Fix: Run Migration via REST API

The migration is now available as a REST endpoint. Run this command:

```bash
curl -X POST http://localhost:8082/api/migration/likes
```

**Expected Response:**
```json
{
  "totalFeeds": 9,
  "feedsToMigrate": 9,
  "matched": 9,
  "modified": 9,
  "status": "success",
  "message": "Successfully migrated 9 feeds",
  "feedsWithValidLikes": 9,
  "verification": "all_feeds_migrated"
}
```

## Check Status

```bash
curl -X POST http://localhost:8082/api/migration/likes/status
```

## What Was Fixed

1. **Enhanced Migration Code**: 
   - Uses MongoDB JSON parsing for more reliable queries
   - Better error logging
   - Immediate verification after update

2. **REST API Endpoint**: 
   - `POST /api/migration/likes` - Run migration manually
   - `POST /api/migration/likes/status` - Check migration status

3. **Improved Logging**:
   - Logs matched vs modified counts
   - Warns if matched > 0 but modified = 0 (permissions issue)
   - Verifies immediately after update

## Next Steps

1. **Start Feed Service** (if not running)
2. **Call Migration API**: `POST /api/migration/likes`
3. **Verify**: Check response shows `modified: 9`
4. **Check MongoDB**: All feeds should now have `likes: []`

## If Migration Still Fails

Check logs for:
- "Matched: X but Modified: 0" → MongoDB permissions issue
- "CRITICAL: Matched X but modified 0" → Write concern issue

Solution: Check MongoDB user has `readWrite` permissions on `bharathva_feed` database.

