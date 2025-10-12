# Test iPhone 13 Login - Complete Guide

## Prerequisites

1. Backend running: `cd backend && docker-compose up`
2. Expo app running: `cd apps/mobile && pnpm start`
3. iPhone 13 with Expo Go app installed
4. Existing test user registered

## Quick Test

### Step 1: Ensure Backend is Running

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose up
```

Wait for:
```
auth-service | Started AuthServiceApplication
```

### Step 2: Start Mobile App

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/apps/mobile
pnpm start
```

Scan QR code with iPhone 13 Expo Go app.

### Step 3: Login from iPhone

1. **Open app on iPhone 13**
2. **Navigate to Login** (from hero screen)
3. **Enter email**: `testuser@example.com`
4. **Press "Next"**
5. **Enter password**: `TestPass123!`
6. **Press "Log in"**

### Step 4: Watch Console Logs

**Mobile Console (Expo):**
```
[AuthService] Collecting device information...
[AuthService] Device Info: iOS 17.5 | iPhone 13
[AuthService] IP Address: 103.xxx.xxx.xxx
[API] POST http://localhost:8080/api/auth/login
[API] Success: Login successful
[AuthService] Login successful, tokens saved
[PasswordScreen] Login successful!
[PasswordScreen] User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[PasswordScreen] Username: testuser1760187048
```

**Backend Console (Docker):**
```
===========================================
LOGIN REQUEST RECEIVED
Email: testuser@example.com
IP Address: 103.xxx.xxx.xxx
Device Info: iOS 17.5 | iPhone 13
User Agent: Expo/1.0
===========================================
✅ LOGIN SUCCESSFUL - SESSION CREATED
===========================================
📧 Email: testuser@example.com
👤 Username: testuser1760187048
🆔 User ID: 75b6da08-44df-41b1-a8a5-b91974e5a4ac
-------------------------------------------
💾 DATABASE SESSION DETAILS:
Session ID: abc12345-6789-...
User ID (FK): 75b6da08-44df-41b1-a8a5-b91974e5a4ac
IP Address: 103.xxx.xxx.xxx
Device Info: iOS 17.5 | iPhone 13
-------------------------------------------
📊 Total active sessions: 1
===========================================
```

### Step 5: Verify in Neon Database

```sql
-- Get latest session for test user
SELECT 
    us.id,
    us.user_id,
    u.email,
    us.ip_address,
    us.device_info,
    us.created_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'testuser@example.com'
ORDER BY us.created_at DESC
LIMIT 1;
```

**Expected Output:**
```
id                  | abc12345-6789-...
user_id             | 75b6da08-44df-41b1-a8a5-b91974e5a4ac
email               | testuser@example.com
ip_address          | 103.xxx.xxx.xxx (YOUR ACTUAL IP)
device_info         | iOS 17.5 | iPhone 13
created_at          | 2025-10-11 13:30:00.123456
```

## Multiple Device Test

### Test 1: Login from iPhone 13
- Follow steps above
- Check: 1 session in database

### Test 2: Login from Script (Simulated Android)
```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
./TEST_LOGIN_AND_SESSIONS.sh
```
- Check: Now 4 sessions total (1 iPhone + 3 simulated)

### Test 3: View Active Devices in App
1. Navigate to Settings → Active Devices
2. Should see all 4 sessions:
   - iOS 17.5 | iPhone 13 (your current device)
   - Android 14 | Pixel 8 Pro
   - iOS 17 | iPhone 15 Pro
   - macOS 15 | Chrome

### Test 4: Logout Specific Device
1. Tap "Logout" on one of the sessions
2. Refresh
3. Session should disappear

## Common Issues & Solutions

### Issue 1: "Network request failed"

**Cause**: iPhone can't reach localhost:8080

**Solution**: 
1. Make sure iPhone and Mac are on same WiFi
2. Find Mac's local IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. Update `apps/mobile/services/api/config.ts`:
   ```typescript
   BASE_URL: 'http://192.168.1.x:8080/api/auth'
   ```

### Issue 2: Device info shows "Unknown"

**Cause**: `expo-device` not returning device info

**Solution**: Check if package is installed:
```bash
cd apps/mobile
pnpm list expo-device
```

### Issue 3: IP address shows "Unknown"

**Cause**: ipify API blocked or network issue

**Solution**: 
1. Test ipify manually: `curl https://api.ipify.org?format=json`
2. If blocked, update deviceInfoService to use backup:
   ```typescript
   // Fallback to alternative service
   const response = await fetch('https://api.my-ip.io/ip');
   ```

### Issue 4: Session created but device_info is null

**Cause**: Headers not sent properly

**Solution**: Check backend logs:
```bash
docker-compose logs auth-service | grep "X-Device-Info"
```

Should see:
```
Device Info: iOS 17.5 | iPhone 13
```

## Verification Checklist

After logging in from iPhone 13:

- [ ] Mobile console shows "Login successful, tokens saved"
- [ ] Backend console shows "SESSION CREATED"
- [ ] Backend console shows "Device Info: iOS 17.5 | iPhone 13"
- [ ] Backend console shows your actual IP address
- [ ] Database query returns session with:
  - [ ] Valid UUID for session ID
  - [ ] Valid UUID for user_id (foreign key)
  - [ ] Device info: "iOS 17.5 | iPhone 13"
  - [ ] IP address: Your actual public IP
  - [ ] Timestamps all populated
- [ ] Active Devices screen shows the session
- [ ] Can logout the session from Active Devices

## SQL Queries for Verification

### 1. Check if session was created
```sql
SELECT COUNT(*) FROM user_sessions 
WHERE device_info LIKE '%iPhone%';
```

### 2. View your iPhone session details
```sql
SELECT 
    us.id,
    us.device_info,
    us.ip_address,
    us.created_at,
    us.expires_at,
    u.email,
    u.username
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.device_info LIKE '%iPhone%'
ORDER BY us.created_at DESC
LIMIT 1;
```

### 3. Count all sessions for test user
```sql
SELECT 
    u.email,
    COUNT(us.id) as total_sessions
FROM users u
LEFT JOIN user_sessions us ON u.id = us.user_id
WHERE u.email = 'testuser@example.com'
GROUP BY u.email;
```

### 4. View all devices for test user
```sql
SELECT 
    us.device_info,
    us.ip_address,
    us.created_at,
    CASE 
        WHEN us.expires_at > NOW() THEN 'Active'
        ELSE 'Expired'
    END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'testuser@example.com'
ORDER BY us.created_at DESC;
```

## Expected Results

### Before Fix
```
users table: 1 row (from registration)
user_sessions table: 0 rows (no sessions)
```

### After Fix
```
users table: 1 row (from registration)
user_sessions table: 1+ rows (sessions created on login)
```

## Success!

If you see your iPhone 13 session in the database with correct device info and IP address, the fix is working perfectly!

Now every time you login from your iPhone 13, a new session will be created in the `user_sessions` table, and you can view/manage all your active devices from the Active Devices screen in the app.

