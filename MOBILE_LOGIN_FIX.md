# Mobile Login Fix - Device Info & Session Storage

## Problem Identified

The React Native mobile app was NOT calling the actual login API. Instead, it had mock/simulated login code that just navigated to the next screen without making the actual API call to the backend.

### Root Cause

**In `apps/mobile/app/(auth)/password.tsx`:**
```typescript
// OLD CODE - Mock login (no API call)
const handleLogin = async () => {
  setIsLoading(true);
  setTimeout(() => {
    setIsLoading(false);
    router.push('/(user)/123/(tabs)');
  }, 1500);
};
```

This means:
- No API call to backend
- No device info sent
- No IP address sent
- No session created in `user_sessions` table
- User entry created in `users` table (probably from registration), but no login session

## Solution Implemented

### 1. Fixed Password Screen - Actual Login

**File: `apps/mobile/app/(auth)/password.tsx`**

```typescript
// NEW CODE - Real login with device info
const handleLogin = async () => {
  try {
    console.log('[PasswordScreen] Attempting login with email:', email);
    
    // Call actual login API with device info and IP address
    const loginResponse = await authService.login(email, password);
    
    // Navigate to user's home screen
    router.replace(`/(user)/${loginResponse.userId}/(tabs)`);
    
    Alert.alert(
      'Welcome Back!',
      `Login successful! Welcome, @${loginResponse.username}`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      Alert.alert('Login Failed', error.message);
    }
  }
};
```

### 2. Fixed Login Screen - Email Passing

**File: `apps/mobile/app/(auth)/login.tsx`**

```typescript
// Navigate to password screen WITH email parameter
router.push({
  pathname: '/(auth)/password',
  params: { email: email.toLowerCase().trim() }
});
```

### 3. What Now Happens

When you login from your iPhone 13:

1. **Login Screen**: Enter email → Press Next
2. **Password Screen**: Enter password → Press Login
3. **Backend Receives**:
   - Email and password
   - `X-Device-Info`: "iOS 17.5 | iPhone 13"
   - `X-IP-Address`: Your actual public IP
4. **Database Updates**:
   - ✅ `users` table: User already exists (from registration)
   - ✅ `user_sessions` table: NEW session created with:
     - `id`: UUID (session ID)
     - `user_id`: UUID (references users.id)
     - `refresh_token`: Unique token
     - `ip_address`: Your iPhone's public IP
     - `device_info`: "iOS 17.5 | iPhone 13"
     - `created_at`, `last_used_at`, `expires_at`: Timestamps

## How Device Info is Collected

**File: `apps/mobile/services/api/deviceInfoService.ts`**

```typescript
// For iOS devices
deviceString = `iOS ${osVersion} | ${modelName}`;
// Example: "iOS 17.5 | iPhone 13"

// Collects public IP
const response = await fetch('https://api.ipify.org?format=json');
const data = await response.json();
return data.ip; // Your actual public IP
```

**File: `apps/mobile/services/api/authService.ts`**

```typescript
login: async (email: string, password: string) => {
  // Collect device info automatically
  const { deviceInfo, ipAddress } = await deviceInfoService.getFullDeviceInfo();
  
  // Send to backend with custom headers
  const response = await apiCall(
    ENDPOINTS.AUTH.LOGIN,
    'POST',
    { email, password },
    false,
    {
      'X-Device-Info': deviceInfo,
      'X-IP-Address': ipAddress,
    }
  );
  
  // Save tokens
  await tokenManager.saveTokens(
    response.data.accessToken, 
    response.data.refreshToken
  );
  
  return response.data;
}
```

## Testing from iPhone 13

### Step 1: Start Backend
```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose up
```

### Step 2: Open Expo App on iPhone
1. Open Expo Go app
2. Scan QR code from terminal
3. Wait for app to load

### Step 3: Login with Existing User
1. Navigate to Login screen
2. Enter email: `testuser@example.com`
3. Press "Next"
4. Enter password: `TestPass123!`
5. Press "Log in"

