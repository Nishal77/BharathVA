# Notification Schema Migration - Complete Implementation

## Overview

The notification system has been restructured to match a cleaner, industry-standard schema while maintaining backward compatibility with existing fields. This migration ensures all notifications follow the new structure: `senderId`, `receiverId`, `postId`, `type`, `message`, `isRead`, `createdAt`.

## Schema Changes

### New Primary Schema Fields

```java
{
  _id: ObjectId,
  senderId: String,      // User who triggered the notification (the liker)
  receiverId: String,    // Post owner (who receives the notification)
  postId: String,        // Which post it belongs to
  type: String,          // e.g. 'LIKE', 'COMMENT', 'FOLLOW'
  message: String,       // e.g. "User2 liked your post"
  isRead: Boolean,
  createdAt: Date
}
```

### Additional UI Enhancement Fields (Kept)

- `actorUsername`: Username of the sender (for quick display)
- `actorFullName`: Full name of the sender
- `actorProfileImageUrl`: Profile image of the sender
- `feedImageUrl`: Thumbnail for the post
- `updatedAt`: Last update timestamp

### Legacy Fields (Maintained for Backward Compatibility)

- `recipientUserId`: Alias for `receiverId` (deprecated)
- `actorUserId`: Alias for `senderId` (deprecated)
- `feedId`: Alias for `postId` (deprecated)

## Implementation Details

### 1. Notification Model (`Notification.java`)

**Changes:**
- Added primary schema fields: `senderId`, `receiverId`, `postId`, `message`
- Added `@Field` annotations for MongoDB mapping
- Added `@Indexed` annotations for performance
- Maintained legacy fields for backward compatibility
- Added getters/setters with automatic field synchronization
- New primary constructor: `Notification(senderId, receiverId, postId, type)`
- Legacy constructor marked as `@Deprecated` but still functional

**Key Features:**
- Automatic field synchronization: Setting `senderId` also updates `actorUserId`
- Fallback logic: Getters return new field if available, fallback to legacy field
- Zero-downtime migration: Both old and new fields work simultaneously

### 2. NotificationService (`NotificationService.java`)

**Changes:**
- Updated `createLikeNotification` to use new schema constructor
- Added `generateNotificationMessage` method for dynamic message generation
- Updated all repository methods to use new field names
- Enhanced error handling with fallback notification creation
- Updated duplicate checking to use new fields

**Message Generation:**
```java
"User2 liked your post"
"User2 commented on your post"
"User2 is now following you"
"Someone liked your post" (fallback when actor info unavailable)
```

### 3. NotificationRepository (`NotificationRepository.java`)

**Changes:**
- Added primary methods using new field names:
  - `findByReceiverIdOrderByCreatedAtDesc`
  - `countByReceiverIdAndIsReadFalse`
  - `findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc`
  - `markAllAsRead` (uses `receiverId`)
  - `deleteByReceiverIdAndCreatedAtBefore`
- Maintained legacy methods as `@Deprecated` with default implementations
- All legacy methods delegate to new methods for compatibility

### 4. NotificationResponse DTO (`NotificationResponse.java`)

**Changes:**
- Added primary schema fields: `senderId`, `receiverId`, `postId`, `message`
- Maintained legacy fields for backward compatibility
- Updated constructor to map from new model fields
- Added getters/setters for all new fields

### 5. MongoDB Migration (`MongoMigrationConfig.java`)

**Migration V3:**
- Automatically runs on application startup
- Migrates existing notifications to new schema
- Maps old fields to new fields:
  - `actorUserId` → `senderId`
  - `recipientUserId` → `receiverId`
  - `feedId` → `postId`
- Generates `message` field for notifications missing it
- Creates indexes for new fields:
  - `senderId`
  - `receiverId`
  - `postId`
  - `type`
  - `createdAt` (descending)
  - Composite: `receiverId + isRead + createdAt`

**Migration Features:**
- Idempotent: Safe to run multiple times
- Non-blocking: Doesn't break startup if migration fails
- Comprehensive logging for debugging
- Verification after migration

