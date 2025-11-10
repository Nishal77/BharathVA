# Refresh Token Database Integration Fix

## Overview
Fixed the authentication issue where refresh tokens were cached locally in SecureStore, causing 401 errors when the cached token became stale. The solution ensures refresh tokens are always fetched from the `user_sessions` table in NeonDB in real-time.

## Problem
- Refresh tokens were stored in SecureStore and cached locally
- When refresh token was updated in database (e.g., after login from another device), the cached token became stale
- Token refresh attempts failed with 401 errors because backend validated against database, not cached token
- Notification service was getting 401 errors after token refresh

## Solution

### Backend Changes

1. **New Endpoint: GET `/auth/sessions/current-refresh-token`**
   - Fetches the current session's refresh token from `user_sessions` table
   - Requires valid access token in Authorization header
   - Returns the latest refresh token for the authenticated user

2. **SessionManagementService.getCurrentSessionRefreshToken()**
   - New method to retrieve refresh token from database
   - Gets the most recent active session for the user
   - Returns the refresh token from that session

### Mobile App Changes

1. **authService.refreshAccessToken()**
   - Now always fetches refresh token from database before refresh attempt
   - Removed dependency on cached refresh token
   - Uses `/auth/sessions/current-refresh-token` endpoint

2. **tokenManager.getRefreshToken()**
   - Updated to fetch from database first
   - Falls back to SecureStore only if database fetch fails (backward compatibility)

3. **tokenManager.saveTokens()**
   - Only saves access token to SecureStore
   - Refresh token is no longer cached locally
   - Refresh token is always fetched from database when needed

4. **tokenManager.clearTokens()**
   - Removed refresh token deletion (it's not stored locally anymore)

5. **notificationService Simplification**
   - Removed complex token verification logic
   - Simplified retry logic since authService handles everything
   - Relies on authService.refreshAccessToken() which fetches from database

## Benefits

1. **Real-time Token Sync**: Always uses the latest refresh token from database
2. **Multi-device Support**: Works correctly when user logs in from multiple devices
3. **Reduced Complexity**: Simplified notification service retry logic
4. **Better Security**: Refresh token is not stored locally, reducing attack surface
5. **Database as Source of Truth**: Single source of truth for refresh tokens

## Testing

### Manual Testing
1. Login from device A
2. Login from device B (this updates refresh token in database)
3. Try to refresh token on device A - should work correctly
4. Mark notifications as read - should work without 401 errors

### Unit Tests Needed
- Test refresh token fetch from database
- Test fallback to SecureStore if database fetch fails
- Test token refresh flow with database-fetched token
- Test notification service retry after token refresh

## Migration Notes

- Existing refresh tokens in SecureStore will be ignored
- On next token refresh, system will fetch from database
- No data migration needed - database is already the source of truth

## Files Changed

### Backend
- `backend/auth-service/src/main/java/com/bharathva/auth/service/SessionManagementService.java`
- `backend/auth-service/src/main/java/com/bharathva/auth/controller/SessionController.java`

### Mobile App
- `apps/mobile/services/api/authService.ts`
- `apps/mobile/services/api/notificationService.ts`
- `apps/mobile/services/api/config.ts`

