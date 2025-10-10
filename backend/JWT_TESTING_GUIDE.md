# 🔐 JWT Authentication Testing Guide

## 📋 Overview
This guide will help you test the JWT authentication implementation in BharathVA backend. Console logs have been added to track JWT token generation, validation, and usage.

---

## 🚀 Step 1: Start the Services

### Option A: Using Docker Compose (Recommended)
```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose up -d
```

### Option B: Start Individual Services
```bash
# Terminal 1 - Discovery Service (Port 8761)
cd discovery-service
./mvnw spring-boot:run

# Terminal 2 - Config Service (Port 8888)
cd config-service
./mvnw spring-boot:run

# Terminal 3 - Gateway Service (Port 8080)
cd gateway-service
./mvnw spring-boot:run

# Terminal 4 - Auth Service (Port 8081)
cd auth-service
./mvnw spring-boot:run
```

---

## 📊 Step 2: Monitor Console Logs

### View Auth Service Logs
```bash
# If using Docker
docker logs -f backend-auth-service-1

# If running locally
# Check the terminal where auth-service is running
```

### What to Look For:
You'll see emoji-decorated logs like:
- 🔐 **Token Generation**: When JWT is created
- 🔍 **Token Validation**: When JWT is validated
- ✅ **Success**: Operations completed successfully
- ❌ **Failure**: Errors or validation failures
- 🎫 **Full Token**: Complete JWT token displayed
- 👤 **User Info**: User details from token

---

## 🧪 Step 3: Test Endpoints with Postman/cURL

### 📝 Test 1: Register a New User

#### Endpoint: POST `/auth/register/email`
```bash
curl -X POST http://localhost:8081/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to email successfully",
  "data": {
    "sessionToken": "abc123...",
    "email": "testuser@example.com"
  },
  "timestamp": "2025-10-10T17:30:00"
}
```

**Console Output:**
```
📧 Sending OTP to: testuser@example.com
✅ OTP sent successfully
```

---

### 📝 Test 2: Verify OTP

#### Endpoint: POST `/auth/register/verify-otp`
```bash
curl -X POST http://localhost:8081/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "otp": "123456"
  }'
```

---

### 📝 Test 3: Complete Registration

Complete all registration steps (name, phone, DOB, password, username) following the flow in the mobile app.

---

### 📝 Test 4: Login (Get JWT Token)

#### Endpoint: POST `/auth/login`
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "YourPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "tokenType": "Bearer",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "testuser@example.com",
    "username": "testuser",
    "expiresIn": 86400000
  },
  "timestamp": "2025-10-10T17:30:00"
}
```

**Console Output (🎉 This is the important part!):**
```
🔑 Login attempt for email: testuser@example.com
🔐 Generating JWT token for user: testuser@example.com
User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890, Username: testuser
✅ JWT Token Generated Successfully
📋 Token Preview: eyJhbGciOiJIUzI1NiI...dQssw5c
⏰ Issued At: Fri Oct 10 17:30:00 UTC 2025
⏰ Expires At: Sat Oct 11 17:30:00 UTC 2025
⏱️  Token Valid For: 86400000 milliseconds (24 hours)
✅ Login successful for: testuser@example.com
🎫 JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
👤 User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📧 Email: testuser@example.com
👤 Username: testuser
```

**💡 Note:** Copy the full JWT token from the response for the next tests!

---

### 📝 Test 5: Validate JWT Token

#### Endpoint: POST `/auth/validate`
```bash
curl -X POST http://localhost:8081/auth/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Replace `YOUR_JWT_TOKEN_HERE` with the actual token from login response.**

**Expected Response:**
```json
{
  "success": true,
  "message": "Token validation completed",
  "data": {
    "valid": true,
    "message": "Token is valid"
  },
  "timestamp": "2025-10-10T17:35:00"
}
```

**Console Output:**
```
🔍 Token validation request received
📋 Token to validate: eyJhbGciOiJIUzI1NiI...dQssw5c
🔍 Validating JWT token (no user check)
✅ Token is VALID
👤 User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📧 Email: testuser@example.com
👤 Username: testuser
⏰ Expires At: Sat Oct 11 17:30:00 UTC 2025
✅ Token validation: VALID
```

---

### 📝 Test 6: Access Protected Endpoint

#### Endpoint: GET `/auth/user/me`
```bash
curl -X GET http://localhost:8081/auth/user/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "testuser@example.com",
    "username": "testuser",
    "fullName": "Test User",
    "phoneNumber": "1234567890",
    "countryCode": "+1",
    "dateOfBirth": "1990-01-01",
    "isEmailVerified": true,
    "createdAt": "2025-10-10T17:00:00"
  },
  "timestamp": "2025-10-10T17:35:00"
}
```

