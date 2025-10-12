# Console Output Guide - Complete Login & Registration Flow

## What You'll See in Console

This guide shows exactly what console logs you'll see when testing from your iPhone 13.

---

## Scenario 1: New User Registration + Auto-Login

### Complete Console Output (iPhone 13)

```
📱 REGISTRATION FLOW STARTED
===========================================

1️⃣ EMAIL ENTERED
Email entered: nishal@example.com

2️⃣ DETAILS SUBMITTED
[API] POST http://192.168.0.9:8080/api/auth/register/email
[API] Success: OTP sent to your email

3️⃣ OTP VERIFICATION
Verifying OTP: 123456
[API] POST http://192.168.0.9:8080/api/auth/register/verify-otp
[API] Success: Email verified successfully

4️⃣ DETAILS SUBMISSION
Submitting user details to backend: { name: "Nishal Poojary", ... }
[API] POST http://192.168.0.9:8080/api/auth/register/details
[API] Success: Details saved successfully

5️⃣ PASSWORD CREATION
Creating password
[API] POST http://192.168.0.9:8080/api/auth/register/password
[API] Success: Password created successfully

6️⃣ USERNAME CREATION
Creating username: nishal_pro
[API] POST http://192.168.0.9:8080/api/auth/register/username
[API] Success: Registration completed successfully!

═══════════════════════════════════════════

7️⃣ AUTO-LOGIN TRIGGERED
╔═══════════════════════════════════════════╗
║  AUTO-LOGIN AFTER REGISTRATION STARTED    ║
╚═══════════════════════════════════════════╝
📧 Email: nishal@example.com
🔑 Password Stored: Yes ✅
🔑 Password Length: 9 characters
👤 Username: nishal_pro
-------------------------------------------

8️⃣ COLLECTING DEVICE INFO
===========================================
📱 COLLECTING DEVICE INFORMATION
===========================================
✅ Device Info Collected:
  📱 Device: iOS 17.5 | iPhone 13
  🌐 IP Address: 103.45.67.89
===========================================

9️⃣ SENDING LOGIN REQUEST
===========================================
🔐 LOGIN ATTEMPT STARTED
===========================================
📧 Email: nishal@example.com
🔑 Password: ********
-------------------------------------------
📱 Collecting device information...
-------------------------------------------
📡 REQUEST HEADERS:
  X-Device-Info: iOS 17.5 | iPhone 13
  X-IP-Address: 103.45.67.89
-------------------------------------------

🔟 LOGIN API CALL
[API] POST http://192.168.0.9:8080/api/auth/login
[API] Request body: {"email":"nishal@example.com","password":"*******"}
[API] Sending request...
[API] Response status: 200
[API] Response ok: true

1️⃣1️⃣ LOGIN RESPONSE RECEIVED
===========================================
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
===========================================
👤 User Details:
  User ID: abc12345-6789-4def-ghij-klmnopqrstuv
  Email: nishal@example.com
  Username: nishal_pro
-------------------------------------------
🔑 Tokens Received:
  Access Token (JWT): eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhYmMxMjM0NS02Nzg5...
  Refresh Token: Z8AxWUuHO85vjb-LQXpp_08cBkKMuCXXOpUII4UUnru37lo9Z...
  Token Type: Bearer
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

1️⃣2️⃣ AUTO-LOGIN COMPLETE
╔═══════════════════════════════════════════╗
║    AUTO-LOGIN SUCCESSFUL!                 ║
╚═══════════════════════════════════════════╝
✅ Registration complete + User logged in
-------------------------------------------
👤 User Details:
  🆔 User ID: abc12345-6789-4def-ghij-klmnopqrstuv
  📧 Email: nishal@example.com
  👨 Username: nishal_pro
-------------------------------------------
🎫 JWT Access Token:
   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhYmMxMjM0NS02Nzg5...
-------------------------------------------
🔄 Refresh Token:
   Z8AxWUuHO85vjb-LQXpp_08cBkKMuCXXOpUII4UUnru37lo9Z...
-------------------------------------------
💾 Database Updates:
  ✅ users table: User created
  ✅ user_sessions table: Session created with device info
-------------------------------------------
🚀 Navigating to: /(user)/abc12345-6789-4def-ghij-klmnopqrstuv/(tabs)
═══════════════════════════════════════════
```

---

## Scenario 2: Existing User Manual Login

### Complete Console Output (iPhone 13)

