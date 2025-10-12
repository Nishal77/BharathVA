# Test Authentication Persistence

## Quick Test (2 Minutes)

### Test 1: Login and Refresh Persistence

```bash
# Step 1: Start backend
cd backend
docker-compose up

# Step 2: Start mobile app
cd apps/mobile
pnpm start

# Step 3: Login from iPhone 13
Email: testuser@example.com
Password: TestPass123!

# Expected Console Output:
✅ PASSWORD SCREEN - LOGIN STARTED
✅ Device: iOS 17.5 | iPhone 13
✅ IP: 103.xxx.xxx.xxx
✅ LOGIN SUCCESSFUL
✅ Navigating to user screen

# Step 4: Close app completely
# - Double tap home button
# - Swipe up to close BharathVA

# Step 5: Reopen app

# Expected Behavior:
✅ Shows loading screen briefly
✅ AUTO-CHECKS authentication
✅ VALIDATES stored tokens
✅ REDIRECTS to user home screen
✅ NO LOGIN REQUIRED

# Expected Console Output:
✅ AUTH CONTEXT - INITIALIZING
✅ Stored Credentials: Access Token Found ✅
✅ Validating access token...
✅ Access token is valid
✅ User authenticated: testuser@example.com
✅ Redirecting to user screen
```

---

### Test 2: Logout Functionality

```bash
# Step 1: Open sidebar (click profile icon)

# Step 2: Scroll to bottom

# Step 3: Click "Logout"

# Expected:
✅ Confirmation dialog appears
   "Are you sure you want to logout?"
   [Cancel] [Logout]

# Step 4: Click "Logout"

# Expected Console Output:
✅ AUTH CONTEXT - LOGOUT STARTED
✅ User confirmed logout
✅ User logged out
✅ Redirecting to login screen

# Expected Behavior:
✅ Shows hero/login screen
✅ Cannot access user screens
✅ Tokens cleared from device
✅ Session deleted from database

# Step 5: Verify Database
```

**SQL**:
```sql
-- Before logout: 1+ sessions
SELECT COUNT(*) FROM user_sessions WHERE user_id = 'your-user-id';

-- After logout: 0 sessions
SELECT COUNT(*) FROM user_sessions WHERE user_id = 'your-user-id';
```

---

### Test 3: Token Auto-Refresh

**Manual Test (Advanced)**:
```bash
# Step 1: Login
# Step 2: Wait 1 hour (or change JWT_EXPIRATION to 60000 = 1 minute)
# Step 3: Make API request or reopen app

# Expected:
✅ App detects expired token
✅ Calls refresh endpoint
✅ Gets new access token
✅ User stays logged in
```

**Quick Test (Simulate)**:
```bash
# Step 1: Login
# Step 2: Manually delete access token from SecureStore
#         (In development, add button to delete just access token)
# Step 3: Make API request

# Expected:
✅ 401 error detected
✅ Refresh token used
✅ New access token saved
✅ Request succeeds
```

---

### Test 4: Multiple Device Sessions

```bash
# Step 1: Login from iPhone 13
Email: testuser@example.com
Password: TestPass123!

# Step 2: Login from simulator (different device)
# Or use another physical device

# Step 3: Check database
```

**SQL**:
```sql
SELECT 
  device_info,
  ip_address,
  created_at,
  'Session ' || ROW_NUMBER() OVER (ORDER BY created_at) as session_name
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'testuser@example.com'
ORDER BY created_at DESC;
```

**Expected**:
```
device_info              | ip_address      | created_at          | session_name
iOS 17.5 | iPhone 13     | 103.xxx.xxx.xxx | 2025-10-11 14:00:00 | Session 2
Android 14 | Simulator   | 10.0.2.2        | 2025-10-11 13:30:00 | Session 1
```

---

## Verification Checklist

After all tests, verify:

- [ ] **Login works from iPhone 13**
  ```bash
  Email: testuser@example.com → Password → Home screen
  ```

