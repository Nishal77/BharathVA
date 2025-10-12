# Device Tracking Test Guide

## Quick Start Testing

This guide shows you how to test the new device tracking and session management features.

## Prerequisites

1. Docker running
2. Backend services started
3. Mobile app connected to backend

## Step-by-Step Testing

### 1. Start Backend Services

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend

# Stop any running containers
docker-compose down

# Start fresh with new migration
docker-compose up --build
```

Wait for all services to start. You should see:
```
✅ discovery-service started
✅ gateway-service started  
✅ auth-service started
```

### 2. Verify Migration

Check the logs to confirm V5 migration ran:
```bash
docker-compose logs auth-service | grep "V5__clean_recreate"
```

Should show: "Migration V5 completed successfully"

### 3. Register a New User

```bash
# Variable for testing
EMAIL="devicetest@example.com"
PASSWORD="TestPass123!"

# Step 1: Register email
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}"

# Save the sessionToken from response
SESSION_TOKEN="<paste_session_token_here>"

# Check email for OTP, then:
OTP="<paste_otp_here>"

# Step 2: Verify OTP
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"otp\":\"$OTP\"}"

# Step 3: Submit details
curl -X POST http://localhost:8080/api/auth/register/details \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"full_name\":\"Device Test User\",
    \"phoneNumber\":\"9876543210\",
    \"countryCode\":\"+91\",
    \"dateOfBirth\":\"1995-01-01\"
  }"

# Step 4: Create password
curl -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"password\":\"$PASSWORD\",
    \"confirmPassword\":\"$PASSWORD\"
  }"

# Step 5: Create username
curl -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"username\":\"devicetester\"
  }"
```

### 4. Test Multi-Device Login

#### Login from Device 1 (Android Phone)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Google Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d "{
    \"email\":\"$EMAIL\",
    \"password\":\"$PASSWORD\"
  }"
```

Save the `accessToken` from response:
```bash
ACCESS_TOKEN_1="<paste_access_token_here>"
```

#### Login from Device 2 (MacBook)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: macOS 15 | Chrome 120" \
  -H "X-IP-Address: 13.250.22.45" \
  -d "{
    \"email\":\"$EMAIL\",
    \"password\":\"$PASSWORD\"
  }"
```

Save the `accessToken`:
```bash
ACCESS_TOKEN_2="<paste_access_token_here>"
```

#### Login from Device 3 (iPhone)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: iOS 17.2 | iPhone 15 Pro" \
  -H "X-IP-Address: 52.77.88.99" \
  -d "{
    \"email\":\"$EMAIL\",
    \"password\":\"$PASSWORD\"
  }"
```

Save the `accessToken`:
```bash
ACCESS_TOKEN_3="<paste_access_token_here>"
```

### 5. View Active Sessions

From any device (using any access token):
```bash
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer $ACCESS_TOKEN_1"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Active sessions retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "deviceInfo": "Android 14 | Google Pixel 8 Pro",
      "ipAddress": "49.207.153.17",
      "lastUsedAt": "2024-01-15T10:30:00",
      "createdAt": "2024-01-15T10:25:00",
      "expiresAt": "2024-01-22T10:25:00",
      "isCurrentSession": true
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "deviceInfo": "macOS 15 | Chrome 120",
      "ipAddress": "13.250.22.45",
      "lastUsedAt": "2024-01-15T10:31:00",
      "createdAt": "2024-01-15T10:31:00",
      "expiresAt": "2024-01-22T10:31:00",
      "isCurrentSession": false
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "deviceInfo": "iOS 17.2 | iPhone 15 Pro",
      "ipAddress": "52.77.88.99",
      "lastUsedAt": "2024-01-15T10:32:00",
      "createdAt": "2024-01-15T10:32:00",
      "expiresAt": "2024-01-22T10:32:00",
      "isCurrentSession": false
    }
  ]
}
```

### 6. Test Logout Specific Device

```bash
# Get the session ID from previous response (Device 2 - macOS)
SESSION_ID_2="660e8400-e29b-41d4-a716-446655440001"

# Logout Device 2
curl -X POST http://localhost:8080/api/auth/sessions/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN_1" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID_2\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session logged out successfully",
  "data": {
    "message": "Session terminated"
  }
}
```

Now if you try to use `ACCESS_TOKEN_2` or refresh token from Device 2:
```bash
# This should fail with 401
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"<device_2_refresh_token>\"}"
```

### 7. Test Logout All Other Devices

```bash
# From Device 1, logout all others
curl -X POST http://localhost:8080/api/auth/sessions/logout-all-other \
  -H "Authorization: Bearer $ACCESS_TOKEN_1"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "All other sessions logged out successfully",
  "data": {
    "message": "1 sessions terminated"
  }
}
```

### 8. Verify in Database

```bash
# Connect to Neon database
psql 'postgresql://neondb_owner:<password>@<host>/neondb?sslmode=require'

# View all users
SELECT id, username, email, created_at FROM users;

# View all sessions
SELECT 
    s.id,
    u.username,
    s.device_info,
    s.ip_address,
    s.created_at,
    s.last_used_at,
    s.expires_at
FROM user_sessions s
JOIN users u ON s.user_id = u.id
ORDER BY s.last_used_at DESC;

# Verify FK relationship
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_sessions';
```

