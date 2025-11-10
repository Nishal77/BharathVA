# Deleted User Handling Implementation

## Overview
This document describes how the application handles users that have been deleted from NeonDB. When a user is deleted, the UI gracefully displays "[Deleted User]" instead of showing errors or broken data.

## Implementation Details

### 1. User Service (`userService.ts`)
- **Detection**: Checks for `USER_NOT_FOUND` error code when fetching user profiles
- **Response**: Returns clear error response indicating user was deleted
- **Error Handling**: Handles both API errors and exceptions

### 2. Feed Service (`feedService.ts`)
- **Detection**: Detects deleted users when fetching profiles for feeds
- **Marking**: Marks deleted users with `[Deleted User]` and `[deleted_xxx]` username
- **Cache Management**: 
  - Deleted users are NOT cached (always fetch fresh)
  - Cache check skips deleted users to force fresh lookup
- **Interface**: Updated `EnhancedFeedItem` interface to include `isDeleted` flag

### 3. Comments Modal (`CommentsModal.tsx`)
- **Detection**: Handles deleted users when fetching comment author profiles
- **Display**: Shows `[Deleted User]` for deleted comment authors
- **Error Handling**: Handles both API errors and exceptions

### 4. Notifications (`NotificationsContent.tsx`)
- **Detection**: Handles deleted users in all notification fetching scenarios
- **Display**: Updates notification display to show `[Deleted User]` for deleted actors
- **Real-time**: Handles both initial fetch and real-time WebSocket notifications
- **Cache**: Caches deleted user info to avoid repeated API calls

### 5. Feed Display (`index.tsx`)
- **Detection**: Checks `userProfile` for deleted user indicators
- **Display**: Shows `[Deleted User]` name and `[deleted_xxx]` handle
- **Avatar**: Sets avatar to `null` for deleted users

### 6. Feed Content Section (`FeedContentSection.tsx`)
- **Styling**: Applies italic style and muted color for deleted users
- **Verified Badge**: Hides verified badge for deleted users

## User Profile Structure

### Deleted User Profile Format
```typescript
{
  fullName: "[Deleted User]",
  username: "[deleted_xxxxxxx]",
  profileImageUrl: null,
  profilePicture: null,
  isDeleted: true
}
```

## Cache Behavior

### Deleted Users
- **NOT cached** - Always fetch fresh to check if user still exists
- **Force refresh** - Cache check returns `null` for deleted users
- **Prevents stale data** - Ensures UI always reflects current database state

### Normal Users
- **Cached for 5 minutes** - Reduces API calls
- **Automatic refresh** - Cache expires after duration
- **Fallback handling** - Shows generic user info if fetch fails

## Error Detection

### API Error Codes
- `USER_NOT_FOUND`: User deleted from NeonDB
- `HTTP_404`: User endpoint not found
- Error messages containing "not found" or "USER_NOT_FOUND"

### Exception Handling
- Catches network errors
- Checks error messages for deletion indicators
- Falls back to deleted user display if user not found

## UI Display Rules

### Feed Cards
- **Name**: `[Deleted User]` (italic, muted color)
- **Handle**: `@[deleted_xxxxxxx]` (italic, muted color)
- **Avatar**: `null` (shows placeholder)
- **Verified Badge**: Hidden

### Comments
- **Author Name**: `[Deleted User]`
- **Author Username**: `[deleted_xxxxxxx]`
- **Avatar**: `null` (shows placeholder)

### Notifications
- **Actor Name**: `[Deleted User]`
- **Actor Username**: `[deleted_xxxxxxx]`
- **Profile Image**: `null` (shows placeholder)

## Testing

### Test Scenarios
1. **Delete user from NeonDB**
   - Verify feeds show `[Deleted User]`
   - Verify comments show `[deleted_xxx]`
   - Verify notifications show `[Deleted User]`

2. **Cache Behavior**
   - Verify deleted users are not cached
   - Verify fresh fetch on every request
   - Verify no stale data displayed

3. **Error Handling**
   - Verify no console errors
   - Verify graceful fallback
   - Verify UI remains functional

## Files Modified

1. `apps/mobile/services/api/userService.ts`
2. `apps/mobile/services/api/feedService.ts`
3. `apps/mobile/components/feed/components/CommentsModal.tsx`
4. `apps/mobile/app/(user)/[userId]/notifications/NotificationsContent.tsx`
5. `apps/mobile/app/(user)/[userId]/(tabs)/index.tsx`
6. `apps/mobile/components/feed/FeedContentSection.tsx`

## Summary

The system now comprehensively handles deleted users across all UI components:
- ✅ No errors when fetching deleted users
- ✅ Clear visual indication: `[Deleted User]` label
- ✅ Consistent behavior across feeds, comments, and notifications
- ✅ Live data: Always fetches fresh (no stale cache)
- ✅ Graceful degradation: UI remains functional


