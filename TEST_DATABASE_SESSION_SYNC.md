# Test: Database Session Synchronization

## Quick Test (2 Minutes)

This test verifies that deleting a session from the database immediately logs out the mobile app.

---

## Prerequisites

1. Backend running: `docker-compose up`
2. Mobile app running on iPhone
3. Database access (Neon PostgreSQL)

---

## Test Steps

### Step 1: Login from iPhone

1. Open BharathVA mobile app
2. Enter email and password
3. Login successfully
4. Note the console output with session details

**Expected Console Output**:
```
╔═══════════════════════════════════════════╗
║      PASSWORD SCREEN - LOGIN STARTED      ║
╚═══════════════════════════════════════════╝
📧 Email: testuser@example.com
🔑 Password Length: 12 characters
-------------------------------------------
📱 COLLECTING DEVICE INFORMATION
-------------------------------------------
  📱 Device: iOS 17.5 | iPhone 13
  🌐 IP Address: 103.xxx.xxx.xxx
-------------------------------------------
✅ LOGIN SUCCESSFUL
-------------------------------------------
  User ID: abc-123-...
  Email: testuser@example.com
  Username: testuser123
-------------------------------------------
  🔑 Tokens Received:
  Access Token (JWT): eyJhbGci...
  Refresh Token: Z8AxWUu...
-------------------------------------------
  💾 Tokens saved to SecureStore
  📊 Session created in database!
-------------------------------------------
```

---

### Step 2: Verify Session in Database

Connect to Neon database and check:

```sql
SELECT 
    id,
    device_info,
    ip_address,
    created_at,
    last_used_at,
    expires_at
FROM user_sessions 
WHERE device_info LIKE '%iPhone%'
ORDER BY created_at DESC;
```

**Expected Result**:
```
id                  | abc-session-123-...
device_info         | iOS 17.5 | iPhone 13
ip_address          | 103.xxx.xxx.xxx
created_at          | 2025-10-11 14:30:00
last_used_at        | 2025-10-11 14:30:00
expires_at          | 2025-10-18 14:30:00 (7 days later)
```

---

### Step 3: Keep App Running (Don't Close)

**Action**: Leave the app open on home screen

**Expected**: App works perfectly - can scroll, interact, etc.

---

### Step 4: Delete Session from Database

**While app is still open**, run this SQL:

```sql
DELETE FROM user_sessions 
WHERE device_info LIKE '%iPhone%';
```

**Verify deletion**:
```sql
SELECT COUNT(*) FROM user_sessions 
WHERE device_info LIKE '%iPhone%';
```

**Expected**: `0` (session deleted)

---

### Step 5: Try Using the App (While Still Open)

**Actions**:
- Try to scroll
- Try to click on settings
- Try to access protected endpoints

**Expected**:
- ✅ App might still appear to work (using local tokens)
- ❌ Any API call to backend will fail (no session in DB)

**Backend Log**:
```
❌ Token validation failed - no active session in database
❌ User abc-123-... - session deleted
```

---

### Step 6: Close and Reopen App

**Actions**:
1. Double-tap home button
2. Swipe up to close BharathVA app completely
3. Wait 2 seconds
4. Tap to reopen BharathVA

---

### Step 7: Observe Behavior (CRITICAL TEST)

**Expected Behavior** (FIXED):

```
App Opens
   ↓
Loading screen appears
   ↓
AuthContext checks tokens
   ↓
Finds stored tokens in SecureStore ✅
   ↓
Calls /auth/validate with access token
   ↓
Backend checks:
  - JWT signature: ✅ Valid
  - JWT expiration: ✅ Not expired
  - Database session: ❌ NOT FOUND (count = 0)
   ↓
Backend returns: { valid: false }
   ↓
Mobile detects invalid token
   ↓
Attempts to refresh using refresh token
   ↓
Backend checks database for refresh token
   ↓
Refresh token NOT FOUND (session deleted)
   ↓
Refresh fails
   ↓
Mobile clears all tokens from SecureStore
   ↓
Redirects to login screen ✅
```

---

### Step 8: Verify Console Logs

