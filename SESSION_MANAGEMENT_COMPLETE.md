# Session Management & Device Tracking - Implementation Complete

## What Was Implemented

A comprehensive session management system that tracks all user login sessions across multiple devices with detailed device information and IP tracking.

## Key Features

### 1. Database Schema (Properly Synchronized)

**Users Table** (Primary)
- UUID primary key
- Stores user account information
- Referenced by user_sessions via FK

**User Sessions Table** (Foreign Key to Users)
- UUID primary key (unique session ID)
- `user_id` - Foreign key to `users(id)` with CASCADE DELETE
- `refresh_token` - Unique token for session renewal
- `ip_address` - IPv4/IPv6 address (45 chars)
- `device_info` - Device details (500 chars)
- `expires_at` - Session expiration
- `created_at` - Session creation time
- `last_used_at` - Last activity timestamp

### 2. Device Information Collection

**Frontend (React Native/Expo)**
- Automatically collects device info using `expo-device`
- Fetches public IP using `ipify API`
- Formats device string (e.g., "Android 14 | Pixel 8 Pro")
- Sends via custom headers to backend

**Device Info Formats:**
- Android: "Android 14 | Google Pixel 8 Pro"
- iOS: "iOS 17.2 | iPhone 15 Pro"
- Web: "macOS 15 | Chrome"

### 3. Backend Implementation

**New Files:**
- `SessionController.java` - Session management endpoints
- `SessionManagementService.java` - Business logic
- `UserSessionResponse.java` - DTO for session data
- `V5__clean_recreate_users_and_sessions.sql` - Clean migration

**Updated Files:**
- `AuthenticationController.java` - Capture device headers
- `AuthenticationService.java` - Store device info in sessions
- `SecurityConfig.java` - Protect session endpoints

### 4. API Endpoints

#### GET /auth/sessions
Retrieve all active sessions for current user

#### POST /auth/sessions/logout
Logout specific session by ID

#### POST /auth/sessions/logout-all-other
Logout all sessions except current

### 5. Mobile App UI

**Active Devices Screen** (`ActiveDevices.tsx`)
- List all active sessions
- Show device info, IP, last active time
- Highlight current device
- Logout individual devices
- Logout all other devices at once
- Pull-to-refresh functionality
- Security notice for unrecognized devices

## Database Relationship

```
users (PK: id UUID)
  ↓ (CASCADE DELETE)
user_sessions (PK: id UUID, FK: user_id → users.id)
```

When a user is deleted:
- All their sessions are automatically deleted (CASCADE)
- No orphaned session records

## How It Works

### Login Flow

1. **User Login Request**
   ```
   Mobile App → Collects Device Info + IP
              → Sends to Backend via headers
   ```

2. **Backend Processing**
   ```
   Backend → Validates credentials
          → Generates access token + refresh token
          → Creates session record with:
             - user_id (FK to users)
             - refresh_token (unique)
             - ip_address (from X-IP-Address header)
             - device_info (from X-Device-Info header)
             - expires_at (7 days)
          → Saves to user_sessions table
          → Returns tokens to app
   ```

3. **Session Storage**
   ```
   Database → user_sessions table stores:
             - Session ID (UUID, PK)
             - User ID (UUID, FK)
             - Device info
             - IP address
             - Timestamps
   ```

### View Sessions Flow

1. **User Opens Active Devices Screen**
   ```
   Mobile App → Calls GET /auth/sessions
              → Passes access token
   ```

2. **Backend Processing**
   ```
   Backend → Extracts user ID from JWT
          → Queries user_sessions WHERE user_id = ?
          → Returns list of active sessions
   ```

3. **Display**
   ```
   Mobile App → Shows all devices
              → Highlights current device
              → Shows device info, IP, last active
   ```

### Logout Device Flow

1. **User Taps Logout on Device**
   ```
   Mobile App → Calls POST /auth/sessions/logout
              → Sends session ID
              → Passes access token
   ```

2. **Backend Processing**
   ```
   Backend → Validates user owns session
          → Deletes session from database
          → Invalidates refresh token
   ```