- [ ] **App refresh maintains login**
  ```bash
  Close app → Reopen → Still logged in ✅
  ```

- [ ] **Console shows auth check**
  ```
  ✅ AUTH CONTEXT - INITIALIZING
  ✅ Access token is valid
  ✅ User authenticated
  ```

- [ ] **Database has session**
  ```sql
  SELECT COUNT(*) FROM user_sessions WHERE device_info LIKE '%iPhone%';
  -- Result: 1+ rows
  ```

- [ ] **Logout works**
  ```bash
  Sidebar → Logout → Confirm → Login screen ✅
  ```

- [ ] **Database session deleted**
  ```sql
  -- After logout, specific session is deleted
  ```

- [ ] **Cannot access protected routes after logout**
  ```bash
  Try navigating to /(user)/*/tabs → Redirected to login ✅
  ```

- [ ] **Hero screen redirects authenticated users**
  ```bash
  Logged in → Open / → Auto-redirect to home ✅
  ```

---

## Expected Console Output (Complete Flow)

### 1. App Start (Not Logged In)

```
╔═══════════════════════════════════════════╗
║      AUTH CONTEXT - INITIALIZING         ║
╚═══════════════════════════════════════════╝
🔍 Checking authentication status...
-------------------------------------------
📱 Stored Credentials:
  Access Token: Not found ❌
  Refresh Token: Not found ❌
  User Data: Not found ❌
-------------------------------------------
❌ No stored credentials - user not authenticated
═══════════════════════════════════════════
```

---

### 2. Login

```
╔═══════════════════════════════════════════╗
║      PASSWORD SCREEN - LOGIN STARTED      ║
╚═══════════════════════════════════════════╝
📧 Email: testuser@example.com
🔑 Password: •••••••••
-------------------------------------------
📱 COLLECTING DEVICE INFORMATION
📱 Device: iOS 17.5 | iPhone 13
🌐 IP Address: 103.xxx.xxx.xxx
-------------------------------------------
╔═══════════════════════════════════════════╗
║      AUTH CONTEXT - LOGIN STARTED         ║
╚═══════════════════════════════════════════╝
✅ Login successful via AuthContext
✅ Auth context updated - user logged in
👤 User ID: abc-123-...
═══════════════════════════════════════════
```

---

### 3. App Restart (Logged In)

```
╔═══════════════════════════════════════════╗
║      AUTH CONTEXT - INITIALIZING         ║
╚═══════════════════════════════════════════╝
🔍 Checking authentication status...
-------------------------------------------
📱 Stored Credentials:
  Access Token: Found ✅
  Refresh Token: Found ✅
  User Data: Found ✅
-------------------------------------------
🔐 Validating access token...
✅ Access token is valid
👤 User authenticated: testuser@example.com
-------------------------------------------
🔍 Route Protection Check:
  Current segments: ["index"]
  In auth group: false
  In user group: false
  Is authenticated: true
-------------------------------------------
✅ Authenticated - redirecting to user screen
═══════════════════════════════════════════
```

---

### 4. Token Refresh (After 1 Hour)

```
⚠️  Access token expired - attempting refresh...
[AuthService] Refreshing access token...
-------------------------------------------
🔄 REFRESH TOKEN REQUEST
  Refresh Token: Z8AxWUu... (first 50 chars)
-------------------------------------------
✅ NEW ACCESS TOKEN RECEIVED
  New Token: eyJhbGci... (first 50 chars)
  Expires In: 3600000 ms (60 minutes)
-------------------------------------------
💾 Tokens saved to SecureStore
✅ Token refreshed successfully
```

---

### 5. Logout

```
╔═══════════════════════════════════════════╗
║      AUTH CONTEXT - LOGOUT STARTED        ║
╚═══════════════════════════════════════════╝
🚪 User confirmed logout
✅ User logged out
🔄 Redirecting to login screen
═══════════════════════════════════════════
```

---

## Database Verification Queries

### Check Active Sessions