Expected output:
```
table_name    | column_name | foreign_table_name | foreign_column_name
--------------+-------------+--------------------+--------------------
user_sessions | user_id     | users              | id
```

### 9. Test CASCADE DELETE

```bash
# Delete a user (should auto-delete their sessions)
DELETE FROM users WHERE email = 'devicetest@example.com';

# Verify sessions are gone
SELECT COUNT(*) FROM user_sessions 
WHERE user_id = '<deleted_user_id>';
-- Should return 0
```

## Mobile App Testing

### 1. Install Updated App

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/apps/mobile

# Install new dependencies
pnpm install

# Start app
pnpm start
```

### 2. Test Login Flow

1. Register a new account
2. Complete all steps
3. Login from mobile app
4. Device info should be automatically collected and sent

### 3. View Active Devices

Navigate to:
```
Profile → Settings → Active Devices
```

You should see:
- Current device (highlighted with "This Device" badge)
- Device info (e.g., "Android 14 | Google Pixel 8 Pro")
- IP address
- Last active time

### 4. Test Logout

1. Open Active Devices screen
2. Tap "Logout Device" on any other device
3. Confirm logout
4. Device should disappear from list

### 5. Test Logout All

1. Login from multiple devices
2. Tap "Logout All Other Devices"
3. Confirm
4. Only current device should remain

## Expected Results

### Backend Logs (During Login)

```
===========================================
LOGIN REQUEST RECEIVED
Email: devicetest@example.com
IP Address: 49.207.153.17
Device Info: Android 14 | Google Pixel 8 Pro
User Agent: okhttp/4.11.0
===========================================

...

💾 SESSION SAVED TO DATABASE:
Session ID: 550e8400-e29b-41d4-a716-446655440000
User ID: 770e8400-e29b-41d4-a716-446655440003
Refresh Token: <token>
Expires At: 2024-01-22T10:25:00
Created At: 2024-01-15T10:25:00
IP Address: 49.207.153.17
Device Info: Android 14 | Google Pixel 8 Pro
-------------------------------------------
📊 Total active sessions: 1
===========================================
```

### Database Records

```sql
-- After 3 device logins
SELECT 
    device_info,
    ip_address,
    created_at
FROM user_sessions
WHERE user_id = '<user_id>'
ORDER BY created_at DESC;
```

Expected:
```
device_info                     | ip_address      | created_at
--------------------------------+-----------------+-------------------------
iOS 17.2 | iPhone 15 Pro        | 52.77.88.99     | 2024-01-15 10:32:00
macOS 15 | Chrome 120            | 13.250.22.45    | 2024-01-15 10:31:00
Android 14 | Google Pixel 8 Pro  | 49.207.153.17   | 2024-01-15 10:25:00
```

## Common Issues

### Issue: Device Info Not Captured

**Symptom**: device_info shows "Unknown Device"

**Solution**:
```typescript
// Check frontend logs
console.log('[DeviceInfo]', await deviceInfoService.getDeviceInfo());

// Ensure expo-device is installed
pnpm add expo-device
```

### Issue: IP Address Shows "Unknown"

**Symptom**: ip_address is null or "Unknown"

**Solution**:
```bash
# Check if ipify API is accessible
curl https://api.ipify.org?format=json

# If blocked, use alternative
# Update deviceInfoService.ts to use: https://api64.ipify.org?format=json
```

### Issue: Sessions Not Syncing

**Symptom**: Sessions not appearing in database

**Solution**:
```bash
# Check backend logs
docker-compose logs auth-service | grep "SESSION SAVED"

# Verify table exists
psql <connection> -c "\d user_sessions"

# Check FK constraint
psql <connection> -c "\d user_sessions" | grep FOREIGN
```

### Issue: Current Device Not Highlighted

**Symptom**: All devices show as "not current"

**Solution**:
- Backend compares refresh tokens to identify current session
- Ensure frontend is sending correct refresh token
- Check SessionManagementService logic

## Performance Verification

### Check Index Usage

```sql
-- Verify indexes exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'user_sessions';
```

Expected indexes:
- idx_user_sessions_user_id
- idx_user_sessions_refresh_token
- idx_user_sessions_expires_at
- idx_user_sessions_last_used_at
- idx_user_sessions_ip_address
- idx_user_sessions_user_active

### Monitor Query Performance

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM user_sessions 
WHERE user_id = '<uuid>' 
AND expires_at > NOW()
ORDER BY last_used_at DESC;
```

Should use index scan on `idx_user_sessions_user_active`.

## Security Testing

### Test Unauthorized Access

```bash
# Try to access sessions without token
curl -X GET http://localhost:8080/api/auth/sessions

# Expected: 401 Unauthorized
```

### Test Cross-User Access

```bash
# User A tries to logout User B's session
curl -X POST http://localhost:8080/api/auth/sessions/logout \
  -H "Authorization: Bearer <user_a_token>" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"<user_b_session_id>\"}"

# Expected: Error "Unauthorized to logout this session"
```

