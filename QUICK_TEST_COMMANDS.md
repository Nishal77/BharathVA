# Quick Test Commands

## Run All Tests

### 1. Shell Script (Recommended - End-to-End)
```bash
./test-refresh-token-flow.sh
```

### 2. Frontend Tests (TypeScript)
```typescript
// In your React Native app
import { runRefreshTokenFlowTests } from './utils/refreshTokenFlowTests';
await runRefreshTokenFlowTests();

// Or use the component
import RefreshTokenTestSuite from './components/RefreshTokenTestSuite';
<RefreshTokenTestSuite />
```

### 3. Backend Tests (Java)
```bash
cd backend/auth-service
./mvnw test -Dtest=SessionControllerTest,SessionManagementServiceTest
```

### 4. Integrated Unit Tests
```typescript
import { runUnitTests } from './utils/unitTests';
await runUnitTests(); // Includes refresh token tests
```

## Quick Manual Tests

### Test Endpoint Availability
```bash
curl -X GET "http://192.168.0.121:8080/api/auth/sessions/current-refresh-token" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Token Refresh
```bash
curl -X POST "http://192.168.0.121:8080/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### Test Login (to get tokens)
```bash
curl -X POST "http://192.168.0.121:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

## Expected Results

✅ All tests should pass
✅ No 401 errors
✅ Refresh token fetched from database
✅ Token refresh works correctly
✅ Notification service works after refresh