```
📱 MANUAL LOGIN FLOW STARTED
===========================================

1️⃣ EMAIL SCREEN
Email entered: nishal@example.com
Navigating to password screen with email parameter

2️⃣ PASSWORD SCREEN
╔═══════════════════════════════════════════╗
║      PASSWORD SCREEN - LOGIN STARTED      ║
╚═══════════════════════════════════════════╝
📧 Email: nishal@example.com
🔑 Password Length: 9 characters
🔑 Password: •••••••••
-------------------------------------------

3️⃣ COLLECTING DEVICE INFO
===========================================
📱 COLLECTING DEVICE INFORMATION
===========================================
✅ Device Info Collected:
  📱 Device: iOS 17.5 | iPhone 13
  🌐 IP Address: 103.45.67.89
===========================================

4️⃣ SENDING LOGIN REQUEST
===========================================
🔐 LOGIN ATTEMPT STARTED
===========================================
📧 Email: nishal@example.com
🔑 Password: ********
-------------------------------------------
📱 Collecting device information...
-------------------------------------------
📡 REQUEST HEADERS:
  X-Device-Info: iOS 17.5 | iPhone 13
  X-IP-Address: 103.45.67.89
-------------------------------------------

5️⃣ LOGIN API CALL
[API] POST http://192.168.0.9:8080/api/auth/login
[API] Request body: {"email":"nishal@example.com","password":"*******"}
[API] Sending request...
[API] Response status: 200
[API] Response ok: true

6️⃣ LOGIN RESPONSE RECEIVED
===========================================
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
===========================================
👤 User Details:
  User ID: abc12345-6789-4def-ghij-klmnopqrstuv
  Email: nishal@example.com
  Username: nishal_pro
-------------------------------------------
🔑 Tokens Received:
  Access Token (JWT): eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhYmMxMjM0NS02Nzg5...
  Refresh Token: AI6HKPbZW3s1tjTUFmMwjXKWiCy6FTyWySIOAgZHAcu7m2QiO...
  Token Type: Bearer
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

7️⃣ PASSWORD SCREEN - LOGIN COMPLETE
╔═══════════════════════════════════════════╗
║       LOGIN RESPONSE RECEIVED             ║
╚═══════════════════════════════════════════╝
👤 User Information:
  🆔 User ID: abc12345-6789-4def-ghij-klmnopqrstuv
  📧 Email: nishal@example.com
  👨 Username: nishal_pro
-------------------------------------------
🎫 JWT Access Token:
   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhYmMxMjM0NS02Nzg5...
-------------------------------------------
🔄 Refresh Token (Session):
   AI6HKPbZW3s1tjTUFmMwjXKWiCy6FTyWySIOAgZHAcu7m2QiO...
-------------------------------------------
✅ Navigating to: /(user)/abc12345-6789-4def-ghij-klmnopqrstuv/(tabs)
═══════════════════════════════════════════
```

---

## What Each Log Means

### Device Information Collection

```
===========================================
📱 COLLECTING DEVICE INFORMATION
===========================================
✅ Device Info Collected:
  📱 Device: iOS 17.5 | iPhone 13
  🌐 IP Address: 103.45.67.89
===========================================
```

**Meaning:**
- `Device`: OS version + Device model (collected via expo-device)
- `IP Address`: Your public IP (fetched from ipify API)
- These will be sent to backend and stored in database

---

### Login Request Headers

```
📡 REQUEST HEADERS:
  X-Device-Info: iOS 17.5 | iPhone 13
  X-IP-Address: 103.45.67.89
```

**Meaning:**
- Custom HTTP headers sent with login request
- Backend extracts these and stores in `user_sessions` table

---

### Tokens Received

```
🔑 Tokens Received:
  Access Token (JWT): eyJhbGciOiJIUzI1NiJ9...
  Refresh Token: Z8AxWUuHO85vjb-LQXpp...
  Token Type: Bearer
```

**Meaning:**
- **Access Token (JWT)**: Short-lived token (1 hour) for API authentication
- **Refresh Token**: Long-lived token (7 days) stored in database
- Both saved in SecureStore on your iPhone

---

### Token Expiry

```
⏱️  Token Expiry:
  Access Token Expires In: 3600000 ms ( 60 minutes )
  Refresh Token Expires In: 604800000 ms ( 7 days )
```

**Meaning:**
- Access token valid for 60 minutes
- Refresh token valid for 7 days
- After access token expires, use refresh token to get new one

---

### Database Updates

```
💾 Database Updates:
  ✅ users table: User created
  ✅ user_sessions table: Session created with device info
```

**Meaning:**
- User record saved in `users` table
- Session record saved in `user_sessions` table with:
  - `user_id`: Foreign key to users.id
  - `refresh_token`: The refresh token
  - `ip_address`: 103.45.67.89
  - `device_info`: iOS 17.5 | iPhone 13