### Test Token Expiry

```bash
# Wait for refresh token to expire (or manually update expires_at)
UPDATE user_sessions 
SET expires_at = NOW() - INTERVAL '1 hour' 
WHERE id = '<session_id>';

# Try to use expired session
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"<expired_token>\"}"

# Expected: "Invalid or expired refresh token"
```

## Success Checklist

- [ ] V5 migration completed successfully
- [ ] Users table created with UUID primary key
- [ ] User sessions table created with FK to users
- [ ] Can register new user
- [ ] Can login from multiple devices
- [ ] Device info captured (not "Unknown")
- [ ] IP address captured (not "Unknown")
- [ ] Sessions appear in GET /auth/sessions
- [ ] Current device is highlighted (isCurrentSession: true)
- [ ] Can logout specific device
- [ ] Target device actually gets logged out
- [ ] Can logout all other devices
- [ ] Only current device remains after logout all
- [ ] CASCADE DELETE works (delete user → sessions deleted)
- [ ] Mobile app Active Devices screen works
- [ ] UI shows device info, IP, last active
- [ ] Logout buttons work in UI

## Sample Test Script

```bash
#!/bin/bash

# Complete test script
EMAIL="test$(date +%s)@example.com"
PASSWORD="TestPass123!"

echo "Testing BharathVA Device Tracking..."
echo "===================================="
echo ""

# 1. Register email
echo "1. Registering email: $EMAIL"
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}")

SESSION_TOKEN=$(echo $RESPONSE | jq -r '.data.sessionToken')
echo "   Session Token: $SESSION_TOKEN"
echo ""

# Wait for manual OTP entry
echo "2. Check email for OTP and enter it:"
read -p "   OTP: " OTP

# 3. Verify OTP
echo "3. Verifying OTP..."
curl -s -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"otp\":\"$OTP\"}" | jq
echo ""

# 4. Submit details
echo "4. Submitting user details..."
curl -s -X POST http://localhost:8080/api/auth/register/details \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"full_name\":\"Test User\",
    \"phoneNumber\":\"9876543210\",
    \"countryCode\":\"+91\",
    \"dateOfBirth\":\"1995-01-01\"
  }" | jq
echo ""

# 5. Create password
echo "5. Creating password..."
curl -s -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"password\":\"$PASSWORD\",
    \"confirmPassword\":\"$PASSWORD\"
  }" | jq
echo ""

# 6. Create username
USERNAME="tester$(date +%s)"
echo "6. Creating username: $USERNAME"
curl -s -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"username\":\"$USERNAME\"
  }" | jq
echo ""

# 7. Login from multiple devices
echo "7. Logging in from 3 devices..."

echo "   Device 1: Android Phone"
LOGIN1=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN1=$(echo $LOGIN1 | jq -r '.data.accessToken')
echo "   ✓ Logged in"

sleep 1

echo "   Device 2: MacBook"
LOGIN2=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: macOS 15 | Chrome" \
  -H "X-IP-Address: 13.250.22.45" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN2=$(echo $LOGIN2 | jq -r '.data.accessToken')
echo "   ✓ Logged in"

sleep 1

echo "   Device 3: iPhone"
LOGIN3=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: iOS 17.2 | iPhone 15 Pro" \
  -H "X-IP-Address: 52.77.88.99" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN3=$(echo $LOGIN3 | jq -r '.data.accessToken')
echo "   ✓ Logged in"
echo ""

# 8. View active sessions
echo "8. Viewing active sessions..."
SESSIONS=$(curl -s -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer $TOKEN1")

echo "$SESSIONS" | jq
echo ""

SESSION_COUNT=$(echo $SESSIONS | jq '.data | length')
echo "   Total active sessions: $SESSION_COUNT"
echo ""

# 9. Logout device 2
SESSION_ID_2=$(echo $SESSIONS | jq -r '.data[1].id')
echo "9. Logging out Device 2 (Session ID: $SESSION_ID_2)..."
curl -s -X POST http://localhost:8080/api/auth/sessions/logout \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID_2\"}" | jq
echo ""

# 10. Verify only 2 sessions remain
echo "10. Verifying sessions after logout..."
curl -s -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer $TOKEN1" | jq
echo ""

echo "===================================="
echo "✅ Device Tracking Test Complete!"
echo "===================================="
```

## Production Checklist

Before deploying to production:

- [ ] Migration tested on staging database
- [ ] All indexes created
- [ ] FK constraints verified
- [ ] Session cleanup job scheduled
- [ ] Rate limiting on login endpoint
- [ ] Email alerts on new device login
- [ ] Max session limit enforced (e.g., 10 devices)
- [ ] HTTPS enforced for all requests
- [ ] IP geolocation added (optional)
- [ ] Device fingerprinting implemented (optional)
- [ ] Monitoring and alerts configured
- [ ] Backup strategy for user_sessions table

---

**BharathVA - Production-Grade Session Management**

Multi-device tracking with enterprise-level security and user control.

