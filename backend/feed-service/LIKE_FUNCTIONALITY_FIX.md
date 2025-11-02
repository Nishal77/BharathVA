# Like Functionality Fix Documentation

## Problem
Likes were not being registered in MongoDB when users clicked the like button, even though the `likes` field migration was successful.

## Root Cause Analysis

### Issue 1: Missing `feedId` Prop
**Problem**: `FeedCard` component was not passing `feedId` to `FeedActionSection`, so the frontend API call couldn't identify which feed to like.

**Location**: `apps/mobile/components/feed/FeedCard.tsx`

**Fix**: Added `feedId={id}` prop to `FeedActionSection`:
```tsx
<FeedActionSection
  feedId={id}  // ← Added this
  onLike={onLike}
  // ... other props
/>
```

### Issue 2: No Backend Verification
**Problem**: Backend `toggleLike()` method saved the feed but didn't verify persistence, making it hard to detect failures.

**Location**: `backend/feed-service/src/main/java/com/bharathva/feed/service/FeedService.java`

**Fix**: Added comprehensive verification logic after save:
- Verifies save didn't return null
- Reloads feed from database
- Verifies likes list contains/doesn't contain user ID as expected
- Logs detailed verification information
- Throws exception if verification fails

## Files Modified

### Frontend
1. **`apps/mobile/components/feed/FeedCard.tsx`**
   - Added `feedId={id}` prop to `FeedActionSection`

### Backend
2. **`backend/feed-service/src/main/java/com/bharathva/feed/service/FeedService.java`**
   - Enhanced `toggleLike()` method with verification logic
   - Added null check after save
   - Added database reload and verification
   - Added detailed logging for debugging
   - Added exception throwing for verification failures

## How It Works Now

### Frontend Flow
1. User clicks like button
2. `FeedActionSection` receives `feedId` prop
3. `handleLike()` checks if `feedId` exists
4. Calls `toggleLike(feedId)` API
5. Receives response with `likesCount` and `userLiked`
6. Updates UI optimistically, then syncs with backend response

### Backend Flow
1. Receives `POST /api/feed/{feedId}/like` request
2. Authenticates user and extracts `userId`
3. Finds feed in database
4. Checks if user already liked (`hasLiked()`)
5. Adds or removes user ID from `likes` array
6. Updates timestamp
7. Saves feed to database
8. **Verifies save was successful** (new)
9. **Reloads feed and verifies likes** (new)
10. Returns `FeedResponse` with updated like count

## Testing

### Manual Test
1. Click like button on any feed
2. Check backend logs for:
   ```
   ✅ Like toggle verified:
      - Feed ID: <id>
      - User ID: <userId>
      - Likes count: <count>
      - User liked: <true/false>
      - Likes list: [userId1, userId2, ...]
   ```
3. Verify MongoDB document has updated `likes` array

### Expected MongoDB Document After Like
```json
{
  "_id": "...",
  "userId": "...",
  "message": "...",
  "likes": ["user-id-1", "user-id-2"],  // ← Should contain user IDs
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Verification Commands

### Check MongoDB Directly
```javascript
use('bharathva_feed');

// Find feed with likes
db.feeds.findOne(
  { _id: ObjectId("68fc94c2e280e615a9ef7b22") },
  { likes: 1, userId: 1 }
);
```

### Check Backend Logs
Look for:
- `"User {userId} liked feed {feedId}"`
- `"✅ Like toggle verified"`
- `"Like toggled successfully. Feed {feedId} now has {count} likes"`

### API Test
```bash
curl -X POST http://localhost:8082/api/feed/{feedId}/like \
  -H "Authorization: Bearer {token}"
```

Expected response:
```json
{
  "id": "...",
  "userId": "...",
  "message": "...",
  "likesCount": 1,
  "userLiked": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Debugging

If likes still don't persist:

1. **Check `feedId` is being passed**:
   - Inspect `FeedCard` component
   - Verify `id` prop is not undefined
   - Check console logs in `handleLike()` for `feedId`

2. **Check API call**:
   - Verify authentication token is valid
   - Check network request in browser DevTools
   - Verify response status is 200

3. **Check backend logs**:
   - Look for verification errors
   - Check if exception is thrown during verification
   - Verify MongoDB connection is working

4. **Check MongoDB directly**:
   - Query feed document after like
   - Verify `likes` array is updated
   - Check if `updatedAt` timestamp changed

## Additional Notes

- The verification logic ensures data integrity but may impact performance slightly
- If verification fails, an exception is thrown and the API returns 500
- Frontend will revert optimistic update on error
- All like operations are transactional (`@Transactional`)