---

## Troubleshooting Console Logs

### Success Indicators

**You should see:**
```
✅ Device Info Collected
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
✅ Tokens saved to SecureStore
✅ Session should now be in database!
✅ AUTO-LOGIN SUCCESSFUL! (for registration)
```

**You should NOT see:**
```
❌ Login failed
❌ Password stored: No
❌ Device: Unknown | Unknown Device
❌ IP Address: Unknown
❌ AUTO-LOGIN FAILED
```

---

### Error Scenarios

#### Error 1: Password Not Stored
```
╔═══════════════════════════════════════════╗
║  AUTO-LOGIN AFTER REGISTRATION STARTED    ║
╚═══════════════════════════════════════════╝
📧 Email: nishal@example.com
🔑 Password Stored: No ❌  ← PROBLEM!
🔑 Password Length: 0 characters
```

**Solution**: Password wasn't stored during registration step. Make sure `handleCreatePassword` calls `setUserPassword(password)`.

---

#### Error 2: Device Info Failed
```
✅ Device Info Collected:
  📱 Device: Unknown | Unknown Device  ← PROBLEM!
  🌐 IP Address: Unknown  ← PROBLEM!
```

**Solution**: 
- Check expo-device package installed
- Check network connectivity for ipify API

---

#### Error 3: Login API Failed
```
╔═══════════════════════════════════════════╗
║         LOGIN FAILED                      ║
╚═══════════════════════════════════════════╝
❌ Error: Network request failed
```

**Solution**:
- Check backend is running: `docker ps | grep bharathva-auth`
- Check API URL in `config.ts` matches your network
- Try Mac's local IP instead of localhost

---

## Backend Console Output

### When iPhone Logs In

```
===========================================
LOGIN REQUEST RECEIVED
===========================================
Email: nishal@example.com
IP Address: 103.45.67.89
Device Info: iOS 17.5 | iPhone 13
User Agent: Expo/1.0 (iPhone 13; iOS 17.5)
===========================================

===========================================
✅ LOGIN SUCCESSFUL - SESSION CREATED
===========================================
📧 Email: nishal@example.com
👤 Username: nishal_pro
🆔 User ID: abc12345-6789-4def-ghij-klmnopqrstuv
-------------------------------------------
🔑 JWT ACCESS TOKEN:
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhYmMxMjM0NS02Nzg5...
-------------------------------------------
🔄 REFRESH TOKEN (Session Token):
Z8AxWUuHO85vjb-LQXpp_08cBkKMuCXXOpUII4UUnru37lo9Z...
-------------------------------------------
💾 DATABASE SESSION DETAILS:
Session ID: xyz67890-abcd-1234-efgh-ijklmnopqrst
User ID (FK): abc12345-6789-4def-ghij-klmnopqrstuv
Expires At: 2025-10-18T13:15:00
Created At: 2025-10-11T13:15:00
IP Address: 103.45.67.89
Device Info: iOS 17.5 | iPhone 13
-------------------------------------------
📊 Total active sessions: 1
===========================================
```

---

## How to Read the Logs

### Registration Flow Logs

**Look for these key messages:**

1. **Email Sent**: `OTP sent to your email`
2. **Email Verified**: `Email verified successfully`
3. **Details Saved**: `Details saved successfully`
4. **Password Created**: `Password created successfully`
5. **Username Created**: `Registration completed successfully`
6. **Auto-Login Started**: `AUTO-LOGIN AFTER REGISTRATION STARTED`
7. **Device Info Collected**: `Device: iOS 17.5 | iPhone 13`
8. **Login Successful**: `AUTO-LOGIN SUCCESSFUL!`
9. **Session Created**: `Session created in database with device info`

### Manual Login Flow Logs

**Look for these key messages:**

1. **Login Started**: `PASSWORD SCREEN - LOGIN STARTED`
2. **Email Provided**: `Email: nishal@example.com`
3. **Password Provided**: `Password: •••••••••`
4. **Device Info Collected**: `Device: iOS 17.5 | iPhone 13`
5. **Headers Sent**: `X-Device-Info: iOS 17.5 | iPhone 13`
6. **Login Successful**: `LOGIN SUCCESSFUL - RESPONSE RECEIVED`
7. **Tokens Received**: `Access Token`, `Refresh Token`
8. **Tokens Saved**: `Tokens saved to SecureStore`

---

## Database Verification After Seeing Logs

### After Registration (Auto-Login)

