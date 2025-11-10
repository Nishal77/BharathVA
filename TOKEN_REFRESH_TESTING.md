# Token Refresh Testing Guide

This guide explains how to test the token refresh flow to verify that all fixes are working correctly.

## Test Scripts

### 1. Quick Test (`test-token-refresh-quick.sh`)
Fast validation script for quick checks during development.

**Usage:**
```bash
./test-token-refresh-quick.sh
```

**What it tests:**
- Login and token extraction
- Token refresh endpoint
- Verification that NEW refresh token is generated (not same as original)
- Old token invalidation
- New access token functionality

**Duration:** ~5-10 seconds

### 2. Comprehensive Test (`test-token-refresh-comprehensive.sh`)
Full test suite with detailed validation and error reporting.

**Usage:**
```bash
./test-token-refresh-comprehensive.sh
```

**What it tests:**
- Backend service health checks
- Login and token extraction
- Database refresh token retrieval
- Token refresh with new token generation
- Database update verification
- API calls with new tokens
- Security checks (old token rejection)
- Logout functionality

**Duration:** ~15-30 seconds

### 3. Original Test (`test-refresh-token-flow.sh`)
Original test script (may need updates for new features).

## Prerequisites

1. **Backend Services Running:**
   - Gateway service on port 8080
   - Auth service registered with Eureka
   - Database connection configured

2. **Test Credentials:**
   Set environment variables or update script defaults:
   ```bash
   export TEST_EMAIL="your-test@email.com"
   export TEST_PASSWORD="your-password"
   ```

3. **Network Access:**
   - Scripts auto-detect IP address
   - Default: `192.168.0.121`
   - Update `CURRENT_IP` in script if needed

## Running Tests

### Quick Test (Recommended for Development)
```bash
cd /path/to/BharathVA
./test-token-refresh-quick.sh
```

### Comprehensive Test (Recommended for CI/CD)
```bash
cd /path/to/BharathVA
./test-token-refresh-comprehensive.sh
```

### With Custom Credentials
```bash
TEST_EMAIL="user@example.com" TEST_PASSWORD="password123" ./test-token-refresh-quick.sh
```

## Expected Results

### ✅ Success Criteria

1. **Login:**
   - Returns access token and refresh token
   - Tokens are valid JWT format

2. **Token Refresh:**
   - Returns NEW access token (different from original)
   - Returns NEW refresh token (different from original) ⚠️ **CRITICAL**
   - User ID matches original

3. **Database Update:**
   - Database refresh token matches new refresh token
   - Old refresh token is invalidated

4. **API Calls:**
   - New access token works for authenticated endpoints
   - Returns correct user data

5. **Security:**
   - Old refresh token is rejected
   - Logout invalidates tokens

### ❌ Failure Indicators

1. **New refresh token is identical to original:**
   ```
   ❌ CRITICAL: New refresh token is identical to original!
   ```
   **Fix:** Backend refresh endpoint not generating new refresh token

2. **Database token mismatch:**
   ```
   ❌ Database refresh token does not match new refresh token
   ```
   **Fix:** Backend not updating session in database

3. **401 Unauthorized after refresh:**
   ```
   ❌ API call failed with 401 Unauthorized
   ```
   **Fix:** Token not saved correctly or user ID mismatch

## Troubleshooting

### Backend Not Responding
```bash
# Check if services are running
curl http://192.168.0.121:8080/api/auth/register/health

# Check gateway
curl http://192.168.0.121:8080/health
```

### Database Connection Issues
- Verify NeonDB connection string in `application.yml`
- Check database credentials
- Ensure `user_sessions` table exists

### Token Refresh Not Generating New Tokens
1. **Check backend logs:**
   ```bash
   # Look for refresh endpoint logs
   tail -f logs/auth-service.log | grep refresh
   ```

2. **Verify backend code:**
   - `AuthenticationService.refreshToken()` should generate new refresh token
   - Session should be updated with `setRefreshToken()`

3. **Check database:**
   ```sql
   SELECT refresh_token, last_used_at, expires_at 
   FROM user_sessions 
   WHERE user_id = 'your-user-id';
   ```

### Frontend Token Not Updating
1. **Check SecureStore:**
   - Verify tokens are saved after refresh
   - Check that old tokens are deleted

2. **Check logs:**
   - Look for token save verification logs
   - Check for any errors during token refresh

## Manual Testing Steps

If automated tests pass but mobile app has issues:

1. **Clear Database:**
   ```sql
   DELETE FROM user_sessions;
   ```

2. **Login via Mobile App:**
   - Verify tokens are saved to SecureStore
   - Check database has one session row

3. **Trigger Token Refresh:**
   - Wait for token expiry OR
   - Make API call that returns 401
   - Verify refresh is triggered automatically

4. **Verify SecureStore:**
   - Check that new access token is saved
   - Check that new refresh token is saved
   - Verify old tokens are deleted

5. **Verify Database:**
   ```sql
   SELECT refresh_token, last_used_at 
   FROM user_sessions 
   ORDER BY last_used_at DESC 
   LIMIT 1;
   ```
   - Should show new refresh token
   - `last_used_at` should be recent

## Integration with CI/CD

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Test Token Refresh Flow
  run: |
    chmod +x test-token-refresh-comprehensive.sh
    TEST_EMAIL=${{ secrets.TEST_EMAIL }} \
    TEST_PASSWORD=${{ secrets.TEST_PASSWORD }} \
    ./test-token-refresh-comprehensive.sh
```

## Key Fixes Verified

These tests verify the following fixes:

1. ✅ **Backend generates NEW refresh token** (not same as original)
2. ✅ **Backend updates session in database** with new refresh token
3. ✅ **Frontend saves new refresh token** to SecureStore
4. ✅ **Frontend deletes old tokens** before saving new ones
5. ✅ **Login clears old sessions** before creating new one
6. ✅ **Logout clears refresh token** from SecureStore

## Next Steps

After tests pass:

1. Test mobile app token refresh flow
2. Test multi-device scenarios
3. Test token refresh during app background/foreground
4. Test network interruption scenarios
5. Load test with multiple concurrent refreshes

