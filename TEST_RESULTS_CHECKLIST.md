# Refresh Token Flow Test Checklist

## Pre-Test Setup

- [ ] Backend auth-service is running
- [ ] Backend has been restarted after adding new endpoint
- [ ] Database (NeonDB) is accessible
- [ ] User is logged in (for full flow tests)
- [ ] Mobile app is connected to backend

## Test Execution

### 1. Backend Endpoint Test
```bash
./test-refresh-token-flow.sh
```

**Expected Results:**
- [ ] Auth service health check passes
- [ ] Gateway service is accessible
- [ ] Login endpoint works
- [ ] Refresh token endpoint returns 200 (not 404)
- [ ] Refresh token is fetched from database
- [ ] Token refresh endpoint works
- [ ] New access token is generated

### 2. Frontend Unit Tests
Run in mobile app or via:
```typescript
import { runRefreshTokenFlowTests } from './utils/refreshTokenFlowTests';
await runRefreshTokenFlowTests();
```

**Expected Results:**
- [ ] Access token retrieval works
- [ ] Refresh token fetched from database
- [ ] Fallback to SecureStore works
- [ ] Token refresh flow completes
- [ ] Database endpoint is accessible
- [ ] Token save/retrieve works
- [ ] Token refresh after expiry works

### 3. Backend Unit Tests
```bash
cd backend/auth-service
./mvnw test -Dtest=SessionControllerTest
./mvnw test -Dtest=SessionManagementServiceTest
```

**Expected Results:**
- [ ] All controller tests pass
- [ ] All service tests pass
- [ ] Mock database calls work correctly

### 4. Integration Test
Test the complete flow manually:

1. **Login**
   - [ ] Login with valid credentials
   - [ ] Access token received
   - [ ] Refresh token received
   - [ ] Tokens saved to SecureStore

2. **Fetch Refresh Token from Database**
   - [ ] Call `/auth/sessions/current-refresh-token`
   - [ ] Returns refresh token from database
   - [ ] Token matches login refresh token

3. **Token Refresh**
   - [ ] Use database refresh token to refresh access token
   - [ ] New access token received
   - [ ] New access token is different from old
   - [ ] Refresh token remains the same

4. **Notification Service**
   - [ ] Mark notifications as read works
   - [ ] No 401 errors after token refresh
   - [ ] Retry after refresh works correctly

## Database Verification

### Check user_sessions Table
```sql
SELECT 
    id,
    user_id,
    refresh_token,
    expires_at,
    created_at,
    last_used_at
FROM user_sessions
WHERE expires_at > NOW()
ORDER BY created_at DESC;
```

**Expected:**
- [ ] Active sessions exist for logged-in user
- [ ] Refresh tokens are stored correctly
- [ ] Expires_at is in the future
- [ ] Last_used_at updates on refresh

### Verify Refresh Token Match
```sql
-- Get refresh token for specific user
SELECT refresh_token
FROM user_sessions
WHERE user_id = 'YOUR_USER_ID'
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- [ ] Refresh token exists
- [ ] Matches token used in frontend
- [ ] Token is valid (not expired)

## Success Criteria

### ✅ All Tests Pass
- [ ] Backend endpoint test: All passed
- [ ] Frontend unit tests: All passed
- [ ] Backend unit tests: All passed
- [ ] Integration test: All steps pass
- [ ] Database verification: All checks pass

### ✅ Functionality Works
- [ ] Refresh token fetched from database
- [ ] Token refresh works with database token
- [ ] Notification service works after refresh
- [ ] No 401 errors
- [ ] Multi-device support works

### ✅ Error Handling
- [ ] Fallback to SecureStore works
- [ ] Error messages are clear
- [ ] Logging provides useful information
- [ ] Graceful degradation works

## Troubleshooting

### If Backend Tests Fail
1. Restart auth-service
2. Check Spring Boot logs
3. Verify endpoint path matches
4. Check security configuration

### If Frontend Tests Fail
1. Verify user is logged in
2. Check network connectivity
3. Verify API endpoint URL
4. Check token format

### If Database Tests Fail
1. Verify database connection
2. Check user_sessions table exists
3. Verify user has active session
4. Check session hasn't expired

## Test Report Template

```
Refresh Token Flow Test Report
==============================

Date: [DATE]
Tester: [NAME]

Backend Tests:
- Endpoint Availability: [PASS/FAIL]
- Database Integration: [PASS/FAIL]
- Token Refresh: [PASS/FAIL]

Frontend Tests:
- Token Retrieval: [PASS/FAIL]
- Database Fetch: [PASS/FAIL]
- Fallback Mechanism: [PASS/FAIL]
- Refresh Flow: [PASS/FAIL]

Integration Tests:
- Complete Flow: [PASS/FAIL]
- Notification Service: [PASS/FAIL]
- Multi-device: [PASS/FAIL]

Database Verification:
- Active Sessions: [PASS/FAIL]
- Token Match: [PASS/FAIL]

Overall Status: [PASS/FAIL]
Notes: [ANY ISSUES OR OBSERVATIONS]
```

