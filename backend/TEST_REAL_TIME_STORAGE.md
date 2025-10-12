# Real-Time Database Storage Test Guide

## Prerequisites

1. Docker installed and running
2. All services stopped: `docker-compose down`
3. Fresh database (migrations will run on startup)

## Step 1: Start Backend

```bash
cd backend
docker-compose down -v
docker-compose up --build
```

Wait for all services to start. You should see:
```
auth-service | Started AuthServiceApplication
```

## Step 2: Register a Test User

```bash
# Terminal 2 - Register email
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionToken": "abc-123-...",
    "currentStep": "OTP"
  }
}
```

Save the `sessionToken` and check email for OTP.

## Step 3: Complete Registration

```bash
# Verify OTP (replace with actual OTP from email)
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "otp": "123456"
  }'

# Submit details
curl -X POST http://localhost:8080/api/auth/register/details \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "full_name": "Test User",
    "phoneNumber": "9876543210",
    "countryCode": "+91",
    "dateOfBirth": "1995-05-15"
  }'

# Create password
curl -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'

# Create username
curl -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "username": "testuser123"
  }'
```

## Step 4: Test Login and Session Creation

### Login from Device 1 (Simulated Android)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "abc123...",
    "userId": "uuid-here",
    "email": "testuser@example.com",
    "username": "testuser123"
  }
}
```

**Check Docker Logs - You should see:**
```
✅ LOGIN SUCCESSFUL - SESSION CREATED
Session ID: [UUID]
User ID (FK): [UUID matching user]
IP Address: 49.207.153.17
Device Info: Android 14 | Pixel 8 Pro
Total active sessions: 1
```

### Login from Device 2 (Simulated iOS)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: iOS 17 | iPhone 15 Pro" \
  -H "X-IP-Address: 13.250.22.45" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

**Check Logs:**
```
Total active sessions: 2
```

### Login from Device 3 (Simulated macOS)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: macOS 15 | Chrome" \
  -H "X-IP-Address: 103.45.67.89" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

**Check Logs:**
```
Total active sessions: 3
```

## Step 5: Verify Database Storage

Connect to your Neon database and run:

```sql
-- Check users table
SELECT id, email, username, is_email_verified, created_at 
FROM users 
WHERE email = 'testuser@example.com';

-- Check user_sessions table
SELECT 
    us.id as session_id,
    us.user_id,
    u.email,
    us.ip_address,
    us.device_info,
    us.created_at,
    us.last_used_at,
    us.expires_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'testuser@example.com'
ORDER BY us.created_at DESC;

-- Count active sessions
SELECT 
    u.email,
    COUNT(us.id) as active_sessions
FROM users u
JOIN user_sessions us ON u.id = us.user_id
WHERE us.expires_at > NOW()
AND u.email = 'testuser@example.com'
GROUP BY u.email;
```

**Expected Results:**
- 1 user record
- 3 session records
- All sessions have:
  - ✅ Valid `user_id` (UUID)
  - ✅ Unique `refresh_token`
  - ✅ Correct `ip_address`
  - ✅ Correct `device_info`
  - ✅ Valid timestamps

## Step 6: Test Get Active Sessions

```bash
# Get active sessions (use accessToken from login response)
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Active sessions retrieved successfully",
  "data": [
    {
      "id": "session-uuid-1",
      "deviceInfo": "macOS 15 | Chrome",
      "ipAddress": "103.45.67.89",
      "lastUsedAt": "2025-10-11T12:30:00",
      "createdAt": "2025-10-11T12:25:00",
      "isCurrentSession": true
    },
    {
      "id": "session-uuid-2",
      "deviceInfo": "iOS 17 | iPhone 15 Pro",
      "ipAddress": "13.250.22.45",
      "lastUsedAt": "2025-10-11T12:20:00",
      "createdAt": "2025-10-11T12:20:00",
      "isCurrentSession": false
    },
    {
      "id": "session-uuid-3",
      "deviceInfo": "Android 14 | Pixel 8 Pro",
      "ipAddress": "49.207.153.17",
      "lastUsedAt": "2025-10-11T12:10:00",
      "createdAt": "2025-10-11T12:10:00",
      "isCurrentSession": false
    }
  ]
}
```

## Step 7: Test Logout Session

```bash
# Logout a specific session
curl -X POST http://localhost:8080/api/auth/sessions/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-to-logout"
  }'
```

**Verify in database:**
```sql
SELECT COUNT(*) FROM user_sessions WHERE id = 'session-uuid-to-logout';
-- Should return 0 (session deleted)
```

## Step 8: Verification Checklist

Run this after all tests:

```sql
-- Run the verification script
\i VERIFY_DATABASE_STORAGE.sql
```

### ✅ **Success Criteria:**

1. **Users Table:**
   - [x] User record created with UUID
   - [x] Email, username, password stored correctly
   - [x] `is_email_verified` is `true`

2. **User_Sessions Table:**
   - [x] Multiple sessions created for same user
   - [x] Each session has unique ID (UUID)
   - [x] `user_id` matches user's UUID
   - [x] `refresh_token` is unique for each session
   - [x] `ip_address` stored correctly
   - [x] `device_info` stored correctly
   - [x] Timestamps (`created_at`, `last_used_at`, `expires_at`) set correctly

3. **Foreign Key Relationship:**
   - [x] `user_sessions.user_id` references `users.id`
   - [x] CASCADE DELETE works (deleting user deletes sessions)
   - [x] Cannot insert session with invalid user_id

4. **Real-Time Storage:**
   - [x] Sessions appear immediately in database
   - [x] Can query sessions right after login
   - [x] Session count updates correctly
   - [x] `last_used_at` updates on token refresh

## Troubleshooting

### Issue: Sessions not appearing in database

Check Docker logs:
```bash
docker-compose logs auth-service | grep "SESSION SAVED"
```

### Issue: user_id is NULL in user_sessions

Check entity mapping:
```bash
docker-compose logs auth-service | grep "User ID (FK)"
```

### Issue: Foreign key violation

Verify migration ran:
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

## Expected Docker Log Output

```
===========================================
✅ LOGIN SUCCESSFUL - SESSION CREATED
===========================================
📧 Email: testuser@example.com
👤 Username: testuser123
🆔 User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-------------------------------------------
🔑 JWT ACCESS TOKEN:
eyJhbGciOiJIUzI1NiIs...
-------------------------------------------
🔄 REFRESH TOKEN (Session Token):
abc123xyz...
-------------------------------------------
💾 DATABASE SESSION DETAILS:
Session ID: yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
User ID (FK): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Expires At: 2025-10-18T12:30:00
Created At: 2025-10-11T12:30:00
IP Address: 49.207.153.17
Device Info: Android 14 | Pixel 8 Pro
-------------------------------------------
📊 Total active sessions: 1
===========================================
```

## Success Indicators

1. **Console logs show "SESSION SAVED TO DATABASE"**
2. **User ID (FK) is a valid UUID, not NULL**
3. **SQL queries return session data immediately**
4. **Active session count increases with each login**
5. **Foreign key constraint prevents invalid data**

Run all tests and verify each step works correctly!

