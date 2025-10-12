# Console Logs Quick Reference

## What You'll See When Testing from iPhone 13

### Registration Flow (Complete Output)

```
╔═══════════════════════════════════════════╗
║  AUTO-LOGIN AFTER REGISTRATION STARTED    ║
╚═══════════════════════════════════════════╝
📧 Email: nishal@example.com
🔑 Password Stored: Yes ✅
🔑 Password Length: 9 characters
👤 Username: nishal_pro
-------------------------------------------

===========================================
📱 COLLECTING DEVICE INFORMATION
===========================================
✅ Device Info Collected:
  📱 Device: iOS 17.5 | iPhone 13
  🌐 IP Address: 103.45.67.89
===========================================

===========================================
🔐 LOGIN ATTEMPT STARTED
===========================================
📧 Email: nishal@example.com
🔑 Password: ********
-------------------------------------------
📡 REQUEST HEADERS:
  X-Device-Info: iOS 17.5 | iPhone 13
  X-IP-Address: 103.45.67.89
-------------------------------------------

===========================================
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
===========================================
👤 User Details:
  User ID: abc12345-6789-4def-ghij-klmnopqrstuv
  Email: nishal@example.com
  Username: nishal_pro
-------------------------------------------
🔑 Tokens Received:
  Access Token (JWT): eyJhbGciOiJIUzI1NiJ9...
  Refresh Token: Z8AxWUuHO85vjb-LQXpp...
-------------------------------------------
⏱️  Token Expiry:
  Access Token Expires In: 3600000 ms ( 60 minutes )
  Refresh Token Expires In: 604800000 ms ( 7 days )
-------------------------------------------
💾 Tokens saved to SecureStore
💾 User data saved to SecureStore
-------------------------------------------
📊 Session Details:
  Device Info: iOS 17.5 | iPhone 13
  IP Address: 103.45.67.89
  Session should now be in database!
===========================================

╔═══════════════════════════════════════════╗
║    AUTO-LOGIN SUCCESSFUL!                 ║
╚═══════════════════════════════════════════╝
✅ Registration complete + User logged in
-------------------------------------------
💾 Database Updates:
  ✅ users table: User created
  ✅ user_sessions table: Session created with device info
-------------------------------------------
🚀 Navigating to: /(user)/abc12345-6789-.../(tabs)
═══════════════════════════════════════════
```

---

### Manual Login Flow (Complete Output)

```
╔═══════════════════════════════════════════╗
║      PASSWORD SCREEN - LOGIN STARTED      ║
╚═══════════════════════════════════════════╝
📧 Email: nishal@example.com
🔑 Password Length: 9 characters
🔑 Password: •••••••••
-------------------------------------------

===========================================
📱 COLLECTING DEVICE INFORMATION
===========================================
✅ Device Info Collected:
  📱 Device: iOS 17.5 | iPhone 13
  🌐 IP Address: 103.45.67.89
===========================================

===========================================
🔐 LOGIN ATTEMPT STARTED
===========================================
📧 Email: nishal@example.com
🔑 Password: ********
-------------------------------------------
📡 REQUEST HEADERS:
  X-Device-Info: iOS 17.5 | iPhone 13
  X-IP-Address: 103.45.67.89
-------------------------------------------

===========================================
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
===========================================
👤 User Details:
  User ID: abc12345-6789-4def-ghij-klmnopqrstuv
  Email: nishal@example.com
  Username: nishal_pro
-------------------------------------------
🔑 Tokens Received:
  Access Token (JWT): eyJhbGciOiJIUzI1NiJ9...
  Refresh Token: AI6HKPbZW3s1tjTUFmMw...
-------------------------------------------
💾 Tokens saved to SecureStore
📊 Session Details:
  Device Info: iOS 17.5 | iPhone 13
  IP Address: 103.45.67.89
  Session should now be in database!
===========================================

╔═══════════════════════════════════════════╗
║       LOGIN RESPONSE RECEIVED             ║
╚═══════════════════════════════════════════╝
👤 User Information:
  🆔 User ID: abc12345-6789-4def-ghij-klmnopqrstuv
  📧 Email: nishal@example.com
  👨 Username: nishal_pro
-------------------------------------------
🎫 JWT Access Token:
   eyJhbGciOiJIUzI1NiJ9...
-------------------------------------------
🔄 Refresh Token (Session):
   AI6HKPbZW3s1tjTUFmMw...
-------------------------------------------
✅ Navigating to: /(user)/abc12345-6789-.../(tabs)
═══════════════════════════════════════════
```

---

## Key Values to Check

### From Console Logs

| Field | What to Check | Good Example | Bad Example |
|-------|---------------|--------------|-------------|
| **Email** | Valid email format | `nishal@example.com` | `undefined`, `null` |
| **Password Stored** | Should be "Yes" | `Yes ✅` | `No ❌` |
| **Device Info** | Real device details | `iOS 17.5 \| iPhone 13` | `Unknown \| Unknown Device` |
| **IP Address** | Real public IP | `103.45.67.89` | `Unknown`, `127.0.0.1` |
| **User ID** | Valid UUID | `abc12345-6789-...` | `undefined`, `null`, `user123` |
| **Access Token** | JWT format | `eyJhbGci...` | `undefined`, `null` |
| **Refresh Token** | Base64 string | `Z8AxWUuH...` | `undefined`, `null` |

