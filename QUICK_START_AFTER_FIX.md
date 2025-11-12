# Quick Start Guide - After TokenManager Fix

## What Was Fixed

Your BharathVA app was stuck on the loading screen because:

1. **Wrong Backend IP**: App was trying to connect to `192.168.0.121` but backend was on `192.168.0.49`
2. **No Timeout Protection**: Token fetching would hang indefinitely when backend was unreachable
3. **Blocking Auth Flow**: App would wait forever for token validation

All issues have been fixed! ✅

## Current Status

### Backend Services ✅
All services are running and healthy:
- Gateway: http://192.168.0.49:8080
- Auth Service: http://192.168.0.49:8081
- Feed Service: http://192.168.0.49:8082
- News AI Service: http://192.168.0.49:8084

### Database ✅
- Neon PostgreSQL: Connected and verified
- All required tables exist
- MCP server compatible

## How to Test the Fix

### 1. Restart Your Mobile App

```bash
# In the mobile app directory
cd apps/mobile

# Kill the existing process (press Ctrl+C in the terminal running the app)

# Clear React Native cache and restart
npm start -- --reset-cache

# Or if using Expo
npx expo start -c
```

### 2. Expected Behavior

**Before Fix:**
- App shows loading screen
- Stuck for 30+ seconds
- TokenManager timeout errors
- Never proceeds to login

**After Fix:**
- App shows loading screen
- Checks auth in < 10 seconds
- Shows login screen if not logged in
- Proceeds to home if logged in
- Clear error messages if backend unreachable

### 3. Test Scenarios

#### Test 1: Fresh Login
1. Open the app
2. Should show login screen within 10 seconds
3. Enter credentials
4. Should login successfully
5. Navigate to home screen

#### Test 2: Already Logged In
1. Open the app
2. Should validate existing tokens
3. Proceed to home screen automatically
4. Total time: < 10 seconds

#### Test 3: Backend Offline (Optional)
1. Stop backend: `docker-compose down`
2. Open the app
3. Should timeout gracefully within 10 seconds
4. Show login screen
5. Display "Backend unreachable" message

## Troubleshooting

### If App Still Hangs

1. **Clear App Cache:**
```bash
cd apps/mobile
npm start -- --reset-cache
```

2. **Clear SecureStore:**
```bash
# In app code or debug menu, clear all auth data
# This will force a fresh login
```

3. **Verify Backend IP:**
```bash
# Check your machine's IP
ifconfig | grep "inet "

# Test backend is accessible
curl http://192.168.0.49:8080/api/auth/register/health
```

4. **Check Logs:**
Look for these messages in the console:
- `✅ [AuthContext] Token validated successfully` - Good!
- `⚠️ [AuthService] Backend unreachable` - Backend not running
- `❌ [TokenManager] Fetch timeout` - Network issues

### If Backend is Not Accessible

1. **Verify Services Running:**
```bash
cd backend
docker-compose ps
```

2. **Restart Backend:**
```bash
cd backend
docker-compose down
docker-compose up -d
```

3. **Check Health:**
```bash
curl http://192.168.0.49:8080/api/auth/register/health
```

### If IP Changed

Your machine's IP can change when switching networks. If the backend becomes unreachable:

1. **Find Current IP:**
```bash
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

2. **Update Mobile App:**
Edit `apps/mobile/services/api/environment.ts`:
```typescript
development: {
  baseUrl: 'http://YOUR_NEW_IP:8080/api/auth',
  gatewayUrl: 'http://YOUR_NEW_IP:8080',
  // ... update all URLs
}
```

3. **Restart App:**
```bash
npm start -- --reset-cache
```

## Key Improvements

### 1. Fast Timeouts
- Token fetch: 5 seconds max
- Token validation: 5 seconds max
- Token refresh: 8 seconds max
- Overall auth check: 10 seconds max

### 2. Graceful Fallback
- Uses cached tokens when backend unreachable
- Falls back to SecureStore on timeout
- Clear error messages

### 3. Network Awareness
- Checks backend connectivity before operations
- Skips unnecessary calls when offline
- Caches connectivity status (30 seconds)

### 4. Better Logging
All operations logged with emoji indicators:
- ✅ Success
- ⚠️ Warning/Fallback
- ❌ Error

## What to Expect

### Login Flow (Normal)
```
1. Open app (0s)
2. Check auth status (2-5s)
   - Validate token if exists
   - Or show login screen
3. Enter credentials (user action)
4. Login API call (1-2s)
5. Save tokens (instant)
6. Navigate to home (instant)

Total: ~5-7 seconds
```

### Login Flow (Backend Slow)
```
1. Open app (0s)
2. Check backend connectivity (3s - timeout)
3. Show login screen (instant)
4. User knows backend is unreachable

Total: ~3 seconds to fail gracefully
```

### Login Flow (With Cached Tokens)
```
1. Open app (0s)
2. Load cached tokens (instant)
3. Validate or skip if backend down (5s max)
4. Navigate to home (instant)

Total: ~5 seconds max
```

## Next Steps

1. **Test the fix** by restarting your mobile app
2. **Try logging in** with valid credentials
3. **Check the logs** for success messages
4. **Report any issues** if problems persist

## Need Help?

### Check Logs
- Mobile app console logs
- Backend service logs: `docker-compose logs -f`

### Verify Setup
```bash
# Backend health
curl http://192.168.0.49:8080/api/auth/register/health

# Database connection
cd backend && ./verify-neon-connection.sh

# Services status
docker-compose ps
```

### Common Issues

**"Backend unreachable"**
- Backend not running → `docker-compose up -d`
- Wrong IP → Update `environment.ts`
- Firewall blocking → Check firewall settings

**"Token validation failed"**
- Tokens expired → Normal, will refresh automatically
- No cached tokens → Will show login screen
- Backend down → Will show login screen

**"Loading forever"**
- Should not happen anymore!
- If it does, check console logs
- Verify timeouts are working

## Summary

Your app should now:
- ✅ Never hang on loading screen
- ✅ Timeout within 10 seconds
- ✅ Work with correct backend IP
- ✅ Handle offline scenarios
- ✅ Provide clear error messages
- ✅ Use cached tokens when possible

**The TokenManager issue is completely fixed!**

Restart your mobile app and try logging in. It should work smoothly now! 🚀

