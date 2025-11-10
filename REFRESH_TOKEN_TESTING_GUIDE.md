# Refresh Token Flow Testing Guide

## Overview
This guide explains how to test the refresh token flow to ensure everything works correctly with NeonDB and the frontend.

## Test Suite Components

### 1. Frontend Tests (`apps/mobile/utils/refreshTokenFlowTests.ts`)
Comprehensive TypeScript test suite that tests:
- Access token retrieval
- Refresh token fetch from database
- Fallback to SecureStore
- Complete token refresh flow
- Database endpoint availability
- Token save/retrieve operations
- Token refresh after expiry simulation

### 2. Backend Unit Tests
- `SessionControllerTest.java` - Tests the REST endpoint
- `SessionManagementServiceTest.java` - Tests the service layer

### 3. Shell Script Test (`test-refresh-token-flow.sh`)
End-to-end integration test that:
- Tests backend services
- Tests login flow
- Tests refresh token endpoint
- Tests token refresh endpoint
- Verifies database integration

### 4. React Native Test Component (`RefreshTokenTestSuite.tsx`)
UI component for running tests in the mobile app

## Running Tests

### Option 1: Frontend Tests (TypeScript)

```typescript
import { runRefreshTokenFlowTests } from './utils/refreshTokenFlowTests';

// Run all tests
const results = await runRefreshTokenFlowTests();
```

Or use the React component:
```tsx
import RefreshTokenTestSuite from './components/RefreshTokenTestSuite';

// In your screen
<RefreshTokenTestSuite />
```

### Option 2: Backend Unit Tests (Java)

```bash
cd backend/auth-service
./mvnw test -Dtest=SessionControllerTest
./mvnw test -Dtest=SessionManagementServiceTest
```

### Option 3: Shell Script (End-to-End)

```bash
./test-refresh-token-flow.sh
```

## Test Flow Verification

### Step 1: Verify Backend Endpoint
```bash
# Test endpoint availability (should return 401 without token, not 404)
curl -X GET "http://192.168.0.121:8080/api/auth/sessions/current-refresh-token" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Current refresh token retrieved successfully",
  "data": {
    "refreshToken": "your-refresh-token-from-database"
  },
  "timestamp": "2025-01-10T10:00:00"
}
```

### Step 2: Verify Database Connection
The endpoint queries the `user_sessions` table:
```sql
SELECT refresh_token 
FROM user_sessions 
WHERE user_id = ? 
  AND expires_at > NOW() 
ORDER BY created_at DESC 
LIMIT 1;
```

### Step 3: Test Complete Flow

1. **Login** - Get access token and refresh token
2. **Fetch Refresh Token from DB** - Call `/auth/sessions/current-refresh-token`
3. **Verify Token Match** - Ensure DB token matches login token
4. **Refresh Access Token** - Use DB refresh token to get new access token
5. **Verify New Token** - Ensure new access token is different

## Expected Test Results

### ✅ All Tests Pass
```
🔄 Refresh Token Flow Test Suite
================================

1️⃣ Testing Access Token Retrieval...
   ✅ Access token retrieved successfully

2️⃣ Testing Refresh Token Fetch from Database...
   ✅ Refresh token fetched from database successfully

3️⃣ Testing Refresh Token Fallback to SecureStore...
   ✅ Refresh token retrieved successfully

4️⃣ Testing Complete Token Refresh Flow...
   ✅ Token refresh completed successfully

5️⃣ Testing Database Endpoint Availability...
   ✅ Database endpoint is working correctly

6️⃣ Testing Token Save and Retrieve...
   ✅ Token save/retrieve/clear operations work correctly

7️⃣ Testing Token Refresh After Expiry Simulation...
   ✅ Token refresh capability verified

================================
📊 Test Summary
================================
✅ Passed: 7
❌ Failed: 0
```

## Troubleshooting

### Issue: "No static resource" Error
**Solution**: Restart backend auth-service
```bash
cd backend/auth-service
./mvnw spring-boot:run
```

### Issue: 404 Not Found
**Solution**: 
1. Verify endpoint path: `/auth/sessions/current-refresh-token`
2. Check gateway routing: `/api/auth/**` → `/auth/**`
3. Ensure controller is scanned by Spring

### Issue: 401 Unauthorized
**Solution**:
1. Verify access token is valid
2. Check token hasn't expired
3. Ensure Authorization header format: `Bearer <token>`

### Issue: Database Returns No Session
**Solution**:
1. Verify user is logged in
2. Check `user_sessions` table has active session
3. Ensure session hasn't expired

## Database Verification

### Check Active Sessions
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

### Verify Refresh Token
```sql
SELECT refresh_token
FROM user_sessions
WHERE user_id = 'YOUR_USER_ID'
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;
```

## Integration with Existing Tests

The refresh token tests integrate with existing test infrastructure:
- Uses same test result format as `unitTests.ts`
- Can be run alongside `networkTest.ts`
- Compatible with `TestSuite.tsx` component

## Next Steps

1. Run shell script: `./test-refresh-token-flow.sh`
2. Run frontend tests in mobile app
3. Verify database has active sessions
4. Test token refresh flow end-to-end
5. Monitor logs for any errors

## Success Criteria

✅ Backend endpoint returns refresh token from database
✅ Frontend successfully fetches refresh token from database
✅ Token refresh works with database-fetched token
✅ Fallback to SecureStore works if database fetch fails
✅ All tests pass
✅ No 401 errors after token refresh
✅ Notification service works correctly