---

## Quick Copy-Paste Verification

### After Registration (Console Shows Success)

```sql
-- Verify user and session created
SELECT 
  '📧 Email' as field, u.email as value FROM users u WHERE u.created_at > NOW() - INTERVAL '5 minutes'
UNION ALL
SELECT 
  '👤 Username', u.username FROM users u WHERE u.created_at > NOW() - INTERVAL '5 minutes'
UNION ALL
SELECT 
  '📱 Device Info', us.device_info FROM user_sessions us WHERE us.created_at > NOW() - INTERVAL '5 minutes'
UNION ALL
SELECT 
  '🌐 IP Address', us.ip_address FROM user_sessions us WHERE us.created_at > NOW() - INTERVAL '5 minutes'
UNION ALL
SELECT 
  '✅ Session Created', CASE WHEN COUNT(*) > 0 THEN 'Yes' ELSE 'No' END
FROM user_sessions us WHERE us.created_at > NOW() - INTERVAL '5 minutes';
```

---

## Debugging Tips

### If You See "Password Stored: No ❌"

**Problem**: Password wasn't saved during registration

**Check**: Look for this earlier in logs:
```
Creating password
[API] Success: Password created successfully
```

**Fix**: Make sure `handleCreatePassword` is being called

---

### If You See "Device: Unknown | Unknown Device"

**Problem**: expo-device not working

**Check**:
```bash
cd apps/mobile
pnpm list expo-device
```

**Fix**: Reinstall if needed:
```bash
pnpm add expo-device
```

---

### If You See "IP Address: Unknown"

**Problem**: ipify API not reachable

**Test**:
```bash
curl https://api.ipify.org?format=json
```

**Should return**:
```json
{"ip":"103.45.67.89"}
```

---

### If You See "Network request failed"

**Problem**: Can't reach backend

**Check**: Backend running?
```bash
docker ps | grep bharathva-auth
```

**Check**: API URL correct?
```typescript
// apps/mobile/services/api/config.ts
BASE_URL: 'http://192.168.0.9:8080/api/auth'  // Use your Mac's local IP
```

---

## Full Test Output Example

When you successfully register and login from iPhone 13, your Expo console should show:

```
[Full registration flow logs...]

╔═══════════════════════════════════════════╗
║  AUTO-LOGIN AFTER REGISTRATION STARTED    ║
╚═══════════════════════════════════════════╝
📧 Email: nishal@example.com          ← YOUR EMAIL
🔑 Password Stored: Yes ✅             ← PASSWORD SAVED
🔑 Password Length: 9 characters      ← CORRECT LENGTH
👤 Username: nishal_pro               ← YOUR USERNAME
-------------------------------------------
📱 Device: iOS 17.5 | iPhone 13       ← YOUR DEVICE
🌐 IP Address: 103.45.67.89           ← YOUR IP
-------------------------------------------
🔐 LOGIN ATTEMPT STARTED
📡 REQUEST HEADERS:
  X-Device-Info: iOS 17.5 | iPhone 13  ← SENT TO BACKEND
  X-IP-Address: 103.45.67.89           ← SENT TO BACKEND
-------------------------------------------
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
👤 User ID: abc12345-6789-...         ← ACTUAL USER ID
🔑 Access Token: eyJhbGci...          ← JWT TOKEN
🔄 Refresh Token: Z8AxWUu...          ← SESSION TOKEN
💾 Tokens saved to SecureStore        ← SAVED LOCALLY
📊 Session created in database!       ← SAVED IN DB
-------------------------------------------
✅ AUTO-LOGIN SUCCESSFUL!
💾 Database Updates:
  ✅ users table: User created         ← DB UPDATED
  ✅ user_sessions table: Session created  ← DB UPDATED
🚀 Navigating to: /(user)/abc12345-.../(tabs)
```

**If you see all these ✅ checkmarks, everything is working perfectly!**

---

## Testing Checklist

When testing from iPhone 13:

### Before You Start
- [ ] Backend running: `docker ps | grep bharathva-auth`
- [ ] Mobile app running: `pnpm start` in apps/mobile
- [ ] Expo Go app open on iPhone 13
- [ ] Connected to same network as Mac

### During Registration
- [ ] Watch for "Password Stored: Yes ✅"
- [ ] Watch for "Device: iOS 17.5 | iPhone 13"
- [ ] Watch for "IP Address: 103.xxx.xxx.xxx"
- [ ] Watch for "AUTO-LOGIN SUCCESSFUL!"

### After Registration
- [ ] Check users table: 1 new row
- [ ] Check user_sessions table: 1 new row
- [ ] Verify foreign key: user_sessions.user_id = users.id
- [ ] Verify device_info: "iOS 17.5 | iPhone 13"
- [ ] Verify ip_address: Your actual IP

### During Manual Login
- [ ] Watch for "PASSWORD SCREEN - LOGIN STARTED"
- [ ] Watch for "Device Info Collected"
- [ ] Watch for "LOGIN SUCCESSFUL"
- [ ] Watch for "Tokens saved to SecureStore"

### After Manual Login
- [ ] Check user_sessions table: 1 additional row
- [ ] Both sessions have same user_id
- [ ] Both have device info
- [ ] Different session IDs

---

**Use these console logs to track every step and verify that device info, IP address, JWT tokens, and database updates are all working correctly!**

