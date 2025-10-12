# Test User Sessions Foreign Key Fix

## Quick Test Commands

### 1. Start Backend with New Migrations
```bash
cd backend
docker-compose down
docker-compose up --build
```

### 2. Verify Migration Success
```bash
# Check migration logs
docker-compose logs auth-service | grep -E "(V6|V7|foreign|constraint)"

# Expected output should show:
# ✅ Foreign key constraint exists
# ✅ Test session inserted successfully
# ✅ Foreign key constraint working
# ✅ CASCADE DELETE working
# ✅ All tests completed successfully!
```

### 3. Test Login with Device Info
```bash
# First, register a test user
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}'

# Check email for OTP, then verify
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"YOUR_SESSION_TOKEN","otp":"123456"}'

# Complete registration...
# Then test login with device info
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 192.168.1.100" \
  -d '{"email":"testuser@example.com","password":"SecurePass123!"}'
```

### 4. Verify Session Storage
```bash
# Check if session was stored with device info
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Database Verification
```bash
# Connect to database and verify
docker exec -it bharathva-auth psql $DB_URL

# Run these queries:
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

# Check foreign key constraint
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

## Expected Results

### ✅ Success Indicators

1. **Migration Logs Show:**
   - "Foreign key constraint exists"
   - "Test session inserted successfully"
   - "Foreign key constraint working"
   - "CASCADE DELETE working"
   - "All tests completed successfully!"

2. **Login Response Contains:**
   - `accessToken` and `refreshToken`
   - User information
   - No errors

3. **Session Storage Shows:**
   - Device info: "Android 14 | Pixel 8 Pro"
   - IP address: "192.168.1.100"
   - Proper user_id linking

4. **Database Queries Return:**
   - Sessions properly linked to users
   - Foreign key constraint exists
   - No orphaned records

### ❌ Failure Indicators

1. **Migration Errors:**
   - "Foreign key constraint missing!"
   - "Foreign key constraint not working"
   - "CASCADE DELETE not working"

2. **Login Errors:**
   - 500 Internal Server Error
   - Database constraint violations
   - Session not stored

3. **Database Issues:**
   - Orphaned sessions without valid user_id
   - Missing foreign key constraint
   - Data integrity violations

## Troubleshooting

### If Migrations Fail
```bash
# Check database connection
docker-compose logs auth-service | grep -i "database\|connection"

# Manually run migration
docker exec -it bharathva-auth psql $DB_URL -f /app/V6__fix_user_sessions_foreign_key.sql
```

### If Login Fails
```bash
# Check application logs
docker-compose logs auth-service | grep -i "error\|exception\|constraint"

# Verify database schema
docker exec -it bharathva-auth psql $DB_URL -c "\d user_sessions"
```

### If Sessions Not Stored
```bash
# Check foreign key constraint
docker exec -it bharathva-auth psql $DB_URL -c "
SELECT COUNT(*) as constraint_count
FROM information_schema.table_constraints 
WHERE table_name = 'user_sessions' 
AND constraint_type = 'FOREIGN KEY';"

# Should return: constraint_count = 1
```

## Manual Database Fix (If Needed)

If the migrations don't work automatically, run this manually:

```sql
-- Connect to your database
\c neondb

-- Add foreign key constraint
ALTER TABLE user_sessions 
ADD CONSTRAINT fk_user_sessions_user_id 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Verify constraint exists
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

## Summary

The fix ensures:
- ✅ Proper JPA entity relationships
- ✅ Database foreign key constraints  
- ✅ CASCADE DELETE functionality
- ✅ Device info and IP storage
- ✅ Data integrity enforcement
- ✅ Performance optimization

After running these tests, the user sessions should store properly with full device tracking capabilities!
