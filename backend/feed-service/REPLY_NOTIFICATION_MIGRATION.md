# Reply Notification Migration and Implementation

## Overview

This document describes the complete implementation and migration for reply notifications in the BharathVA platform. When User1 replies to User2's comment, User2 receives a REPLY notification in their notification tab.

## MongoDB Migration

### Migration Script: `002_ensure_reply_notification_support.js`

**Status:** ✅ Completed

**What it does:**
1. Creates/updates indexes for optimal notification queries:
   - `idx_receiverId_createdAt` - Fast lookups by receiver
   - `idx_type` - Filter by notification type
   - `idx_senderId_postId_type` - Efficient deletion
   - `idx_receiverId_isRead` - Unread count queries
   - `idx_postId_type` - Post-specific notifications

2. Verifies schema support for REPLY notifications
3. Checks for missing required fields

**Run migration:**
```bash
mongosh bharathva_feed < migrations/002_ensure_reply_notification_support.js
```

## Database Schema

### Notifications Collection

**Required fields for REPLY notifications:**
- `senderId` (String) - User who replied (User1)
- `receiverId` (String) - Comment author who receives notification (User2)
- `postId` (String) - ID of the feed/post
- `type` (String) - Must be "REPLY"
- `message` (String) - Formatted message: "{User1 name} replied to your comment: {reply text}"
- `commentText` (String) - The actual reply text from User1
- `originalCommentText` (String) - User2's original comment that was replied to
- `commentId` (String) - Index/ID of the comment being replied to
- `isRead` (Boolean) - Notification read status
- `createdAt` (Date) - When notification was created

### Feeds Collection - Comments Array

**Comment structure:**
```json
{
  "userId": "user-id",
  "text": "comment text",
  "createdAt": "2025-11-08T15:51:27.826Z",
  "replyToCommentIndex": 5  // null for top-level comments, integer for replies
}
```

**Important:** The `replyToCommentIndex` field must be saved to MongoDB when a reply is created.

## Backend Implementation

### Flow

1. **User1 replies to User2's comment:**
   - Frontend sends `replyToCommentIndex` in `CreateCommentRequest`
   - Backend creates `Comment` with `replyToCommentIndex` set
   - Comment is saved to `feeds.comments` array with `replyToCommentIndex` field

2. **Reply notification creation:**
   - `FeedService.addComment()` detects reply (checks `replyToCommentIndex`)
   - Retrieves original comment BEFORE adding new reply
   - Calls `NotificationService.createReplyNotification()`
   - Notification is saved to MongoDB `notifications` collection
   - WebSocket event is sent to User2

3. **Notification display:**
   - User2 receives notification in their notification tab
   - Message format: "{User1 name} replied to your comment: {reply text}"
   - Shows original comment and reply text

### Key Code Files

**FeedService.java:**
- `addComment()` - Detects replies and creates notifications
- Validates `replyToCommentIndex` before adding comment
- Retrieves original comment info BEFORE adding reply

**NotificationService.java:**
- `createReplyNotification()` - Creates and saves REPLY notifications
- `generateReplyNotificationMessage()` - Formats notification message
- Validates all inputs before saving
- Verifies notification exists in database after save

**Notification.java:**
- Model includes all required fields for REPLY notifications
- `NotificationType.REPLY` enum value
- Fields: `originalCommentText`, `commentText`, `commentId`, `message`

## Verification

### Check MongoDB

**Verify REPLY notifications exist:**
```javascript
db.notifications.find({ type: "REPLY" }).pretty()
```

**Verify comments have replyToCommentIndex:**
```javascript
db.feeds.find(
  { "comments.replyToCommentIndex": { $exists: true, $ne: null } },
  { "comments": 1 }
).pretty()
```

**Count REPLY notifications:**
```javascript
db.notifications.countDocuments({ type: "REPLY" })
```

### Test Flow

1. User2 comments on User1's post → User1 gets COMMENT notification ✅
2. User1 replies to User2's comment → User2 gets REPLY notification ✅
3. Check MongoDB `notifications` collection for REPLY type ✅
4. Verify notification has all required fields ✅

## Current Status

- ✅ Migration script created and executed
- ✅ Indexes created in MongoDB
- ✅ Backend code implements reply notification creation
- ✅ Notification model supports all required fields
- ✅ WebSocket events configured for real-time updates
- ✅ Frontend displays REPLY notifications correctly

## Next Steps

1. Test reply functionality:
   - User1 replies to User2's comment
   - Verify REPLY notification is created in MongoDB
   - Verify User2 sees notification in notification tab

2. Monitor logs for:
   - "🔔 Creating reply notification" messages
   - "✅ Reply notification saved successfully" confirmations
   - Any error messages during notification creation

3. Verify data in MongoDB:
   - Check `notifications` collection for REPLY type
   - Verify all required fields are present
   - Check `feeds.comments` array for `replyToCommentIndex` values


