# JWT Token Refresh Fix - Deep Analysis

## Problem
After token refresh, the retry request still gets 401 Unauthorized, even though:
1. Token refresh succeeds (200 response)
2. New token is verified and saved
3. Retry uses the verified new token

## Root Causes Identified

### 1. Backend JWT Validation Mismatch
- **Issue**: Feed-service was using `NimbusJwtDecoder` with `SecretKeySpec`, while auth-service uses `Keys.hmacShaKeyFor()`
- **Fix**: Created `CustomJwtDecoder` that uses the same JWT parsing method as auth-service
- **Status**: ✅ Fixed

### 2. Token Comparison Issue
- **Issue**: Frontend logs show token prefixes match, suggesting tokens might be identical
- **Fix**: Added detailed token comparison logging to verify tokens are actually different
- **Status**: ✅ Enhanced logging added

### 3. Token Field Selection
- **Issue**: API response has both `accessToken` and `token` fields - need to ensure correct one is used
- **Fix**: Added fallback logic: `response.data?.accessToken || response.data?.token`
- **Status**: ✅ Fixed

## Changes Made

### Backend (`backend/feed-service`)

1. **`CustomJwtDecoder.java`** (NEW)
   - Custom JWT decoder matching auth-service validation logic
   - Uses `Keys.hmacShaKeyFor()` for consistent key generation
   - Uses `Jwts.parser().setSigningKey().parseClaimsJws()` (same as auth-service)
   - Enhanced INFO-level logging for debugging
   - 60-second clock skew tolerance

2. **`SecurityConfig.java`**
   - Replaced `NimbusJwtDecoder` with `CustomJwtDecoder`
   - Removed unused imports

### Frontend (`apps/mobile/services/api`)

1. **`authService.ts`**
   - Enhanced token refresh logging
   - Added token comparison (old vs new)
   - Fallback to `token` field if `accessToken` is missing
   - Detailed logging of token differences

2. **`notificationService.ts`**
   - Enhanced token comparison logging
   - Logs full token details (prefix, length, last 10 chars)
   - Verifies tokens are actually different before retry

## Testing Steps

1. **Restart Backend Services**
   ```bash
   # Feed-service needs restart to use CustomJwtDecoder
   cd backend/feed-service
   mvn spring-boot:run
   ```

2. **Monitor Backend Logs**
   - Look for `[CustomJwtDecoder]` log messages
   - Should see: `🔐 Attempting to decode JWT token`
   - Should see: `✅ JWT decoded successfully` or `❌ JWT validation failed`

3. **Monitor Frontend Logs**
   - Look for `[AuthService] Token refresh response received`
   - Verify `tokensAreDifferent: true`
   - Verify token prefixes and lengths are different

4. **Test Token Refresh Flow**
   - Wait for token to expire (or manually trigger refresh)
   - Check logs for token comparison
   - Verify retry succeeds with new token

## Expected Behavior

### Successful Flow
1. Token expires → 401 error
2. Frontend calls `/api/auth/refresh`
3. Backend returns new `accessToken`
4. Frontend saves new token to SecureStore
5. Frontend verifies token is different from old token
6. Frontend retries original request with new token
7. Backend `CustomJwtDecoder` validates new token
8. Request succeeds ✅

### Backend Logs (Success)
```
INFO  CustomJwtDecoder initialized with secret key length: 64
INFO  🔐 [CustomJwtDecoder] Attempting to decode JWT token (prefix: eyJhbGciOiJIUzI1NiJ9...)
INFO  ✅ [CustomJwtDecoder] JWT decoded successfully - userId: ..., email: ...
```

### Backend Logs (Failure)
```
ERROR ❌ [CustomJwtDecoder] JWT signature validation failed - message: ...
ERROR ❌ [CustomJwtDecoder] JWT token expired - exp: ..., now: ...
```

## Next Steps

1. **Restart feed-service** to load `CustomJwtDecoder`
2. **Test token refresh** and monitor both frontend and backend logs
3. **Verify** that backend logs show successful JWT decoding
4. **If still failing**, check:
   - JWT secret is same in both services
   - Backend is actually using `CustomJwtDecoder` (check startup logs)
   - Token is actually different (check frontend logs)

## Critical Notes

- **Backend must be restarted** for `CustomJwtDecoder` to take effect
- **JWT secret must match** between auth-service and feed-service
- **Token comparison** in frontend logs will show if tokens are actually different
- **Backend logs** will show exact validation failure reason


