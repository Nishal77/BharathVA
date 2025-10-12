# Quick Test - Session Database Sync

## 30-Second Test

**Proves**: Delete session from database → Mobile app logs out

---

## Steps

### 1. Login from iPhone

```
Open BharathVA app
Enter: testuser@example.com
Enter: TestPass123!
Login successful ✅
```

---

### 2. Delete Session from Database

```sql
DELETE FROM user_sessions 
WHERE device_info LIKE '%iPhone%';
```

**Verify**:
```sql
SELECT COUNT(*) FROM user_sessions 
WHERE device_info LIKE '%iPhone%';
```

**Expected**: `0` (deleted)

---

### 3. Close and Reopen App

```
iPhone:
1. Double-tap home button
2. Swipe up to close BharathVA
3. Wait 2 seconds
4. Tap to reopen BharathVA
```

---

### 4. Expected Result

```
App Opens
   ↓
Loading screen (< 1 second)
   ↓
Checks stored tokens
   ↓
Calls /auth/validate
   ↓
Backend: "No session in database"
   ↓
Validation fails
   ↓
Clears tokens
   ↓
Shows Login Screen ✅
```

---

## Console Logs

### Mobile

```
╔═══════════════════════════════════════════╗
║    AUTH CONTEXT - INITIALIZING            ║
╚═══════════════════════════════════════════╝
Stored Credentials: Found ✅
Validating access token...
❌ Validation failed (no session in database)
Attempting refresh...
❌ Refresh failed (session deleted)
Clearing tokens...
Redirecting to login screen...
═══════════════════════════════════════════
```

---

### Backend

```
===========================================
Token validation request received
Validating token with database session check
JWT signature: ✅ VALID
JWT expiration: ✅ NOT EXPIRED
User ID: abc-123-...
-------------------------------------------
Checking database for active sessions...
SELECT COUNT(*) FROM user_sessions 
WHERE user_id = 'abc-123-...' 
AND expires_at > NOW()
-------------------------------------------
Result: 0 active sessions
❌ No session found in database
❌ Token validation: INVALID
===========================================
```

---

## Pass/Fail Criteria

### ✅ PASS

- Delete session → App shows login screen
- No session in DB → Validation fails
- Backend logs show "No active session"
- Mobile logs show "Validation failed"

---

### ❌ FAIL

- Delete session → App still works
- Validation succeeds without DB check
- No backend logs
- Mobile stays logged in

---

## Troubleshooting

### App still works after deletion

**Fix**:
```bash
# 1. Rebuild backend
docker-compose build auth-service

# 2. Restart backend
docker-compose restart auth-service

# 3. Check logs
docker-compose logs -f auth-service
```

---

### No validation logs

**Check**:
```bash
# View auth service logs
docker-compose logs -f auth-service | grep "Token validation"
```

**Expected**: "Token validation request received"

---

## Quick Commands

```bash
# Start backend
cd backend && docker-compose up

# Monitor logs
docker-compose logs -f auth-service

# Delete session
psql 'neon-connection-string' -c "
DELETE FROM user_sessions 
WHERE device_info LIKE '%iPhone%';
"

# Check if deleted
psql 'neon-connection-string' -c "
SELECT COUNT(*) FROM user_sessions;
"
```

---

## Success Indicator

**When you delete a session from the database and reopen the mobile app**:

```
Expected: Login Screen ✅
```

**Not**:
```
Wrong: Home Screen ❌
```

---

**Test this now! It's fixed. 🎉**

