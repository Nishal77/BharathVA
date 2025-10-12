# User Sessions Foreign Key Fix

## Problem Identified

The `user_sessions` table was missing proper foreign key constraint enforcement, causing issues with data storage and referential integrity.

## Issues Found

1. **Missing JPA Relationship Mapping**: The `UserSession` entity only had a basic `@Column` annotation for `user_id` without proper JPA relationship mapping
2. **No Bidirectional Relationship**: The `User` entity didn't have the corresponding `@OneToMany` relationship
3. **Potential Database Constraint Issues**: Foreign key constraint might not be properly enforced at the database level

## Solutions Implemented

### 1. Fixed JPA Entity Relationships

**UserSession.java Changes:**
```java
// Before
@Column(name = "user_id", nullable = false, columnDefinition = "uuid")
private UUID userId;

// After
@Column(name = "user_id", nullable = false, columnDefinition = "uuid")
private UUID userId;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
private User user;
```

**User.java Changes:**
```java
// Added bidirectional relationship
@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private List<UserSession> userSessions;
```

### 2. Database Migration Fixes

**V6__fix_user_sessions_foreign_key.sql:**
- Verifies foreign key constraint exists
- Adds constraint if missing
- Cleans up orphaned records
- Optimizes indexes

**V7__test_user_sessions_integration.sql:**
- Comprehensive integration tests
- Foreign key constraint validation
- CASCADE DELETE testing
- Performance verification

### 3. Database Schema Verification

The foreign key constraint ensures:
```sql
CONSTRAINT fk_user_sessions_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
```

## Key Benefits

### 1. Data Integrity
- **Referential Integrity**: Prevents orphaned sessions
- **CASCADE DELETE**: Automatic cleanup when users are deleted
- **Constraint Enforcement**: Database-level validation

### 2. JPA Relationship Benefits
- **Lazy Loading**: Efficient data fetching
- **Bidirectional Navigation**: Access user from session and vice versa
- **Hibernate Optimization**: Better query optimization

### 3. Performance Improvements
- **Proper Indexing**: Optimized foreign key indexes
- **Query Optimization**: Better join performance
- **Constraint Validation**: Database-level checks

## Migration Files Created

1. **V6__fix_user_sessions_foreign_key.sql**
   - Fixes missing foreign key constraints
   - Cleans up orphaned data
   - Adds performance indexes

2. **V7__test_user_sessions_integration.sql**
   - Comprehensive integration tests
   - Validates foreign key functionality
   - Performance testing

## Testing the Fix

### 1. Run Migrations
```bash
cd backend
docker-compose up --build
```

### 2. Verify Database Constraints
```sql
-- Check foreign key exists
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

### 3. Test Login Flow
```bash
# Test login with device info
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 192.168.1.100" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Verify Session Storage
```sql
-- Check sessions are properly stored
SELECT 
    us.id,
    us.user_id,
    u.username,
    us.device_info,
    us.ip_address,
    us.created_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC;
```

## Expected Results

### 1. Successful Session Storage
- Sessions are properly linked to users
- Device info and IP addresses are stored
- No orphaned records

### 2. Proper Foreign Key Enforcement
- Invalid `user_id` values are rejected
- CASCADE DELETE works correctly
- Data integrity maintained

### 3. Improved Performance
- Faster queries with proper indexes
- Optimized foreign key lookups
- Better Hibernate relationship handling

## Troubleshooting

### If Sessions Still Not Storing

1. **Check Database Constraints:**
```sql
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'user_sessions' 
AND constraint_type = 'FOREIGN KEY';
```

2. **Verify Entity Mapping:**
```java
// Ensure UserSession has proper annotations
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
private User user;
```

3. **Check Application Logs:**
```bash
docker-compose logs auth-service | grep -i "session\|foreign\|constraint"
```

### If Foreign Key Constraint Missing

Run the fix migration manually:
```sql
-- Connect to database and run V6 migration
\i backend/auth-service/src/main/resources/db/migration/V6__fix_user_sessions_foreign_key.sql
```

## Summary

The fix ensures:
- ✅ Proper JPA relationship mapping
- ✅ Database foreign key constraints
- ✅ CASCADE DELETE functionality
- ✅ Data integrity enforcement
- ✅ Performance optimization
- ✅ Comprehensive testing

This resolves the user session storage issues and ensures robust referential integrity between users and their sessions.
