# 🔐 Complete Authentication System Test

## 📋 **Test Plan Overview**

This test verifies the complete JWT + Refresh Token authentication system:

1. **Registration** → Creates user account
2. **Login** → Generates JWT + Refresh Token → Stores in `user_sessions`
3. **Token Storage** → JWT stored in SecureStore (mobile)
4. **Token Refresh** → Uses refresh token to get new JWT
5. **Logout** → Invalidates refresh token

## 🎯 **Expected Behavior**

| Step | What Happens | Where Data Goes |
|------|-------------|-----------------|
| **Registration** | User account created | `users` table |
| **Login** | JWT + Refresh Token generated | `user_sessions` table |
| **JWT Storage** | Access token stored locally | Mobile SecureStore |
| **Refresh Token** | Session token stored locally + DB | Mobile SecureStore + `user_sessions` |
| **Token Refresh** | New JWT generated | Mobile SecureStore updated |
| **Logout** | Session invalidated | `user_sessions.is_active = false` |

## 🚀 **Step 1: Start Services with New JWT Secret**

```bash
cd backend
docker-compose down
docker-compose up --build
```

**Wait for all services to be healthy:**
- ✅ discovery-service
- ✅ config-service  
- ✅ gateway-service
- ✅ auth-service

## 🔍 **Step 2: Monitor Auth Service Logs**

```bash
# Terminal 1: Monitor logs
cd backend
docker-compose logs -f auth-service
```

## 📱 **Step 3: Test Complete Flow**

### **A. Registration (Creates User)**
```bash
# Terminal 2: Register new user
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}'

# Check email OTP
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","otp":"123456"}'

# Create password
curl -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"YOUR_SESSION_TOKEN","password":"TestPass123!"}'

# Create username
curl -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"YOUR_SESSION_TOKEN","username":"testuser"}'
```

### **B. Login (Generates JWT + Refresh Token)**
```bash
# Terminal 2: Login with registered user
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPass123!"}'
```

## 📊 **Step 4: Verify Results**

### **Expected Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "uuid-here",
    "email": "testuser@example.com",
    "username": "testuser",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "uuid-refresh-token-here",
    "expiresIn": 3600000,
    "refreshExpiresIn": 604800000
  }
}
```

### **Expected Console Logs:**
```
===========================================
LOGIN REQUEST RECEIVED
===========================================
Email: testuser@example.com
===========================================
Processing login for email: testuser@example.com
Generating JWT access token for user: testuser@example.com
JWT Access Token Generated Successfully
Token Preview: eyJhbGciOiJIUzI1Ni...
Issued At: [timestamp]
Expires At: [timestamp + 1 hour]
Token Valid For: 3600000 milliseconds (1 hours)
Refresh token generated successfully
Login successful for user: testuser@example.com
Active sessions for user: 1
===========================================
LOGIN SUCCESSFUL
===========================================
User Email: testuser@example.com
User ID: [UUID]
Username: testuser
-------------------------------------------
ACCESS TOKEN (JWT):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
-------------------------------------------
REFRESH TOKEN (Session Token):
[UUID-refresh-token]
-------------------------------------------
SESSION SAVED TO DATABASE:
Session ID: [UUID]
User ID: [UUID]
Refresh Token: [UUID-refresh-token]
Expires At: [timestamp + 7 days]
Created At: [timestamp]
Is Active: true
-------------------------------------------
Active sessions for this user: 1
===========================================
LOGIN RESPONSE BEING SENT
===========================================
User ID: [UUID]
Email: testuser@example.com
Username: testuser
-------------------------------------------
ACCESS TOKEN (JWT): eyJhbGciOiJIUzI1Ni...
-------------------------------------------
REFRESH TOKEN: [UUID-refresh-token]
-------------------------------------------
Access Token Expires In: 3600000 ms (60 minutes)
Refresh Token Expires In: 604800000 ms (7 days)
===========================================
```

## 🗄️ **Step 5: Verify Database Storage**

### **Check Users Table:**
```sql
SELECT id, email, username, created_at 
FROM users 
WHERE email = 'testuser@example.com';
```

### **Check User Sessions Table (After Login):**
```sql
SELECT id, user_id, refresh_token, expires_at, created_at, is_active
FROM user_sessions 
WHERE user_id = '[USER_ID_FROM_LOGIN_RESPONSE]'
ORDER BY created_at DESC;
```

**Expected Result:**
- ✅ `id`: UUID (session primary key)
- ✅ `user_id`: UUID (links to users table)
- ✅ `refresh_token`: UUID (session token)
- ✅ `expires_at`: timestamp + 7 days
- ✅ `created_at`: current timestamp
- ✅ `is_active`: true

## 🔄 **Step 6: Test Token Refresh**

```bash
# Use refresh token from login response
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN_FROM_LOGIN"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-token-here",
    "expiresIn": 3600000
  }
}
```

## 🚪 **Step 7: Test Logout**

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Verify Session Deactivated:**
```sql
SELECT is_active 
FROM user_sessions 
WHERE refresh_token = 'YOUR_REFRESH_TOKEN';
-- Should return: is_active = false
```

## ✅ **Success Criteria**

| Test | Expected Result | Status |
|------|----------------|--------|
| **Registration** | User created in `users` table | ⏳ |
| **Login** | JWT + Refresh Token generated | ⏳ |
| **Console Logs** | Detailed token info printed | ⏳ |
| **Database Storage** | Session stored in `user_sessions` | ⏳ |
| **Token Refresh** | New JWT generated | ⏳ |
| **Logout** | Session deactivated | ⏳ |

## 🚨 **Troubleshooting**

### **Issue: No tokens in logs**
- **Cause:** User didn't complete login, only registration
- **Solution:** Make sure to call `/auth/login` after registration

### **Issue: user_sessions table empty**
- **Cause:** Login not completed or database connection issue
- **Solution:** Check auth-service logs for errors

### **Issue: JWT not generating**
- **Cause:** JWT_SECRET not set properly
- **Solution:** Restart services with new JWT secret

### **Issue: Database connection errors**
- **Cause:** Neon database connection issues
- **Solution:** Check database URL and credentials

## 📱 **Mobile App Integration**

The mobile app should:
1. **Store JWT** in SecureStore (not AsyncStorage)
2. **Store Refresh Token** in SecureStore (not AsyncStorage)
3. **Auto-refresh** JWT when it expires
4. **Clear tokens** on logout

**Example SecureStore usage:**
```typescript
// Store tokens
await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Retrieve tokens
const accessToken = await SecureStore.getItemAsync('accessToken');
const refreshToken = await SecureStore.getItemAsync('refreshToken');

// Clear tokens
await SecureStore.deleteItemAsync('accessToken');
await SecureStore.deleteItemAsync('refreshToken');
```

---

## 🎯 **Next Steps After Testing**

1. **If all tests pass:** System is ready for production
2. **If issues found:** Check logs and database connections
3. **Mobile integration:** Implement SecureStore token management
4. **Security review:** Ensure JWT secret is properly secured

**Remember:** JWT tokens are NOT stored in the database - only refresh tokens are stored in `user_sessions` table!
