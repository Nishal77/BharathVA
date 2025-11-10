# User ID Mismatch Fix

## Problem

The app was experiencing 401 errors after token refresh due to user ID mismatch:

- **App logged in as:** `0f69449d-9d05-4c1d-a009-283a47921aca`
- **Refresh token belongs to:** `5205b642-a73e-40f5-b1dd-bf33ea5f20a2`
- **Result:** Backend returns token for `5205b642...`, but app tries to access resources for `0f69449d...` → 401

## Root Cause

1. **Stale SecureStore data:** UserData in SecureStore contained user ID from a previous login session
2. **Token extraction from wrong source:** Validation was using SecureStore userData instead of extracting from the actual access token
3. **No user ID validation:** No check to ensure refreshed token belongs to the same user

## Solution

### 1. Extract User ID from Token (Source of Truth)

Changed validation to extract user ID directly from the access token JWT, not from SecureStore userData:

```typescript
// Extract user ID from current access token before refresh
const currentAccessToken = await tokenManager.getAccessToken();
const parts = currentAccessToken.split('.');
const payload = JSON.parse(decodeJWT(parts[1]));
const expectedUserId = payload.userId || payload.sub;
```

### 2. User ID Validation After Refresh

Added validation to ensure refreshed token belongs to the same user:

```typescript
if (expectedUserId && newUserId && expectedUserId !== newUserId) {
  console.error('CRITICAL: User ID mismatch after token refresh!');
  await tokenManager.clearSecureStore();
  return false; // Force re-login
}
```

### 3. Complete SecureStore Cleanup

Added `clearSecureStore()` function to completely wipe all auth data:

```typescript
async clearSecureStore(): Promise<void> {
  const keys = [
    'accessToken',
    'refreshToken',
    'userData',
    'userId',
    'username',
    'email',
  ];
  
  for (const key of keys) {
    await SecureStore.deleteItemAsync(key);
  }
}
```

### 4. Update UserData After Refresh

Ensured userData is updated immediately after token refresh to match the new token:

```typescript
// After successful refresh
await tokenManager.saveUserData({
  userId: response.data.userId,
  email: response.data.email,
  username: response.data.username,
  fullName: response.data.fullName,
});
```

### 5. AuthContext Validation

Added user ID validation in AuthContext to detect mismatches early:

```typescript
const tokenUserId = await tokenManager.getUserIdFromToken();
if (tokenUserId && userData.userId && tokenUserId !== userData.userId) {
  // Clear everything and force re-login
  await tokenManager.clearSecureStore();
  setUser(null);
  return;
}
```

## Testing

### Manual Test Steps

1. **Clear SecureStore:**
   ```typescript
   import { tokenManager } from './services/api/authService';
   await tokenManager.clearSecureStore();
   ```

2. **Clear Database:**
   ```sql
   DELETE FROM user_sessions;
   ```

3. **Login Fresh:**
   - Login with valid credentials
   - Verify userData matches token's user ID
   - Check logs for "User data saved after login"

4. **Test Token Refresh:**
   - Wait for token expiry or trigger refresh
   - Verify userData is updated after refresh
   - Check logs for "User data updated after token refresh"
   - Verify no user ID mismatch errors

5. **Test API Calls:**
   - Make authenticated API calls after refresh
   - Should work without 401 errors

### Expected Behavior

✅ **Before Refresh:**
- Access token has user ID: `5205b642...`
- SecureStore userData has user ID: `5205b642...`
- Both match ✓

✅ **After Refresh:**
- New access token has user ID: `5205b642...`
- SecureStore userData updated to: `5205b642...`
- Both match ✓
- API calls work ✓

❌ **If Mismatch Detected:**
- Logs show: "CRITICAL: User ID mismatch after token refresh!"
- SecureStore cleared completely
- User forced to re-login
- Prevents security issues ✓

## Files Changed

1. `apps/mobile/services/api/authService.ts`
   - Added `clearSecureStore()` method
   - Added `getUserIdFromToken()` method
   - Updated `refreshAccessToken()` to extract user ID from token
   - Added user ID validation after refresh
   - Updated `logout()` to use `clearSecureStore()`
   - Updated `login()` to save userData immediately

2. `apps/mobile/contexts/AuthContext.tsx`
   - Added user ID validation in `checkAuthStatus()`
   - Updated to use `clearSecureStore()` on errors

## Next Steps

1. **Clear SecureStore on app start (temporarily):**
   ```typescript
   // In App.tsx or AuthProvider
   useEffect(() => {
     tokenManager.clearSecureStore(); // Remove after testing
   }, []);
   ```

2. **Clear Database:**
   ```sql
   DELETE FROM user_sessions;
   ```

3. **Login Fresh:**
   - Login with your credentials
   - Verify everything works

4. **Monitor Logs:**
   - Look for user ID mismatch warnings
   - Verify userData updates after refresh
   - Check that API calls succeed

## Prevention

Going forward, this fix ensures:

1. ✅ User ID is always extracted from the token (source of truth)
2. ✅ UserData is updated immediately after login and refresh
3. ✅ Mismatches are detected and handled gracefully
4. ✅ Complete cleanup on logout and errors
5. ✅ No stale data from previous sessions