### Step 4: Verify in Database

Run this SQL query in your Neon database:

```sql
-- Check user_sessions table
SELECT 
    us.id as session_id,
    us.user_id,
    u.email,
    u.username,
    us.ip_address,
    us.device_info,
    us.created_at,
    us.last_used_at,
    us.expires_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'testuser@example.com'
ORDER BY us.created_at DESC;
```

**Expected Results:**
- `device_info`: "iOS 17.5 | iPhone 13"
- `ip_address`: Your actual iPhone's public IP
- `user_id`: Valid UUID matching user's ID
- All timestamps populated correctly

## Why Script Works But App Didn't

**Script (`TEST_LOGIN_AND_SESSIONS.sh`):**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{"email":"...","password":"..."}'
```
- ✅ Sends `X-Device-Info` header
- ✅ Sends `X-IP-Address` header
- ✅ Creates session in database

**Old Mobile App:**
```typescript
// Just navigated to next screen - NO API CALL!
setTimeout(() => {
  router.push('/(user)/123/(tabs)');
}, 1500);
```
- ❌ No API call to backend
- ❌ No device info sent
- ❌ No session created in database

**Fixed Mobile App:**
```typescript
// Makes actual API call with device info
const loginResponse = await authService.login(email, password);
```
- ✅ Calls backend login API
- ✅ Automatically collects device info via `deviceInfoService`
- ✅ Sends `X-Device-Info` and `X-IP-Address` headers
- ✅ Creates session in database

## Files Modified

1. **`apps/mobile/app/(auth)/login.tsx`**
   - Added email validation
   - Passes email to password screen via URL params

2. **`apps/mobile/app/(auth)/password.tsx`**
   - Added imports for `authService` and `ApiError`
   - Gets email from URL params
   - Calls actual `authService.login()` API
   - Handles errors properly
   - Navigates to correct user screen on success

## Next Steps

1. **Rebuild Mobile App**: The changes are in TypeScript, so the app should hot-reload
2. **Test Login**: Login from your iPhone 13 with existing credentials
3. **Verify Database**: Check that session appears in `user_sessions` table
4. **View Active Devices**: Navigate to Active Devices screen to see your iPhone session

## Troubleshooting

### Issue: "Email not found" error
**Solution**: Make sure you're coming from the login screen (not directly to password screen)

### Issue: Device info shows "Unknown"
**Solution**: Make sure you've granted the app network permissions

### Issue: IP address shows "Unknown"
**Solution**: Check network connectivity - ipify API might be blocked

### Issue: Session not appearing in database
**Solution**: Check backend logs for any errors during session creation:
```bash
docker-compose logs auth-service | grep "SESSION SAVED"
```

## Success Indicators

When login works correctly from your iPhone 13:

1. **Console Logs (Mobile)**:
   ```
   [AuthService] Collecting device information...
   [AuthService] Device Info: iOS 17.5 | iPhone 13
   [AuthService] IP Address: 103.xxx.xxx.xxx
   [AuthService] Login successful, tokens saved
   ```

2. **Console Logs (Backend)**:
   ```
   ✅ LOGIN SUCCESSFUL - SESSION CREATED
   Session ID: yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
   User ID (FK): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   IP Address: 103.xxx.xxx.xxx
   Device Info: iOS 17.5 | iPhone 13
   Total active sessions: 1
   ```

3. **Database Check**:
   ```sql
   SELECT * FROM user_sessions WHERE device_info LIKE '%iPhone 13%';
   ```
   Should return your session with correct device info and IP.

## Summary

The issue was that the mobile app had placeholder/mock login code that didn't make actual API calls. Now it properly:

1. Collects device information (iOS version, model)
2. Fetches public IP address
3. Sends both to backend in custom headers
4. Backend creates session with device info
5. Session is stored in `user_sessions` table with foreign key to `users`

Your iPhone 13 login will now create proper sessions just like the script does!