## Testing

### 1. Unit Tests

**Test Notification Creation:**
```java
@Test
void testCreateNotificationWithNewSchema() {
    Notification notification = new Notification(
        "sender-123",   // senderId
        "receiver-456", // receiverId
        "post-789",     // postId
        NotificationType.LIKE
    );
    notification.setMessage("John Doe liked your post");
    
    assertNotNull(notification.getSenderId());
    assertNotNull(notification.getReceiverId());
    assertNotNull(notification.getPostId());
    assertNotNull(notification.getMessage());
    
    // Verify legacy fields are synced
    assertEquals("sender-123", notification.getActorUserId());
    assertEquals("receiver-456", notification.getRecipientUserId());
    assertEquals("post-789", notification.getFeedId());
}
```

**Test Message Generation:**
```java
@Test
void testGenerateNotificationMessage() {
    UserInfo actorInfo = new UserInfo();
    actorInfo.setFullName("John Doe");
    
    String message = notificationService.generateNotificationMessage(
        NotificationType.LIKE, 
        actorInfo
    );
    
    assertEquals("John Doe liked your post", message);
}
```

### 2. Integration Tests

**Test Like Notification Creation:**
```bash
# 1. Create a post
POST /api/feed
{
  "userId": "user-001",
  "message": "Test post",
  "imageUrls": []
}

# 2. Like the post
POST /api/feed/{feedId}/like
Headers: Authorization: Bearer {token}

# 3. Verify notification created
GET /api/feed/notifications
Headers: Authorization: Bearer {token}

# Expected response:
{
  "content": [{
    "id": "...",
    "senderId": "user-002",
    "receiverId": "user-001",
    "postId": "{feedId}",
    "type": "LIKE",
    "message": "John Doe liked your post",
    "isRead": false,
    "createdAt": "2025-01-25T...",
    "actorUsername": "johndoe",
    "actorFullName": "John Doe",
    "actorProfileImageUrl": "https://...",
    "feedImageUrl": "https://..."
  }]
}
```

### 3. MongoDB Migration Test

**Verify Migration:**
```javascript
// Connect to MongoDB
use bharathva_feed

// Check notification schema
db.notifications.findOne()

// Expected structure:
{
  "_id": ObjectId("..."),
  "senderId": "user-002",
  "receiverId": "user-001",
  "postId": "feed-123",
  "type": "LIKE",
  "message": "John Doe liked your post",
  "isRead": false,
  "createdAt": ISODate("2025-01-25T..."),
  "updatedAt": ISODate("2025-01-25T..."),
  "actorUsername": "johndoe",
  "actorFullName": "John Doe",
  "actorProfileImageUrl": "https://...",
  "feedImageUrl": "https://...",
  // Legacy fields (for backward compatibility)
  "recipientUserId": "user-001",
  "actorUserId": "user-002",
  "feedId": "feed-123"
}

// Verify indexes
db.notifications.getIndexes()

// Expected indexes:
// - senderId
// - receiverId
// - postId
// - type
// - createdAt (descending)
// - receiverId + isRead + createdAt (composite)
```

## Migration Execution

### Automatic Migration

The migration runs automatically on application startup:

1. **Startup Sequence:**
   ```
   Application Start
   → MongoMigrationConfig.run()
   → migrateLikesField() (V2)
   → migrateNotificationSchema() (V3)
   → markMigrationCompleted()
   ```

2. **Migration Logs:**
   ```
   📋 Running Notification Schema Migration (V3)...
   ✅ Connected to database: bharathva_feed
   ✅ Using collection: notifications
   📊 Found X notifications that need schema migration
   🔄 Executing notification schema migration...
   ✅ Migration Results:
      - Notifications migrated: X
   ✅ All notifications successfully migrated!
   ✅ Notification indexes created successfully
   ```

### Manual Migration Verification

**Check Migration Status:**
```bash
curl -X GET http://localhost:8082/api/migration/notifications/status
```