**Mobile Console (Expected)**:
```
╔═══════════════════════════════════════════╗
║    AUTH CONTEXT - INITIALIZING            ║
╚═══════════════════════════════════════════╝
Stored Credentials:
  Access Token: Found ✅
  Refresh Token: Found ✅
  User Data: Found ✅
-------------------------------------------
Validating access token...
Calling: POST /auth/validate
-------------------------------------------
❌ VALIDATION FAILED
Response: { valid: false }
Reason: No active session in database
-------------------------------------------
Attempting to refresh token...
Calling: POST /auth/refresh
Body: { refreshToken: "Z8AxWUu..." }
-------------------------------------------
❌ REFRESH FAILED
Response: { success: false, message: "Invalid or expired refresh token" }
Reason: Session deleted from database
-------------------------------------------
Clearing tokens from SecureStore...
Access Token: Deleted ✅
Refresh Token: Deleted ✅
User Data: Deleted ✅
-------------------------------------------
Redirecting to login screen...
-------------------------------------------
```

**Backend Console (Expected)**:
```
===========================================
Token validation request received
Validating token with database session check
Token to validate: eyJhbGci...
===========================================
Step 1: JWT Validation
✅ JWT signature valid
✅ JWT not expired
User ID extracted: abc-123-...
-------------------------------------------
Step 2: Database Session Check
Checking active sessions for user: abc-123-...
SELECT COUNT(*) FROM user_sessions WHERE user_id = 'abc-123-...' AND expires_at > NOW()
Query result: 0 active session(s)
❌ No active session found in database
-------------------------------------------
❌ Token validation: INVALID
Reason: Session was deleted from database
===========================================

===========================================
Token refresh request received
Processing refresh token request
Refresh token: Z8AxWUu...
-------------------------------------------
Checking database for refresh token...
SELECT * FROM user_sessions WHERE refresh_token = 'Z8AxWUu...' AND expires_at > NOW()
Query result: 0 rows (session deleted)
-------------------------------------------
❌ Invalid or expired refresh token
===========================================
```

---

## Additional Test Cases

### Test Case 1: Delete User (CASCADE)

```sql
-- Delete user - should cascade to sessions
DELETE FROM users WHERE email = 'testuser@example.com';
```

**Expected**:
```sql
-- Verify sessions also deleted (CASCADE)
SELECT COUNT(*) FROM user_sessions 
WHERE user_id IN (SELECT id FROM users WHERE email = 'testuser@example.com');

-- Result: 0 (cascaded delete)
```

**Mobile**: ✅ Logged out on next open

---

### Test Case 2: Multiple Devices, Delete One

**Setup**:
```
iPhone session ID: abc-111-...
Android session ID: abc-222-...
```

**Action**:
```sql
DELETE FROM user_sessions WHERE id = 'abc-111-...';
```

**Expected**:
- iPhone: ✅ Logged out (session deleted)
- Android: ✅ Still works (session exists)

---

### Test Case 3: Logout All Other Sessions

**Setup**:
```
Device A: Session 1 (current)
Device B: Session 2
Device C: Session 3
```

**Action**: From Device A, click "Logout all other devices"

**Backend API**:
```
POST /auth/sessions/logout-all-other
Authorization: Bearer <device-a-token>
```

**Backend Logic**:
```java
// Keeps first (current) session, deletes others
List<UserSession> allSessions = findActiveSessionsByUserId(userId);
allSessions.stream().skip(1).forEach(delete);
```

**Expected**:
- Device A: ✅ Still works (session 1 kept)
- Device B: ✅ Logged out (session 2 deleted)
- Device C: ✅ Logged out (session 3 deleted)

---

### Test Case 4: Session Expiry

**Setup**:
```sql
-- Manually expire a session (for testing)
UPDATE user_sessions 
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE id = 'session-id';
```

**Action**: Reopen mobile app

**Expected**:
```
Database query:
SELECT COUNT(*) FROM user_sessions 
WHERE user_id = 'user-id' 
AND expires_at > NOW();

Result: 0 (expired)
   ↓
Validation fails
   ↓
Mobile logs out ✅
```

