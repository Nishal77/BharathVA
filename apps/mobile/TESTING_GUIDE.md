# Testing Guide: Notification Count Reset & Token Refresh

## 🧪 How to Test the Fixes

### 1. Test Notification Count Reset

**What to test:** Count should reset to 0 when visiting notifications tab

**Steps:**
1. Open the app and navigate to any tab (Home, Search, etc.)
2. Check the notification badge count (should show a number if you have unread notifications)
3. Navigate to the **Notifications tab**
4. **Expected Result:**
   - Count should immediately become **0** (disappears instantly)
   - Count should stay at **0** even when you navigate away
   - Count should only increase when new notifications arrive (via WebSocket)

**What to look for in logs:**
```
📬 Entering notifications tab - instantly resetting count to 0
🔄 Resetting notification count to 0 (optimistic update)
✅ Count reset protection window ended, allowing new notifications only
```

**If it's working:**
- ✅ Count disappears immediately when you tap notifications tab
- ✅ Count stays at 0 when you go to other tabs
- ✅ Count only increases when new notifications arrive

**If it's NOT working:**
- ❌ Count doesn't reset to 0
- ❌ Count restores to old value after a few seconds
- ❌ Count increases even without new notifications

---

### 2. Test Token Refresh (markAllAsRead)

**What to test:** Token should refresh automatically and endpoint should work

**Steps:**
1. Open the app and navigate to **Notifications tab**
2. Wait for notifications to load
3. The app should automatically try to mark all as read
4. **Expected Result:**
   - No 500 errors in console
   - No "No static resource auth/api/feed/..." errors
   - Request should succeed (even if token was expired)

**What to look for in logs:**
```
[NotificationService] Marking all notifications as read
[NotificationService] API Request {"method": "PUT", "url": "http://192.168.0.121:8080/api/feed/notifications/read-all"}
[NotificationService] API Response: 200 (XXXms)
✅ All notifications marked as read successfully
```

**If token refresh happens:**
```
[NotificationService] Authentication failed (401) - attempting token refresh
Token refreshed successfully, verifying token is saved before retry
Token verified in SecureStore (new token different from old), proceeding with retry
Retrying markAllAsRead with refreshed token
✅ All notifications marked as read successfully after token refresh
```

**If it's working:**
- ✅ No 500 errors
- ✅ No wrong URL errors
- ✅ Request succeeds (200 status)
- ✅ Token refresh happens automatically if needed

**If it's NOT working:**
- ❌ 500 error: "No static resource auth/api/feed/..."
- ❌ 401 error persists after refresh
- ❌ Wrong URL in logs (has `/api/auth/api/feed/...`)

---

### 3. Test Endpoint URL

**What to test:** Verify the endpoint URL is correct

**Steps:**
1. Open the app and navigate to **Notifications tab**
2. Check the console logs
3. Look for the API request log

**Expected URL:**
```
✅ CORRECT: http://192.168.0.121:8080/api/feed/notifications/read-all
```

**Wrong URLs (should NOT appear):**
```
❌ WRONG: http://192.168.0.121:8080/api/auth/api/feed/notifications/read-all
❌ WRONG: http://192.168.0.121:8080/api/auth/notifications/read-all
```

**What to look for in logs:**
```
[NotificationService] API Request {"method": "PUT", "url": "http://192.168.0.121:8080/api/feed/notifications/read-all"}
```

---

### 4. Test Token Storage & Refresh

**What to test:** Verify tokens are saved correctly in SecureStore

**Steps:**
1. Open the app and let it run for a while (let token expire)
2. Navigate to **Notifications tab**
3. Check logs for token refresh flow

**What to look for in logs:**
```
Token refreshed successfully, verifying token is saved before retry
Token verified in SecureStore (new token different from old), proceeding with retry
Using token {"tokenPrefix": "eyJhbGciOiJIUzI1NiJ9..."}
```

**If it's working:**
- ✅ Token refresh happens automatically
- ✅ New token is verified before retry
- ✅ Retry uses new token (different from old one)
- ✅ Request succeeds with new token

**If it's NOT working:**
- ❌ "Token not saved to SecureStore after refresh"
- ❌ "Token exists but may not be updated yet" (repeats 5 times)
- ❌ Retry still uses old token (401 error persists)

---

### 5. Complete End-to-End Test

**Full flow test:**

1. **Start with unread notifications:**
   - Have at least 2-3 unread notifications
   - Notification badge should show count > 0

2. **Navigate to notifications tab:**
   - Tap on notifications tab
   - Count should immediately become 0
   - Notifications should load

3. **Check markAllAsRead:**
   - Should automatically mark all as read
   - No errors in console
   - Backend should receive the request

4. **Navigate away and back:**
   - Go to Home tab
   - Count should stay at 0
   - Go back to notifications tab
   - Count should still be 0

5. **Test with new notification:**
   - Have someone send you a notification (or create one)
   - Count should increase from 0 to 1
   - Navigate to notifications tab
   - Count should reset to 0 again

---

## 🔍 Debugging Commands

### Check Current Token
Add this to your code temporarily to see the token:
```typescript
const token = await SecureStore.getItemAsync('accessToken');
console.log('Current token:', token?.substring(0, 50) + '...');
```

### Check Token Refresh
Look for these log patterns:
- `Token refreshed successfully` - Refresh succeeded
- `Token verified in SecureStore` - Token saved
- `Retrying markAllAsRead with refreshed token` - Retry happening
- `All notifications marked as read successfully after token refresh` - Success!

### Check Count Reset
Look for these log patterns:
- `📬 Entering notifications tab - instantly resetting count to 0`
- `🔄 Resetting notification count to 0 (optimistic update)`
- `🔒 Keeping count at 0 (user visited notifications tab, no new notifications)`
- `✅ Count reset protection window ended, allowing new notifications only`

---

## ✅ Success Criteria

**All tests pass if:**
1. ✅ Count resets to 0 immediately when visiting notifications tab
2. ✅ Count stays at 0 when navigating away
3. ✅ No 500 errors for markAllAsRead
4. ✅ Correct endpoint URL (no double `/api/` path)
5. ✅ Token refresh works automatically
6. ✅ New token is verified before retry
7. ✅ Count only increases with new notifications

---

## 🐛 Common Issues & Solutions

### Issue: Count doesn't reset to 0
**Solution:** Check if `resetCount()` is being called in `useFocusEffect`

### Issue: 500 error "No static resource auth/api/feed/..."
**Solution:** Already fixed - using `apiRequest` instead of `apiCall`

### Issue: 401 error persists after refresh
**Solution:** Check token verification logs - token might not be saving correctly

### Issue: Count restores to old value
**Solution:** Check protection window logs - might need to increase `RESET_PROTECTION_DURATION`

---

## 📝 Quick Test Checklist

- [ ] Count resets to 0 when visiting notifications tab
- [ ] Count stays at 0 when navigating away
- [ ] markAllAsRead endpoint works (no 500 errors)
- [ ] Correct URL in logs (no double `/api/`)
- [ ] Token refresh works automatically
- [ ] New token is verified before retry
- [ ] Count only increases with new notifications