**Expected Response:**
```json
{
  "status": "completed",
  "migratedCount": 0,
  "totalCount": 0,
  "version": "V3"
}
```

## Backward Compatibility

### Legacy Field Support

The system maintains full backward compatibility:

1. **Read Operations:**
   - Old queries using `recipientUserId`, `actorUserId`, `feedId` still work
   - Getters automatically fallback to legacy fields if new fields are null

2. **Write Operations:**
   - Setting legacy fields automatically syncs to new fields
   - Both old and new fields are saved to MongoDB

3. **API Responses:**
   - `NotificationResponse` includes both new and legacy fields
   - Frontend can use either set of fields

### Migration Strategy

1. **Phase 1 (Current):** New notifications use new schema, old fields synced
2. **Phase 2 (Future):** Migrate existing notifications to new schema
3. **Phase 3 (Future):** Remove legacy fields after full migration

## Performance Optimizations

### Indexes Created

```javascript
// Single field indexes
{ senderId: 1 }
{ receiverId: 1 }
{ postId: 1 }
{ type: 1 }
{ createdAt: -1 }

// Composite index for common queries
{ receiverId: 1, isRead: 1, createdAt: -1 }
```

### Query Optimization

**Before:**
```java
// Used recipientUserId (required fallback lookup)
findByRecipientUserIdOrderByCreatedAtDesc(userId, pageable)
```

**After:**
```java
// Uses receiverId directly (indexed, faster)
findByReceiverIdOrderByCreatedAtDesc(userId, pageable)
```

## Error Handling

### Graceful Degradation

1. **User Info Fetch Failure:**
   - Creates notification with `message: "Someone liked your post"`
   - Populates actor details later when notification is retrieved

2. **Migration Failure:**
   - Logs error but doesn't break application startup
   - Notifications continue to work with existing schema

3. **Field Synchronization:**
   - Automatic sync between old and new fields
   - Fallback logic ensures data is always accessible

## Summary

### What Changed

✅ **Model Structure:**
- Added `senderId`, `receiverId`, `postId`, `message` fields
- Maintained backward compatibility with legacy fields
- Automatic field synchronization

✅ **Service Logic:**
- Updated to use new schema
- Dynamic message generation
- Enhanced error handling

✅ **Repository Methods:**
- New methods using new field names
- Legacy methods still functional

✅ **Migration System:**
- Automatic migration on startup
- Index creation
- Verification and logging

### What Stayed the Same

✅ **API Contracts:**
- All endpoints work the same
- Response format unchanged (includes both old and new fields)

✅ **Frontend Compatibility:**
- Can use either old or new field names
- No breaking changes

✅ **Database Compatibility:**
- Old notifications still work
- New notifications use new schema
- Both schemas coexist

## Next Steps

1. **Test Migration:**
   - Start application
   - Check logs for migration completion
   - Verify notifications in MongoDB

2. **Test Notification Creation:**
   - Like a post
   - Verify notification created with new schema
   - Check message field is populated

3. **Monitor Performance:**
   - Check query performance
   - Verify indexes are used
   - Monitor migration logs

4. **Future Cleanup (Optional):**
   - After full migration, remove legacy fields
   - Update frontend to use only new fields
   - Remove deprecated methods

## Files Modified

1. `Notification.java` - Model restructure
2. `NotificationService.java` - Service logic updates
3. `NotificationRepository.java` - Repository method updates
4. `NotificationResponse.java` - DTO updates
5. `MongoMigrationConfig.java` - Migration script

## Testing Checklist

- [x] Code compiles successfully
- [ ] Migration runs on startup
- [ ] New notifications use new schema
- [ ] Legacy fields are synced
- [ ] Message generation works
- [ ] Indexes are created
- [ ] API responses include new fields
- [ ] Frontend compatibility maintained
- [ ] Error handling works
- [ ] Performance is acceptable

---

**Status:** ✅ Implementation Complete
**Version:** V3
**Migration:** Automatic on startup
**Backward Compatibility:** ✅ Full support