---

## Success Criteria

### ✅ Database-Mobile Sync Verified

- [ ] Delete session → App logs out immediately
- [ ] Delete user → All sessions deleted, app logs out
- [ ] Logout device → That device can't access app
- [ ] Expired session → App logs out
- [ ] Valid session → App works normally

---

### ✅ Backend Logs Show

- [ ] "Token validation request received"
- [ ] "Validating token with database session check"
- [ ] "JWT signature and expiration: VALID"
- [ ] "Checking active sessions for user"
- [ ] "No active session in database" (when deleted)
- [ ] "Token validation: INVALID"

---

### ✅ Mobile Logs Show

- [ ] "AUTH CONTEXT - INITIALIZING"
- [ ] "Validating access token..."
- [ ] "Validation failed"
- [ ] "Attempting to refresh token..."
- [ ] "Refresh failed"
- [ ] "Clearing tokens from SecureStore..."
- [ ] "Redirecting to login screen..."

---

## Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│ Mobile App                                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  App Opens                                               │
│     ↓                                                    │
│  Check SecureStore                                       │
│     ↓                                                    │
│  Tokens Found? ─────────────────────┐                   │
│     ↓                                │                   │
│    Yes                              No                   │
│     ↓                                ↓                   │
│  Call /auth/validate            Show Login               │
│     ↓                                                    │
│  Backend validates                                       │
│     ├─ Check JWT ✅                                      │
│     └─ Check DB Session                                  │
│           ↓                                              │
│      ┌────┴────┐                                         │
│      │         │                                         │
│   Found    Not Found                                     │
│      │         │                                         │
│      ↓         ↓                                         │
│   Valid    Invalid                                       │
│      │         │                                         │
│      ↓         ↓                                         │
│   Login    Try Refresh                                   │
│   Screen       ↓                                         │
│           Check DB                                       │
│                ↓                                         │
│           ┌────┴────┐                                    │
│           │         │                                    │
│        Found    Not Found                                │
│           │         │                                    │
│           ↓         ↓                                    │
│      New Token  Clear Tokens                             │
│           │         │                                    │
│           ↓         ↓                                    │
│      Stay Login  Login Screen                            │
│      Logged In                                           │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Database State                                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  user_sessions table                                     │
│  ┌────────────────────────────────────────┐            │
│  │ id | user_id | refresh_token | ...     │            │
│  ├────────────────────────────────────────┤            │
│  │ Session exists → Validation: ✅        │            │
│  │ Session deleted → Validation: ❌       │            │
│  │ Session expired → Validation: ❌       │            │
│  └────────────────────────────────────────┘            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: App still works after deletion

**Possible Causes**:
1. Backend not rebuilt
2. Backend not restarted
3. Wrong session deleted
4. App using cached state

**Solution**:
```bash
# 1. Rebuild and restart backend
docker-compose down
docker-compose build auth-service
docker-compose up

# 2. Completely close mobile app
# 3. Delete session from database
# 4. Reopen mobile app
```

---

### Issue: Validation not logging

**Check**:
```bash
# View backend logs
docker-compose logs -f auth-service | grep "Token validation"
```

**Expected**:
```
Token validation request received
Validating token with database session check
```

---

### Issue: Database query slow

**Check indexes**:
```sql
SELECT * FROM pg_indexes 
WHERE tablename = 'user_sessions';
```

**Expected indexes**:
- `idx_user_sessions_user_id`
- `idx_user_sessions_expires_at`
- `idx_user_sessions_user_active`

---

## Run Complete Test

```bash
# Terminal 1: Start backend
cd backend
docker-compose up

# Terminal 2: Monitor backend logs
docker-compose logs -f auth-service

# Terminal 3: Database operations
psql 'your-neon-connection-string'

# iPhone: Open BharathVA app
# 1. Login
# 2. Note session ID
# 3. Delete session from Terminal 3
# 4. Close app
# 5. Reopen app
# Expected: ✅ Login screen
```

---

**Test Complete! Database and mobile are now perfectly synchronized. 🎉**

