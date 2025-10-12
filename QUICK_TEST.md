# Quick Test - 3 Minutes to Verify Everything Works

## Prerequisites
- Neon DB migration complete ✅
- Backend code updated ✅

## Step 1: Start Backend (1 min)

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose down
docker-compose up --build
```

Wait for:
```
auth-service | Started AuthServiceApplication
```

## Step 2: Register & Login (1 min)

### Quick Registration (if you don't have a user yet)

```bash
# Replace with your email
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com"}'

# Check email for OTP, then complete registration following the steps
```

### Login Test

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{
    "email": "YOUR_EMAIL@gmail.com",
    "password": "YourPassword123!"
  }'
```

## Step 3: Check Logs (30 sec)

```bash
docker-compose logs auth-service | tail -50
```

**Look for:**
```
✅ LOGIN SUCCESSFUL - SESSION CREATED
💾 DATABASE SESSION DETAILS:
Session ID: [UUID]
User ID (FK): [UUID]
IP Address: 49.207.153.17
Device Info: Android 14 | Pixel 8 Pro
📊 Total active sessions: 1
```

## Step 4: Verify Database (30 sec)

Connect to Neon and run:

```sql
SELECT 
    us.id,
    us.user_id,
    u.email,
    us.ip_address,
    us.device_info
FROM user_sessions us
JOIN users u ON us.user_id = u.id;
```

## Expected Result

| id | user_id | email | ip_address | device_info |
|----|---------|-------|------------|-------------|
| uuid-1 | uuid-user | your@email.com | 49.207.153.17 | Android 14 \| Pixel 8 Pro |

## Success Criteria

✅ **Login returns tokens**
✅ **Docker logs show "SESSION CREATED"**
✅ **user_id is NOT NULL** (shows valid UUID)
✅ **Database query returns session data**
✅ **ip_address and device_info are stored**

## If Something Goes Wrong

### Issue: Migration validation fails

```bash
docker-compose logs auth-service | grep "Flyway"
```

**Fix**: Make sure `V1__init_authentication_schema.sql` exists in:
```
backend/auth-service/src/main/resources/db/migration/
```

### Issue: user_id is NULL

This should NOT happen anymore. If it does:

```bash
docker-compose logs auth-service | grep "User ID (FK)"
```

Check the value logged. If NULL, there's an issue with the entity mapping.

### Issue: Can't login

Check:
```bash
docker-compose logs auth-service | grep -i error
```

## Complete Test (All Devices)

```bash
# Android
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'

# iOS
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: iOS 17 | iPhone 15 Pro" \
  -H "X-IP-Address: 13.250.22.45" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'

# macOS
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: macOS 15 | Chrome" \
  -H "X-IP-Address: 103.45.67.89" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```

**Check database:**
```sql
SELECT COUNT(*) FROM user_sessions;
```

**Expected**: 3 sessions

## Files Updated

### Backend Code:
- ✅ `UserSession.java` - Proper `@ManyToOne` mapping
- ✅ `User.java` - `@OneToMany` relationship
- ✅ `AuthenticationService.java` - Added `entityManager.flush()`
- ✅ `SessionManagementService.java` - Fixed `getUserId()` calls
- ✅ `UserSessionRepository.java` - Updated queries
- ✅ `application.yml` - Changed to `validate` mode

### Database:
- ✅ Fresh V1 migration applied to Neon
- ✅ All tables created with proper schema
- ✅ Foreign key constraint in place
- ✅ All indexes created
- ✅ Old data cleared

## What's Next

1. **Start backend**: `docker-compose up --build`
2. **Test login**: Use curl or Postman
3. **Check logs**: Verify session creation
4. **Query database**: See sessions stored with user_id
5. **Test mobile app**: Login from React Native app

Everything is now configured for real-time session tracking with device information!

## Documentation Reference

- `FINAL_SETUP_GUIDE.md` - Complete setup guide
- `TEST_REAL_TIME_STORAGE.md` - Detailed testing instructions
- `VERIFY_DATABASE_STORAGE.sql` - Database verification script
- `TEST_LOGIN_AND_SESSIONS.sh` - Automated test script
- `COMPLETE_FIX_SUMMARY.md` - All changes made

Your system is ready to go! 🚀