3. **Result**
   ```
   Target Device → Next API call fails (401)
                 → Forced to login again
   ```

## Migration Instructions

### Step 1: Backup Current Data (Optional)

If you want to preserve existing users:
```sql
-- Connect to Neon database
SELECT * FROM users;  -- Export if needed
```

### Step 2: Apply Migration

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend

# Stop services
docker-compose down

# Rebuild and start (migration runs automatically)
docker-compose up --build
```

### Step 3: Verify Migration

```bash
# Check logs for migration success
docker-compose logs auth-service | grep "user_sessions"

# Should see:
# "Tables created successfully with proper FK relationships!"
```

### Step 4: Test the System

1. Register a new user
2. Login from mobile app
3. Check database for session record
4. View active devices in app
5. Test logout functionality

## Testing

### Test Device Tracking

```bash
# Login with Device 1
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{
    "email": "test@gmail.com",
    "password": "password123"
  }'

# Save the accessToken from response

# View active sessions
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer <access_token>"
```

### Test Multi-Device Login

```bash
# Login from Device 2
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: macOS 15 | Chrome" \
  -H "X-IP-Address: 13.250.22.45" \
  -d '{
    "email": "test@gmail.com",
    "password": "password123"
  }'

# Login from Device 3
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: iOS 17 | iPhone 15 Pro" \
  -H "X-IP-Address: 52.77.88.99" \
  -d '{
    "email": "test@gmail.com",
    "password": "password123"
  }'

# View all 3 sessions
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer <access_token>"
```

### Test Logout Device

```bash
# Logout specific session
curl -X POST http://localhost:8080/api/auth/sessions/logout \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "<session_id>"}'

# Logout all other devices
curl -X POST http://localhost:8080/api/auth/sessions/logout-all-other \
  -H "Authorization: Bearer <access_token>"
```

## Database Queries

### View All Sessions
```sql
SELECT 
    s.id as session_id,
    u.username,
    u.email,
    s.device_info,
    s.ip_address,
    s.created_at,
    s.last_used_at,
    s.expires_at
FROM user_sessions s
JOIN users u ON s.user_id = u.id
ORDER BY s.last_used_at DESC;
```

### View Sessions for Specific User
```sql
SELECT * FROM user_sessions 
WHERE user_id = '<user_uuid>'
ORDER BY last_used_at DESC;
```

### Count Active Sessions per User
```sql
SELECT 
    u.username,
    COUNT(s.id) as active_sessions
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id 
    AND s.expires_at > NOW()
GROUP BY u.id, u.username
ORDER BY active_sessions DESC;
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rate limit** login endpoints to prevent brute force
3. **Alert users** on new device login via email
4. **Limit max sessions** per user (e.g., 10 devices)
5. **Implement session timeout** for inactive sessions
6. **Clean up expired sessions** with scheduled job
7. **Log suspicious activity** (unusual IPs, multiple failed logins)

## Troubleshooting

### Migration Fails

```bash
# Check Flyway migration status
docker-compose logs auth-service | grep Flyway

# If stuck, manually reset Flyway
docker-compose exec auth-service sh
# Then manually run SQL or reset Flyway baseline
```

### Sessions Not Appearing

```bash
# Check if session was created
docker-compose logs auth-service | grep "SESSION SAVED"

# Verify in database
psql <connection_string>
SELECT * FROM user_sessions ORDER BY created_at DESC LIMIT 5;
```

### Device Info Not Captured

```bash
# Check frontend logs
console.log('[DeviceInfo]', deviceInfo);

# Check backend logs
docker-compose logs auth-service | grep "Device Info"

# Verify headers are being sent
curl -v ... (check for X-Device-Info header)
```

## What's Next

1. Start Docker services
2. Run migration (automatic)
3. Test registration and login
4. Test multi-device login
5. Test session management UI
6. Deploy to production

---

**Implementation Status: ✅ COMPLETE**

All components implemented and ready for testing:
- Database schema with proper FK relationships
- Device info collection in mobile app
- Backend session management endpoints
- Active devices UI screen
- Comprehensive testing guide

**BharathVA - Secure Session Management at Scale**

