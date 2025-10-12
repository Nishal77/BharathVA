# Quick Start: Device Tracking & Session Management

## TL;DR

Complete device tracking is now implemented. Users can see all logged-in devices and logout remotely.

## Run It Now

### 1. Start Backend (2 minutes)

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend

# Fresh start with new migration
docker-compose down
docker-compose up --build
```

Wait for: `✅ auth-service started`

### 2. Verify Migration

```bash
docker-compose logs auth-service | grep "V5__clean"
```

Should see: `Migration V5 completed`

### 3. Test with cURL (3 minutes)

```bash
# Register user
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"quick@test.com"}'

# Get OTP from email, then verify and complete registration
# (Follow standard registration flow)

# Login from Device 1
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{"email":"quick@test.com","password":"YourPassword123!"}'

# Save the accessToken

# View sessions
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer <access_token>"
```

### 4. Test Mobile App

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/apps/mobile

# Install dependencies
pnpm install

# Start app
pnpm start
```

1. Login to the app
2. Go to Profile → Settings → Active Devices
3. See your current device with info and IP
4. Device info auto-collected (no manual input needed)

## What You Get

### Database
```
users table (PK: id UUID)
  ↓ (FK with CASCADE DELETE)
user_sessions table (PK: id UUID, FK: user_id)
  - Device info (e.g., "Android 14 | Pixel 8 Pro")
  - IP address (e.g., "49.207.153.17")
  - Last active time
  - Expiration time
```

### Mobile App
- Automatic device detection
- Automatic IP detection
- Active Devices screen
- Logout individual devices
- Logout all other devices

### Backend APIs
- GET `/auth/sessions` - List active devices
- POST `/auth/sessions/logout` - Logout specific device
- POST `/auth/sessions/logout-all-other` - Logout all others

## Example Output

### Active Devices Screen
```
📱 Android 14 | Pixel 8 Pro
   49.207.153.17
   Last active: Just now
   [THIS DEVICE]

💻 macOS 15 | Chrome
   13.250.22.45
   Last active: 1 day ago
   [🗑️ Logout Device]

📱 iOS 17.2 | iPhone 15 Pro
   52.77.88.99
   Last active: 2 hours ago
   [🗑️ Logout Device]
```

## Files Changed

### Backend (Java/Spring Boot)
- ✅ `V5__clean_recreate_users_and_sessions.sql` - NEW
- ✅ `SessionController.java` - NEW
- ✅ `SessionManagementService.java` - NEW
- ✅ `UserSessionResponse.java` - NEW
- ✅ `AuthenticationController.java` - UPDATED
- ✅ `AuthenticationService.java` - UPDATED
- ✅ `SecurityConfig.java` - UPDATED

### Frontend (React Native/Expo)
- ✅ `deviceInfoService.ts` - NEW
- ✅ `authService.ts` - UPDATED
- ✅ `config.ts` - UPDATED
- ✅ `ActiveDevices.tsx` - NEW

### Documentation
- ✅ `DEVICE_TRACKING_IMPLEMENTATION.md`
- ✅ `DEVICE_TRACKING_TEST_GUIDE.md`
- ✅ `SESSION_MANAGEMENT_COMPLETE.md`
- ✅ `COMPLETE_SESSION_TRACKING_SUMMARY.md`

## Common Commands

```bash
# Start services
cd backend && docker-compose up --build

# View logs
docker-compose logs -f auth-service

# Check sessions in DB
psql <connection> -c "SELECT * FROM user_sessions;"

# Stop services
docker-compose down

# Run mobile app
cd apps/mobile && pnpm start

# Install dependencies
cd apps/mobile && pnpm install
```

## Verification Checklist

After starting:

1. Backend started? ✓
   ```bash
   curl http://localhost:8080/api/auth/register/health
   ```

2. Migration ran? ✓
   ```bash
   docker-compose logs auth-service | grep "Migration V5"
   ```

3. Tables created? ✓
   ```sql
   \d users
   \d user_sessions
   ```

4. FK constraint exists? ✓
   ```sql
   \d user_sessions
   -- Should show: fk_user_sessions_user_id
   ```

5. Can login with device info? ✓
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "X-Device-Info: Test Device" \
     -H "X-IP-Address: 1.2.3.4" \
     -d '{"email":"test@gmail.com","password":"pass"}'
   ```

6. Session saved with device info? ✓
   ```sql
   SELECT device_info, ip_address FROM user_sessions ORDER BY created_at DESC LIMIT 1;
   ```

7. Can fetch sessions? ✓
   ```bash
   curl -X GET http://localhost:8080/api/auth/sessions \
     -H "Authorization: Bearer <token>"
   ```

8. Mobile app device detection works? ✓
   - Open app
   - Check console for device info logs

9. Active Devices UI works? ✓
   - Navigate to Active Devices screen
   - See current device

10. Logout works? ✓
    - Logout a device
    - Verify it's removed

## Support

### Issues?

1. **Migration fails**: Check logs, verify Flyway schema
2. **Device info not captured**: Check headers in network tab
3. **Sessions not appearing**: Verify FK constraint exists
4. **Can't logout device**: Check authorization token
5. **Mobile app errors**: Check pnpm install completed

### Logs to Check

```bash
# Backend
docker-compose logs auth-service

# Database migrations
docker-compose logs auth-service | grep "Flyway"

# Login events
docker-compose logs auth-service | grep "LOGIN"

# Session events
docker-compose logs auth-service | grep "SESSION"
```

---

**⚡ Quick Start Complete!**

Everything is set up for multi-device tracking and session management.

**Next Steps:**
1. Start backend: `docker-compose up --build`
2. Start mobile: `pnpm start`  
3. Test login flow
4. View Active Devices

**BharathVA - Ready to Track Millions of Devices**