```sql
SELECT 
  u.email,
  u.username,
  us.device_info,
  us.ip_address,
  us.created_at,
  us.last_used_at,
  us.expires_at,
  CASE 
    WHEN us.expires_at > NOW() THEN 'Active'
    ELSE 'Expired'
  END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC;
```

---

### Count Sessions Per User

```sql
SELECT 
  u.email,
  u.username,
  COUNT(us.id) as active_sessions
FROM users u
LEFT JOIN user_sessions us ON u.id = us.user_id AND us.expires_at > NOW()
GROUP BY u.id, u.email, u.username
ORDER BY active_sessions DESC;
```

---

### Find iPhone Sessions

```sql
SELECT 
  u.email,
  us.device_info,
  us.ip_address,
  us.created_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.device_info LIKE '%iPhone%'
ORDER BY us.created_at DESC;
```

---

## Success Indicators

### ✅ Everything Works When:

1. **Login creates session**:
   ```sql
   SELECT device_info FROM user_sessions ORDER BY created_at DESC LIMIT 1;
   -- Result: "iOS 17.5 | iPhone 13"
   ```

2. **App restart restores session**:
   ```
   Console shows: "Access token is valid"
   ```

3. **Logout deletes session**:
   ```sql
   -- Session count decreases by 1
   ```

4. **Protected routes work**:
   ```
   Not logged in + try to access /(user)/* → Redirected to login
   Logged in + on /(auth)/* → Redirected to home
   ```

5. **No route flashing**:
   ```
   Loading screen → Smooth transition → Correct screen
   ```

---

## Common Issues & Solutions

### Issue: "User logged out immediately after login"

**Cause**: Auth context not detecting login

**Check**:
```typescript
// In password.tsx
await login(email, password);  // Should update AuthContext
```

**Solution**: Ensure using `login` from `useAuth()`, not `authService.login()`

---

### Issue: "App shows loading screen forever"

**Cause**: `isLoading` never set to `false`

**Check**:
```typescript
// In AuthContext
setIsLoading(false);  // Must be in finally block
```

**Solution**: Check for errors in `checkAuthStatus()`

---

### Issue: "Tokens not persisting after restart"

**Cause**: SecureStore not working

**Check**:
```typescript
const token = await SecureStore.getItemAsync('accessToken');
console.log('Stored token:', token);
```

**Solution**: SecureStore requires device/simulator permissions

---

## Final Test Script

```bash
#!/bin/bash

echo "Testing Authentication Persistence..."
echo ""

# Test 1: Login
echo "1️⃣  Login from iPhone 13"
echo "   - Enter email and password"
echo "   - Should navigate to home screen"
echo "   - Press Enter when complete..."
read

# Test 2: Close and Reopen
echo ""
echo "2️⃣  Close and Reopen App"
echo "   - Close app completely"
echo "   - Reopen app"
echo "   - Should stay logged in"
echo "   - Press Enter when complete..."
read

# Test 3: Check Database
echo ""
echo "3️⃣  Checking Database..."
echo ""
psql 'your-connection-string' -c "
SELECT 
  u.email,
  us.device_info,
  us.ip_address,
  CASE 
    WHEN us.expires_at > NOW() THEN 'Active ✅'
    ELSE 'Expired ❌'
  END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.created_at > NOW() - INTERVAL '5 minutes'
ORDER BY us.created_at DESC;
"

# Test 4: Logout
echo ""
echo "4️⃣  Test Logout"
echo "   - Open sidebar"
echo "   - Click logout"
echo "   - Confirm logout"
echo "   - Should show login screen"
echo "   - Press Enter when complete..."
read

# Test 5: Verify Session Deleted
echo ""
echo "5️⃣  Verify Session Deleted..."
echo ""
psql 'your-connection-string' -c "
SELECT COUNT(*) as active_sessions
FROM user_sessions
WHERE expires_at > NOW();
"

echo ""
echo "✅ All tests complete!"
echo ""
```

---

**Run this test suite to verify everything works correctly!**

