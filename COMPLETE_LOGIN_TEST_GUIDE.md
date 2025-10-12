# Complete Login Test Guide - User Sessions Explained

## IMPORTANT: Understanding the Flow

### Registration vs Login

**Registration** (Account Creation):
1. Enter email → Get OTP
2. Verify OTP
3. Set password
4. Choose username
5. ✅ Account created

**❌ Registration does NOT create session or tokens**

**Login** (Session Creation):
1. Enter email + password
2. ✅ **NOW** JWT and refresh token are created
3. ✅ **NOW** session is saved to `user_sessions` table
4. ✅ **NOW** IP and device info are captured

## Why Sessions Are Created on Login

- **Security**: Tokens should only exist when user actively logs in
- **Multi-device**: Each device gets its own session when it logs in
- **Control**: User decides when to create a session (login)

## Current Database Status

### Users Table
```sql
SELECT id, email, username, is_email_verified 
FROM users 
ORDER BY created_at DESC;
```

| Email | Username | Verified |
|-------|----------|----------|
| nishalpoojary777@gmail.com | nishalx | ✅ true |
| testuser2@example.com | testuser2 | ✅ true |

### User Sessions Table
```sql
SELECT user_id, ip_address, device_info, created_at
FROM user_sessions
ORDER BY created_at DESC;
```

Currently **EMPTY for nishalx** because **you haven't logged in yet**.

## How to Create a Session

### Step 1: Know Your Password

During registration, you set a password in this step:
```json
POST /auth/register/password
{
  "sessionToken": "...",
  "password": "YourPassword123!",
  "confirmPassword": "YourPassword123!"
}
```

You need to use **the exact same password** for login.

### Step 2: Login to Create Session

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: BharathVA-Mobile/1.0 (iOS)" \
  -d '{
    "email": "nishalpoojary777@gmail.com",
    "password": "YOUR_ACTUAL_PASSWORD_HERE"
  }'
```

### Step 3: Observe Terminal Output

After successful login, you'll see:

```
===========================================
✅ LOGIN SUCCESSFUL - SESSION CREATED
===========================================
📧 Email: nishalpoojary777@gmail.com
👤 Username: nishalx
🆔 User ID: 35a4cca2-e0a4-4d56-aee3-a9faebcf901e
-------------------------------------------
🔑 JWT ACCESS TOKEN:
eyJhbGciOiJIUzI1NiJ9...
-------------------------------------------
🔄 REFRESH TOKEN (Session Token):
abc123xyz...
-------------------------------------------
💾 DATABASE SESSION DETAILS:
Session ID: [unique UUID]
User ID (FK): 35a4cca2-e0a4-4d56-aee3-a9faebcf901e
IP Address: 203.0.113.45
Device Info: BharathVA-Mobile/1.0 (iOS)
-------------------------------------------
📊 Total active sessions: 1
===========================================
```

### Step 4: Verify in Database

```sql
SELECT 
    id,
    user_id,
    ip_address,
    device_info,
    created_at,
    expires_at
FROM user_sessions
WHERE user_id = (
    SELECT id FROM users WHERE email = 'nishalpoojary777@gmail.com'
);
```

Expected result:
| Field | Value |
|-------|-------|
| id | [unique UUID] |
| user_id | 35a4cca2-e0a4-4d56-aee3-a9faebcf901e |
| ip_address | Your IP |
| device_info | Your User-Agent |
| created_at | Current timestamp |
| expires_at | 7 days from now |

## Common Issues

### Issue 1: "Invalid email or password"

**Problem**: Wrong password or email not verified

**Solution**:
```bash
# Check if email is verified
SELECT email, is_email_verified FROM users WHERE email = 'your@email.com';

# If verified, make sure you're using the correct password
# The password you set during registration step 3
```

### Issue 2: "No sessions in user_sessions table"

**Problem**: You only registered, didn't login

**Solution**: Make a LOGIN request (not registration)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword"}'
```

### Issue 3: "sessionToken showing as null"

**This is NORMAL** in registration response. Session tokens are created during **LOGIN**, not registration.

## Complete Test Flow

### 1. Register a New User

```bash
# Step 1: Email
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'

# Get OTP from terminal logs
docker-compose logs auth-service | grep "DEBUG: OTP"

# Step 2: Verify OTP
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","otpCode":"123456"}'

# Step 3: Set Password
curl -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken":"SESSION_TOKEN",
    "password":"MySecurePass123!",
    "confirmPassword":"MySecurePass123!"
  }'

# Step 4: Choose Username
curl -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","username":"newuser"}'
```

### 2. LOGIN to Create Session

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: TestClient/1.0" \
  -d '{
    "email": "newuser@example.com",
    "password": "MySecurePass123!"
  }'
```

### 3. Check Terminal for Session Details

```bash
docker-compose logs auth-service | tail -50
```

Look for:
- ✅ LOGIN SUCCESSFUL
- 🔑 JWT ACCESS TOKEN
- 🔄 REFRESH TOKEN
- 💾 DATABASE SESSION DETAILS
- 📊 Total active sessions

### 4. Verify in Database

```sql
-- Check user exists
SELECT * FROM users WHERE email = 'newuser@example.com';

-- Check session was created
SELECT * FROM user_sessions 
WHERE user_id = (SELECT id FROM users WHERE email = 'newuser@example.com');
```

## Expected Results After Login

### Terminal Output
✅ Both tokens printed  
✅ Session ID shown  
✅ IP address captured  
✅ Device info captured  

### Database
✅ One record in `user_sessions`  
✅ `user_id` matches `users.id`  
✅ `refresh_token` is unique  
✅ `ip_address` populated  
✅ `device_info` populated  
✅ `expires_at` set to 7 days  

## Testing with Your Current User

For user `nishalpoojary777@gmail.com`:

1. **You need to know the password** you set during registration
2. **Make a login request** with that password
3. **Session will be created** in `user_sessions` table

If you don't remember the password:
- Register a new test user with a known password
- Or reset the password (if password reset is implemented)

## Quick Test with Known User

Use `testuser2@example.com` (password: `TestPass123!`):

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: QuickTest/1.0" \
  -d '{"email":"testuser2@example.com","password":"TestPass123!"}'
```

This will immediately:
1. Create a new session
2. Print JWT and refresh token
3. Store in database with IP and device info

## Verification Commands

### Check All Users
```sql
SELECT id, email, username, is_email_verified, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Check All Sessions
```sql
SELECT 
    us.id as session_id,
    u.email,
    u.username,
    us.ip_address,
    us.device_info,
    us.created_at,
    us.expires_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC;
```

### Check Sessions for Specific User
```sql
SELECT * FROM user_sessions 
WHERE user_id = (SELECT id FROM users WHERE email = 'nishalpoojary777@gmail.com');
```

---

**BharathVA - The Voice of India**

Sessions are created on LOGIN, not registration. This is by design for security and proper session management.

