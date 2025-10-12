# Final Setup Guide - BharathVA Authentication & Session Tracking

## Overview

This guide covers the complete setup for the authentication system with real-time session tracking and device information storage.

## What's Been Fixed

1. **Fresh Database Schema** - All old migrations removed, single V1 migration created
2. **Proper JPA Mapping** - UserSession correctly linked to User entity
3. **Real-Time Storage** - EntityManager flush ensures immediate database writes
4. **Foreign Key Constraints** - Proper CASCADE DELETE relationship
5. **Code Logic Fixed** - All `getUserId()` calls updated to `getUser().getId()`

## Quick Start

### Step 1: Stop and Clean Everything

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose down -v
```

This will:
- Stop all containers
- Remove volumes (clean database state)

### Step 2: Start Fresh Build

```bash
docker-compose up --build
```

Wait for all services to start:
```
discovery-service | Started DiscoveryServiceApplication ✅
gateway-service | Started GatewayServiceApplication ✅
auth-service | Started AuthServiceApplication ✅
```

### Step 3: Verify Migration

Check the logs to see if migration ran successfully:
```bash
docker-compose logs auth-service | grep -i "flyway\|migration\|v1"
```

You should see:
```
Flyway: Successfully validated 1 migration
Flyway: Current version of schema "public": 1
Migration V1__init_authentication_schema.sql completed successfully
```

## Testing the System

### Option 1: Automated Test Script

```bash
cd backend
./TEST_LOGIN_AND_SESSIONS.sh
```

This script will:
1. Register a test user
2. Log in from 3 different devices
3. Fetch active sessions
4. Verify all data is stored correctly

### Option 2: Manual Testing

#### 1. Register User

```bash
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

Complete the registration flow (OTP, details, password, username).

#### 2. Login from Device 1 (Android)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{
    "email":"your@email.com",
    "password":"YourPassword123!"
  }'
```

**Save the `accessToken` and `refreshToken` from response!**

#### 3. Login from Device 2 (iOS)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: iOS 17 | iPhone 15 Pro" \
  -H "X-IP-Address: 13.250.22.45" \
  -d '{
    "email":"your@email.com",
    "password":"YourPassword123!"
  }'
```

#### 4. Check Active Sessions

```bash
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "session-uuid-1",
      "deviceInfo": "iOS 17 | iPhone 15 Pro",
      "ipAddress": "13.250.22.45",
      "lastUsedAt": "2025-10-11T12:35:00",
      "createdAt": "2025-10-11T12:35:00",
      "isCurrentSession": true
    },
    {
      "id": "session-uuid-2",
      "deviceInfo": "Android 14 | Pixel 8 Pro",
      "ipAddress": "49.207.153.17",
      "lastUsedAt": "2025-10-11T12:30:00",
      "createdAt": "2025-10-11T12:30:00",
      "isCurrentSession": false
    }
  ]
}
```

## Database Verification

### Connect to Neon Database

Use the connection string from your `auth-service/.env` file.

### Run Verification Script

```sql
\i VERIFY_DATABASE_STORAGE.sql
```

### Manual Verification Queries

```sql
-- Check users table
SELECT id, email, username, is_email_verified, created_at 
FROM users;

-- Check user_sessions table (should have proper user_id)
SELECT 
    us.id as session_id,
    us.user_id,
    u.email,
    us.ip_address,
    us.device_info,
    us.created_at,
    us.expires_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC;

-- Verify foreign key constraint exists
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'user_sessions';

-- Count active sessions per user
SELECT 
    u.email,
    COUNT(us.id) as active_sessions
FROM users u
LEFT JOIN user_sessions us ON u.id = us.user_id
WHERE us.expires_at > NOW()
GROUP BY u.email;
```

## Expected Docker Logs

When you log in, you should see:

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

## Verification Checklist

After starting the backend, verify:

### 1. Migration Success
```bash
docker-compose logs auth-service | grep -i flyway
```
Expected: `Migration V1__init_authentication_schema.sql completed`

### 2. Tables Created
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_sessions', 'email_otps', 'registration_sessions');
```
Expected: 4 tables

### 3. Foreign Key Constraint
```sql
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'user_sessions' 
AND constraint_type = 'FOREIGN KEY';
```
Expected: `fk_user_sessions_user_id`

### 4. Login Works
```bash
curl http://localhost:8080/api/auth/register/health
```
Expected: `{"success":true,"data":"OK"}`

### 5. Session Storage
After login, run:
```sql
SELECT COUNT(*) FROM user_sessions;
```
Expected: Number of logins you performed

### 6. User ID Not NULL
```sql
SELECT user_id FROM user_sessions WHERE user_id IS NULL;
```
Expected: 0 rows (no NULL user_ids)

### 7. Foreign Key Works
```sql
SELECT us.user_id, u.id 
FROM user_sessions us 
JOIN users u ON us.user_id = u.id;
```
Expected: All sessions match with users

## Troubleshooting

### Issue: Migration Doesn't Run

**Check Flyway version:**
```bash
docker-compose logs auth-service | grep "Flyway Community Edition"
```

**Fix:** Make sure `flyway.enabled=true` in `application.yml`

### Issue: user_id is NULL in user_sessions

**Check logs for:**
```bash
docker-compose logs auth-service | grep "User ID (FK)"
```

**Should show:** Valid UUID, not NULL

**Fix:** Already fixed with `@ManyToOne` mapping and `entityManager.flush()`

### Issue: Foreign Key Violation

**Check constraint:**
```sql
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'user_sessions' 
AND constraint_type = 'FOREIGN KEY';
```

**Fix:** Drop and recreate with `docker-compose down -v` then `up --build`

### Issue: Sessions Not Showing in Database

**Check transaction commit:**
```bash
docker-compose logs auth-service | grep "SESSION SAVED"
```

**Fix:** Already added `entityManager.flush()` for immediate write

## Architecture Overview

```
Client Login Request
    ↓
Gateway Service (8080)
    ↓
Auth Service (8081)
    ↓
1. Validate credentials
2. Generate JWT access token
3. Generate refresh token
4. Create UserSession object
5. Save to database
6. FLUSH to database (real-time)
7. Refresh entity
    ↓
PostgreSQL (Neon)
    ↓
users table + user_sessions table
(with FK constraint)
```

## Files Reference

| File | Purpose |
|------|---------|
| `V1__init_authentication_schema.sql` | Database schema creation |
| `UserSession.java` | Entity with `@ManyToOne` mapping |
| `User.java` | Entity with `@OneToMany` mapping |
| `AuthenticationService.java` | Login logic with `flush()` |
| `SessionManagementService.java` | Session management logic |
| `UserSessionRepository.java` | Database queries |
| `application.yml` | Hibernate `validate` mode |
| `VERIFY_DATABASE_STORAGE.sql` | Database verification script |
| `TEST_LOGIN_AND_SESSIONS.sh` | Automated test script |

## Summary

All issues have been fixed:
- ✅ Fresh migration created
- ✅ Proper JPA mapping
- ✅ Real-time database storage
- ✅ Foreign key constraints
- ✅ Code logic fixed
- ✅ Build successful
- ✅ Test scripts created

**Everything is ready for testing!**

Run:
```bash
docker-compose down -v && docker-compose up --build
```

Then test with `./TEST_LOGIN_AND_SESSIONS.sh` or manual curl commands.

