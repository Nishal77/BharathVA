# Complete User ID Mismatch Fix

## Problem Summary

Multiple user IDs were being used simultaneously, causing 401 errors:
- Token user ID: `3274b0f3-f8e9-4ba1-a964-0c78df3fbbc9`
- Profile user ID: `0f69449d-9d05-4c1d-a009-283a47921aca`
- Refresh token user ID: `5205b642-a73e-40f5-b1dd-bf33ea5f20a2`

**Root Cause:** Stale cached data and refresh tokens from different user sessions.

## Fixes Applied

### 1. Frontend: Token Manager (`authService.ts`)

**Changes:**
- ✅ Extract user ID from access token before fetching refresh token
- ✅ Verify refresh token belongs to current user
- ✅ Clear SecureStore refresh token if access token is expired (prevents using wrong user's token)
- ✅ Update SecureStore with correct refresh token after database fetch
- ✅ Only use SecureStore fallback if access token is valid

**Key Logic:**
```typescript
// Extract user ID from current token
const currentUserId = extractUserIdFromToken(accessToken);

// Fetch refresh token from database (uses access token's user ID)
const refreshToken = await fetchFromDatabase(accessToken);

// Verify ownership and update SecureStore
await SecureStore.setItemAsync('refreshToken', refreshToken);
```

### 2. Frontend: User Service (`userService.ts`)

**Changes:**
- ✅ Extract user ID from token before fetching profile
- ✅ Log warnings when fetching profile for different user
- ✅ Verify token user ID matches requested user ID

**Key Logic:**
```typescript
// Extract user ID from token
const tokenUserId = extractUserIdFromToken(token);

// Log if mismatch (might be viewing someone else's profile)
if (tokenUserId && userId !== tokenUserId) {
  log(`Fetching profile for different user`);
}
```

### 3. Backend: Session Management (`SessionManagementService.java`)

**Changes:**
- ✅ Order sessions by `last_used_at DESC` to get most recent session first
- ✅ Added detailed logging for debugging
- ✅ Better error messages with user ID

**Key Logic:**
```java
// Get most recently used session for this user
List<UserSession> sessions = userSessionRepository
    .findActiveSessionsByUserId(userId, LocalDateTime.now());
// ORDER BY last_used_at DESC ensures most recent session first
```

### 4. Backend: Repository (`UserSessionRepository.java`)

**Changes:**
- ✅ Updated query to order by `last_used_at DESC, created_at DESC`
- ✅ Ensures most recently used session is returned first

## Database Cleanup Required

### Step 1: Check Current Sessions

Run this SQL in NeonDB SQL editor:

```sql
-- See all active sessions with user details
SELECT 
    us.id as session_id,
    us.user_id,
    u.email,
    u.username,
    us.refresh_token,
    us.created_at,
    us.last_used_at,
    us.expires_at,
    CASE 
        WHEN us.expires_at > NOW() THEN 'ACTIVE'
        ELSE 'EXPIRED'
    END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.last_used_at DESC;
```

### Step 2: Clear All Sessions

**Option A: Clear all sessions (forces all users to re-login)**
```sql
DELETE FROM user_sessions;
```

**Option B: Clear expired sessions only**
```sql
DELETE FROM user_sessions WHERE expires_at < NOW();
```

**Option C: Clear sessions for specific user**
```sql
DELETE FROM user_sessions WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Step 3: Verify Clean State

After cleanup, verify:
```sql
SELECT COUNT(*) as active_sessions FROM user_sessions WHERE expires_at > NOW();
-- Should return 0 or 1 (your current session after re-login)
```

## Frontend Cleanup Required

### Step 1: Clear SecureStore

Add this temporarily to your app startup (or run manually):

```typescript
import { tokenManager } from './services/api/authService';

// Clear all auth data
await tokenManager.clearSecureStore();
```

### Step 2: Re-login

After clearing SecureStore and database:
1. Logout from app
2. Login fresh with your credentials
3. Verify user ID matches in logs

## Verification Steps

### 1. Check Token User ID

After login, check logs for:
```
✅ [AuthService] User data saved after login
  userId: "5205b642-a73e-40f5-b1dd-bf33ea5f20a2"
```

### 2. Check Refresh Token Fetch

When token refresh happens:
```
✅ [TokenManager] Refresh token fetched from database successfully
  currentUserId: "5205b642-a73e-40f5-b1dd-bf33ea5f20a2"
```

### 3. Check User Profile Fetch

When fetching profile:
```
[UserService] Fetching user profile by ID
  userId: "5205b642-a73e-40f5-b1dd-bf33ea5f20a2"
  tokenUserId: "5205b642-a73e-40f5-b1dd-bf33ea5f20a2"
  userIdMatch: true
```

### 4. Verify No Mismatches

Look for these error messages (should NOT appear):
```
❌ CRITICAL: User ID mismatch after token refresh!
⚠️ User ID mismatch detected. Clearing tokens and forcing re-login.
```

## Expected Behavior After Fix

### ✅ Correct Flow:

1. **Login:**
   - Creates session in database with user_id = `5205b642...`
   - Saves tokens to SecureStore
   - UserData saved with userId = `5205b642...`

2. **Token Refresh:**
   - Extracts user ID from current token: `5205b642...`
   - Fetches refresh token from database for user `5205b642...`
   - Backend returns new tokens for user `5205b642...`
   - UserData updated with userId = `5205b642...`
   - All IDs match ✓

3. **API Calls:**
   - Uses token with userId = `5205b642...`
   - UserData has userId = `5205b642...`
   - Database session has user_id = `5205b642...`
   - All match ✓

### ❌ What Should NOT Happen:

- Different user IDs in logs
- 401 errors after token refresh
- User profile endpoints failing
- Refresh token belonging to different user

## Files Changed

### Frontend:
1. `apps/mobile/services/api/authService.ts`
   - `getRefreshToken()` - Added user ID extraction and validation
   - `refreshAccessToken()` - Added user ID validation
   - `clearSecureStore()` - New function for complete cleanup
   - `getUserIdFromToken()` - New function to extract user ID

2. `apps/mobile/services/api/userService.ts`
   - `getUserProfileById()` - Added user ID extraction and logging

3. `apps/mobile/contexts/AuthContext.tsx`
   - `checkAuthStatus()` - Added user ID validation

### Backend:
1. `backend/auth-service/src/main/java/com/bharathva/auth/service/SessionManagementService.java`
   - `getCurrentSessionRefreshToken()` - Added logging and better error messages

2. `backend/auth-service/src/main/java/com/bharathva/auth/repository/UserSessionRepository.java`
   - `findActiveSessionsByUserId()` - Updated to order by `last_used_at DESC`

## Testing Checklist

- [ ] Clear database: `DELETE FROM user_sessions;`
- [ ] Clear SecureStore: `await tokenManager.clearSecureStore();`
- [ ] Logout and login fresh
- [ ] Verify user ID in logs matches across all operations
- [ ] Test token refresh - verify user ID matches
- [ ] Test API calls - verify no 401 errors
- [ ] Check logs for any user ID mismatch warnings

## Troubleshooting

### Still seeing user ID mismatches?

1. **Check database:**
   ```sql
   SELECT user_id, COUNT(*) 
   FROM user_sessions 
   WHERE expires_at > NOW() 
   GROUP BY user_id;
   ```
   - Should only have ONE user_id with active sessions

2. **Check SecureStore:**
   - Clear it completely: `await tokenManager.clearSecureStore();`
   - Re-login

3. **Check logs:**
   - Look for "User ID mismatch" warnings
   - Verify token user ID matches userData user ID

### Still getting 401 errors?

1. **Verify token is valid:**
   - Check token expiration time
   - Verify token user ID matches database session user_id

2. **Check backend logs:**
   - Look for "No active session found" errors
   - Verify session exists in database for token's user ID

3. **Verify refresh token:**
   - Check that refresh token belongs to correct user
   - Verify refresh token is not expired

## Summary

All fixes are in place. The system now:

1. ✅ Extracts user ID from token (source of truth)
2. ✅ Verifies refresh token belongs to current user
3. ✅ Orders sessions by most recent usage
4. ✅ Updates userData after refresh
5. ✅ Clears stale data on errors
6. ✅ Validates user ID consistency

**Next Steps:**
1. Clear database sessions
2. Clear SecureStore
3. Re-login fresh
4. Test token refresh flow
5. Verify no user ID mismatches