---

### 📝 Test 7: Refresh JWT Token

#### Endpoint: POST `/auth/refresh`
```bash
curl -X POST http://localhost:8081/auth/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[NEW_TOKEN]",
    "tokenType": "Bearer"
  },
  "timestamp": "2025-10-10T17:40:00"
}
```

**Console Output:**
```
🔄 Refreshing JWT token
🔄 Generating new token for user: testuser@example.com
🔐 Generating JWT token for user: testuser@example.com
✅ JWT Token Generated Successfully
✅ Token refreshed successfully
```

---

### 📝 Test 8: Test with Invalid Token

#### Test with expired/invalid token:
```bash
curl -X POST http://localhost:8081/auth/validate \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token validation completed",
  "data": {
    "valid": false,
    "message": "Token is invalid or expired"
  },
  "timestamp": "2025-10-10T17:45:00"
}
```

**Console Output:**
```
🔍 Token validation request received
📋 Token to validate: invalid_token_here
🔍 Validating JWT token (no user check)
❌ Token validation failed: [error details]
❌ Token validation: INVALID
```

---

## 📱 Step 4: Test with Mobile App

### Update Mobile App API Configuration

1. Open `/Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/apps/mobile/services/api.ts`

2. Ensure the base URL points to your auth service:
```typescript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:8081/auth';
```

3. Test the login flow in your mobile app

4. Watch the console logs in the auth-service to see JWT token generation in real-time!

---

## 🔍 Troubleshooting

### Issue 1: No Console Logs Visible
**Solution:**
- Ensure logging level is set to INFO or DEBUG
- Check `application.yml`:
```yaml
logging:
  level:
    com.bharathva.auth: DEBUG
    org.springframework.security: DEBUG
```

### Issue 2: Token Validation Fails
**Possible Causes:**
- Token expired (check expiration time in logs)
- Token malformed (check token format)
- Wrong JWT secret (check `application.yml`)

**Check Console for:**
```
❌ Token validation failed: JWT expired at...
❌ Token validation failed: Malformed JWT...
```

### Issue 3: Login Returns 401
**Possible Causes:**
- Email not verified
- Wrong password
- User doesn't exist

**Check Console for:**
```
❌ Login failed for [email]: Invalid email or password
❌ Login failed for [email]: Please verify your email before logging in
```

---

## ✅ Success Indicators

### You'll know JWT is working when you see:

1. **Login Success:**
   ```
   ✅ Login successful for: [email]
   🎫 JWT Token: [full token displayed]
   ```

2. **Token Validation Success:**
   ```
   ✅ Token is VALID
   👤 User ID: [uuid]
   ```

3. **Protected Endpoint Access:**
   ```
   ✅ User profile retrieved successfully
   ```

4. **Token Details Visible:**
   ```
   ⏰ Issued At: [timestamp]
   ⏰ Expires At: [timestamp]
   ⏱️  Token Valid For: 86400000 milliseconds (24 hours)
   ```

---

## 🎯 Quick Test Script

Save this as `test_jwt.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8081/auth"

echo "🧪 Testing JWT Authentication Flow"
echo "=================================="

# Test 1: Login
echo -e "\n1️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "YourPassword123"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extract token (requires jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo -e "\n🎫 JWT Token: $TOKEN"

# Test 2: Validate Token
echo -e "\n2️⃣ Testing Token Validation..."
curl -s -X POST "$BASE_URL/validate" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 3: Get User Profile
echo -e "\n3️⃣ Testing Protected Endpoint..."
curl -s -X GET "$BASE_URL/user/me" \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n✅ JWT Test Complete!"
```

Run it:
```bash
chmod +x test_jwt.sh
./test_jwt.sh
```

---

## 📝 Notes

- **Token Expiration:** Default is 24 hours (configurable in `application.yml`)
- **Token Storage:** Tokens are NOT stored in database (stateless)
- **Token Format:** JWT with HS256 algorithm
- **Token Claims:** Contains userId, email, username, issuedAt, expiresAt
- **Console Logs:** All JWT operations are logged with emojis for easy tracking

---

## 🎉 You're All Set!

Your JWT authentication is now fully functional with console logging. Monitor the logs to see:
- When tokens are generated
- When tokens are validated
- User information extracted from tokens
- Token expiration details
- Any errors or validation failures

Happy Testing! 🚀

