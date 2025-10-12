# User Session Entity Fix - Complete Test Guide

## 🔧 What Was Fixed

### 1. **UserSession Entity Issues**
- ❌ **Before**: Had conflicting `userId` (UUID) and `user` (User) mappings
- ❌ **Before**: Used `insertable = false, updatable = false` 
- ❌ **Before**: Builder pattern wasn't working properly

- ✅ **After**: Clean `@ManyToOne` relationship with `@JoinColumn(name = "user_id")`
- ✅ **After**: Proper constructor: `new UserSession(user, refreshToken, expiresAt, ipAddress, deviceInfo)`
- ✅ **After**: Direct entity relationship mapping

### 2. **Repository Queries Updated**
- ✅ Updated all queries to use `s.user.id` instead of `s.userId`
- ✅ Proper JPA relationship navigation

### 3. **Hibernate Configuration**
- ✅ Changed `ddl-auto: validate` → `ddl-auto: update`
- ✅ Allows Hibernate to sync entity changes

## 🚀 How to Test the Fix

### Step 1: Start Backend
```bash
cd backend
docker-compose down
docker-compose up --build
```

### Step 2: Verify Migration Success
```bash
# Check migration logs
docker-compose logs auth-service | grep -E "(V8|entity|session|✅)"

# Expected output:
# ✅ Test session created with ID: [uuid]
# ✅ User session properly linked to user
# ✅ Test data cleaned up
# ✅ UserSession entity fix verification complete!
```

### Step 3: Test Login with Device Info
```bash
# Register a test user first
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}'

# Complete registration flow, then test login:
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 192.168.1.100" \
  -d '{"email":"testuser@example.com","password":"SecurePass123!"}'
```

### Step 4: Verify Session Storage
```bash
# Get active sessions (replace with actual access token)
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 5: Database Verification
```bash
# Connect to database
docker exec -it bharathva-auth psql $DB_URL

# Check sessions are properly stored
SELECT 
    us.id,
    us.user_id,
    u.username,
    u.email,
    us.device_info,
    us.ip_address,
    us.created_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC
LIMIT 5;

# Verify foreign key constraint
SELECT 
    tc.constraint_name,
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

## 📋 Expected Results

### ✅ Success Indicators

1. **Migration Logs Show:**
   ```
   ✅ Test session created with ID: [uuid]
   ✅ User session properly linked to user
   ✅ Test data cleaned up
   ✅ UserSession entity fix verification complete!
   ```

2. **Login Response Contains:**
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "accessToken": "eyJhbGciOiJIUzI1NiIs...",
       "refreshToken": "xyz123abc456...",
       "tokenType": "Bearer",
       "userId": "uuid-here",
       "email": "testuser@example.com",
       "username": "testuser",
       "expiresIn": 3600000,
       "refreshExpiresIn": 604800000
     }
   }
   ```

3. **Session Storage Shows:**
   ```json
   [
     {
       "id": "session-uuid",
       "deviceInfo": "Android 14 | Pixel 8 Pro",
       "ipAddress": "192.168.1.100",
       "lastUsedAt": "2024-01-15T10:30:00",
       "createdAt": "2024-01-15T10:30:00",
       "expiresAt": "2024-01-22T10:30:00",
       "isCurrentSession": false
     }
   ]
   ```

4. **Database Queries Return:**
   - Sessions properly linked to users
   - Device info and IP addresses stored
   - Foreign key constraint exists
   - No constraint violations

### ❌ Failure Indicators

1. **Migration Errors:**
   - "User session not properly linked"
   - Foreign key constraint violations
   - Entity mapping errors

2. **Login Errors:**
   - 500 Internal Server Error
   - "Failed to save session"
   - Hibernate mapping exceptions

3. **Database Issues:**
   - Sessions not stored
   - Foreign key constraint missing
   - Data integrity violations

## 🔍 Key Changes Made

### UserSession.java
```java
// ✅ NEW: Clean entity mapping
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "user_id", nullable = false)
private User user;

// ✅ NEW: Proper constructor
public UserSession(User user, String refreshToken, LocalDateTime expiresAt, String ipAddress, String deviceInfo) {
    this.user = user;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.ipAddress = ipAddress;
    this.deviceInfo = deviceInfo;
}
```

### AuthenticationService.java
```java
// ✅ NEW: Proper session creation
UserSession session = new UserSession(user, refreshToken, refreshExpiresAt, ipAddress, deviceInfo);
UserSession savedSession = userSessionRepository.save(session);
```

### UserSessionRepository.java
```java
// ✅ NEW: Updated queries for entity relationship
@Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.expiresAt > :now")
List<UserSession> findActiveSessionsByUserId(UUID userId, LocalDateTime now);
```

### application.yml
```yaml
# ✅ NEW: Allow Hibernate to sync entity changes
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

## 🎯 Summary

The fix ensures:
- ✅ **Clean JPA Entity Mapping**: No conflicting fields
- ✅ **Proper Constructor**: Direct User object mapping
- ✅ **Database Sync**: Hibernate can update schema
- ✅ **Foreign Key Constraints**: Proper referential integrity
- ✅ **Device Tracking**: IP and device info storage
- ✅ **Session Management**: Active sessions tracking

After running these tests, user sessions should store properly with full device tracking capabilities! 🎉