**When you see:**
```
✅ AUTO-LOGIN SUCCESSFUL!
✅ user_sessions table: Session created with device info
```

**Verify in database:**
```sql
SELECT 
  u.email,
  u.username,
  u.created_at as user_created,
  us.id as session_id,
  us.device_info,
  us.ip_address,
  us.created_at as session_created
FROM users u
INNER JOIN user_sessions us ON u.id = us.user_id
WHERE u.email = 'nishal@example.com'
ORDER BY us.created_at DESC
LIMIT 1;
```

**Expected:**
```
email           | nishal@example.com
username        | nishal_pro
user_created    | 2025-10-11 13:15:00
session_id      | xyz67890-abcd-1234-efgh-ijklmnopqrst
device_info     | iOS 17.5 | iPhone 13
ip_address      | 103.45.67.89
session_created | 2025-10-11 13:15:01 (1 second after user)
```

---

### After Manual Login

**When you see:**
```
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
💾 Session should now be in database!
```

**Verify in database:**
```sql
SELECT 
  us.id,
  us.device_info,
  us.ip_address,
  us.created_at,
  'Session ' || ROW_NUMBER() OVER (ORDER BY us.created_at) as session_number
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'nishal@example.com'
ORDER BY us.created_at DESC;
```

**Expected (if logged in twice):**
```
id           | device_info              | ip_address    | created_at          | session_number
-------------|--------------------------|---------------|---------------------|---------------
def45678-... | iOS 17.5 | iPhone 13    | 103.45.67.89  | 2025-10-11 13:20:00 | Session 2
xyz67890-... | iOS 17.5 | iPhone 13    | 103.45.67.89  | 2025-10-11 13:15:01 | Session 1
```

---

## Console Log Checklist

### Registration + Auto-Login

- [ ] Email entered and validated
- [ ] OTP sent successfully
- [ ] OTP verified successfully
- [ ] Details saved successfully
- [ ] Password created successfully
- [ ] Password stored in state: `Yes ✅`
- [ ] Username created successfully
- [ ] Auto-login started
- [ ] Device info collected: Not "Unknown"
- [ ] IP address collected: Not "Unknown"
- [ ] Login request sent with headers
- [ ] Login successful
- [ ] User ID received (UUID format)
- [ ] Access token received (JWT format)
- [ ] Refresh token received (base64 string)
- [ ] Tokens saved to SecureStore
- [ ] Session created in database
- [ ] Navigation successful

### Manual Login

- [ ] Email passed from login screen
- [ ] Password entered
- [ ] Login started
- [ ] Device info collected: Not "Unknown"
- [ ] IP address collected: Not "Unknown"
- [ ] Headers sent with request
- [ ] Login API called
- [ ] Response status 200
- [ ] Login successful
- [ ] User details received
- [ ] Access token received
- [ ] Refresh token received
- [ ] Tokens saved to SecureStore
- [ ] Session created in database
- [ ] Navigation successful

---

## Quick Test Commands

### 1. Test from iPhone and Watch Logs

```bash
# Terminal 1: Start mobile app
cd apps/mobile
pnpm start
# Watch the console output

# Terminal 2: Watch backend logs
cd backend
docker-compose logs -f auth-service | grep -E "(LOGIN|SESSION|Device Info|IP Address)"
```

### 2. Verify in Database After Seeing Success Logs

```sql
-- Quick check
SELECT 
  'Registration + Auto-Login Test' as test_name,
  u.email,
  u.username,
  us.device_info,
  us.ip_address,
  us.created_at
FROM users u
INNER JOIN user_sessions us ON u.id = us.user_id
WHERE u.email = 'YOUR_EMAIL_HERE'
ORDER BY us.created_at DESC
LIMIT 1;
```

---

## Expected Console Output Summary

### Success Path (Registration)
```
✅ Password Stored: Yes ✅
✅ Device: iOS 17.5 | iPhone 13
✅ IP Address: 103.45.67.89
✅ AUTO-LOGIN SUCCESSFUL!
✅ Session created in database with device info
✅ Navigating to: /(user)/{userId}/(tabs)
```

### Success Path (Login)
```
✅ Email: nishal@example.com
✅ Device: iOS 17.5 | iPhone 13
✅ IP Address: 103.45.67.89
✅ LOGIN SUCCESSFUL - RESPONSE RECEIVED
✅ Tokens saved to SecureStore
✅ Session should now be in database!
✅ Navigating to: /(user)/{userId}/(tabs)
```

---

**Now when you test from your iPhone 13, you'll see detailed console logs for every step, including email, password (masked), device info, IP address, JWT tokens, refresh tokens, and database updates!**

