# 🎯 Complete Testing Guide for BharathVA Backend

## ✅ All Issues Fixed!

### 🔧 What Was Fixed:

1. **Circular Dependency** - Removed `UserDetailsService` from `JwtAuthenticationFilter`
2. **JWT Logging** - Added comprehensive console logging with emojis
3. **Clean Code** - Replaced Lombok `@Slf4j` with direct SLF4J loggers
4. **Security Configuration** - Simplified and fixed bean injection
5. **Service Health** - All services are now running and healthy

---

## 🚀 Services Status

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Discovery (Eureka) | 8761 | ✅ Healthy | http://localhost:8761 |
| Gateway | 8080 | ✅ Healthy | http://localhost:8080 |
| Auth Service | 8081 | ✅ Healthy | http://localhost:8081 |

---

## 📱 Mobile App Configuration

### Update Your API Base URL

The mobile app should use the **Gateway** URL for all requests:

```typescript
// apps/mobile/services/api/config.ts or similar
const API_BASE_URL = 'http://YOUR_LOCAL_IP:8080/api/auth';
```

**Replace `YOUR_LOCAL_IP` with your actual local IP address (e.g., `192.168.0.9`).**

### Why Use Gateway?
- ✅ Single entry point for all microservices
- ✅ Load balancing
- ✅ Service discovery integration
- ✅ Centralized routing

---

## 🧪 Testing the Registration Flow

### 1️⃣ **Register Email** (Send OTP)

**Via Gateway** (Recommended for mobile app):
```bash
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "youremail@example.com"
  }'
```

**Direct to Auth Service** (For debugging):
```bash
curl -X POST http://localhost:8081/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "youremail@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "sessionToken": "c7c37252-e0cf-4461-91ba-9da434e9698e",
    "currentStep": "OTP",
    "message": "OTP sent to your email. Please verify.",
    "email": "youremail@example.com"
  },
  "timestamp": "2025-10-10T17:57:46.934"
}
```

**Console Output (check with `docker logs -f bharathva-auth`):**
```
📧 Sending OTP email to: youremail@example.com
✅ OTP email sent successfully
```

---

### 2️⃣ **Verify OTP**

```bash
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "otp": "123456"
  }'
```

---

### 3️⃣ **Add Details** (Name, Phone, DOB)

```bash
curl -X POST http://localhost:8080/api/auth/register/details \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "countryCode": "+1",
    "dateOfBirth": "1990-01-01"
  }'
```

---

### 4️⃣ **Create Password**

```bash
curl -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "password": "SecurePassword123"
  }'
```

---

### 5️⃣ **Create Username**

```bash
curl -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "username": "johndoe123"
  }'
```

---

## 🔐 Testing JWT Authentication

### 6️⃣ **Login** (Get JWT Token)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "youremail@example.com",
    "password": "SecurePassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "youremail@example.com",
    "username": "johndoe123",
    "expiresIn": 86400000
  },
  "timestamp": "2025-10-10T18:00:00"
}
```

**Console Output:**
```
🔑 Login attempt for email: youremail@example.com
🔐 Generating JWT token for user: youremail@example.com
✅ JWT Token Generated Successfully
📋 Token Preview: eyJhbGciOiJIUzI1NiI...xyz123
⏰ Issued At: Fri Oct 10 18:00:00 UTC 2025
⏰ Expires At: Sat Oct 11 18:00:00 UTC 2025
⏱️  Token Valid For: 86400000 milliseconds (24 hours)
✅ Login successful for: youremail@example.com
🎫 JWT Token: [FULL_TOKEN_DISPLAYED]
👤 User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📧 Email: youremail@example.com
👤 Username: johndoe123
```

---

### 7️⃣ **Validate JWT Token**

```bash
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Console Output:**
```
🔍 Token validation request received
📋 Token to validate: eyJhbGciOiJIUzI1NiI...xyz123
🔍 Validating JWT token (no user check)
✅ Token is VALID
👤 User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📧 Email: youremail@example.com
👤 Username: johndoe123
⏰ Expires At: Sat Oct 11 18:00:00 UTC 2025
✅ Token validation: VALID
```

---

### 8️⃣ **Access Protected Endpoint**

```bash
curl -X GET http://localhost:8080/api/auth/user/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Console Output:**
```
🔓 Authenticated user: johndoe123 (youremail@example.com)
Security context set for user: youremail@example.com
```

---

## 📊 Monitoring Console Logs

### View Auth Service Logs (See JWT tokens and operations):
```bash
docker logs -f bharathva-auth
```

### View All Services:
```bash
# Terminal 1
docker logs -f bharathva-discovery

# Terminal 2
docker logs -f bharathva-gateway

# Terminal 3
docker logs -f bharathva-auth
```

---

## 🎨 What You'll See in Console

### ✅ Success Messages:
```
🔐 Generating JWT token for user: [email]
✅ JWT Token Generated Successfully
🎫 JWT Token: [full token]
🔓 Authenticated user: [username] ([email])
✅ Token is VALID
```

### ❌ Error Messages:
```
❌ Login failed for [email]: Invalid email or password
❌ Token is INVALID - User ID mismatch or expired
❌ JWT authentication error: [details]
```

### 🔍 Debug Messages:
```
Public endpoint accessed: /auth/register/email
No valid Authorization header found for: /auth/profile
📋 Token Preview: eyJhbGciOiJIUzI1NiI...xyz123
```

---

## 🔍 Troubleshooting

### Issue 1: Mobile App Gets 503 Error

**Symptom:**
```
Error: Service Unavailable
Status: 503
Path: /api/auth/register/email
```

**Solution:**
1. Check if all services are running:
   ```bash
   docker-compose ps
   ```

2. Ensure auth-service is healthy (not restarting)

3. Restart gateway to refresh service registry:
   ```bash
   docker-compose restart gateway-service
   ```

4. Wait 20-30 seconds for services to register with Eureka

---

### Issue 2: Auth Service Keeps Restarting

**Symptom:**
```
STATUS: Restarting (1) X seconds ago
```

**Solution:**
1. Check logs for circular dependency errors:
   ```bash
   docker logs bharathva-auth
   ```

2. If you see "circular reference" error, ensure:
   - `JwtAuthenticationFilter` doesn't autowire `UserDetailsService`
   - `SecurityConfig` uses method injection for `JwtAuthenticationFilter`

**✅ This has been fixed in the latest code!**

---

### Issue 3: Cannot See JWT Token in Logs

**Solution:**
1. Ensure logging level is INFO or DEBUG in `application.yml`
2. Check logs with:
   ```bash
   docker logs -f bharathva-auth
   ```

---

### Issue 4: OTP Email Not Received

**Possible Causes:**
- SMTP credentials incorrect
- Gmail app password expired
- Email in spam folder

**Check:**
```bash
docker logs bharathva-auth | grep "SMTP\|mail\|OTP"
```

---

## 🧪 Quick Test Script

Save this as `test_auth_flow.sh`:

```bash
#!/bin/bash

echo "🧪 Testing BharathVA Authentication Flow"
echo "========================================"

GATEWAY_URL="http://localhost:8080/api/auth"
AUTH_URL="http://localhost:8081/auth"

# Test 1: Health Check
echo -e "\n1️⃣ Testing Health Check..."
curl -s http://localhost:8081/auth/health

# Test 2: Register Email (through Gateway)
echo -e "\n\n2️⃣ Testing Registration (via Gateway)..."
REGISTER_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/register/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "automated.test@example.com"
  }')

echo "$REGISTER_RESPONSE" | jq .

# Extract session token
SESSION_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.sessionToken')
echo -e "\n📋 Session Token: $SESSION_TOKEN"

# Test 3: Direct Auth Service Access
echo -e "\n3️⃣ Testing Direct Auth Service..."
curl -s -X POST "$AUTH_URL/register/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "direct.test@example.com"
  }' | jq .

echo -e "\n✅ Authentication Flow Test Complete!"
echo -e "\n📋 Next Steps:"
echo "1. Check console logs: docker logs -f bharathva-auth"
echo "2. Test with your mobile app using Gateway URL"
echo "3. Monitor JWT token generation in real-time"
```

**Run it:**
```bash
chmod +x test_auth_flow.sh
./test_auth_flow.sh
```

---

## 📱 Mobile App Testing Steps

### Step 1: Update API Configuration

Update your mobile app's API configuration to use the gateway:

```typescript
// File: apps/mobile/services/api/config.ts (or similar)

// Get your local IP address:
// On Mac: ifconfig | grep "inet " | grep -v 127.0.0.1
// On Windows: ipconfig

const API_BASE_URL = 'http://YOUR_LOCAL_IP:8080/api/auth';
```

### Step 2: Ensure Network Permissions

In your `app.json` or `AndroidManifest.xml`:
```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

### Step 3: Test Registration Flow

1. Open your mobile app
2. Navigate to registration screen
3. Enter email
4. Watch the backend console logs:
   ```bash
   docker logs -f bharathva-auth
   ```

### Step 4: Verify OTP Email

1. Check your email inbox
2. Copy the 6-digit OTP
3. Enter in the app
4. Watch console for verification logs

### Step 5: Complete Registration

Follow the registration flow:
- ✅ Email → OTP
- ✅ Details (Name, Phone, DOB)
- ✅ Password
- ✅ Username

### Step 6: Login and Get JWT

1. Login with your credentials
2. Watch console for JWT token generation
3. The app should receive the JWT token
4. Token is automatically used for authenticated requests

---

## 🔍 Console Log Examples

### Successful Registration Flow:
```
Public endpoint accessed: /auth/register/email
📧 Sending OTP email to: test@example.com
OTP: 123456
✅ OTP email sent successfully
Public endpoint accessed: /auth/register/verify-otp
✅ OTP verified successfully
Public endpoint accessed: /auth/register/details
✅ Details saved successfully
Public endpoint accessed: /auth/register/password
✅ Password saved successfully
Public endpoint accessed: /auth/register/username
✅ Registration completed successfully
```

### Successful Login Flow:
```
Public endpoint accessed: /auth/login
🔑 Login attempt for email: test@example.com
🔐 Generating JWT token for user: test@example.com
✅ JWT Token Generated Successfully
📋 Token Preview: eyJhbGciOiJIUzI1NiI...xyz123
⏰ Issued At: Fri Oct 10 18:00:00 UTC 2025
⏰ Expires At: Sat Oct 11 18:00:00 UTC 2025
⏱️  Token Valid For: 86400000 milliseconds (24 hours)
✅ Login successful for: test@example.com
🎫 JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwidXNlcklkIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwic3ViIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwiaWF0IjoxNzYwMTE4MDAwLCJleHAiOjE3NjAyMDQ0MDB9.xyz123
👤 User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📧 Email: test@example.com
👤 Username: testuser
```

### Accessing Protected Endpoint:
```
🔓 Authenticated user: testuser (test@example.com)
Security context set for user: test@example.com
✅ User profile retrieved successfully
```

---

## ✅ Success Checklist

Before testing with mobile app, ensure:

- [x] Discovery service is running (port 8761)
- [x] Gateway service is healthy (port 8080)
- [x] Auth service is healthy (port 8081)
- [x] All services registered with Eureka
- [x] Can access endpoints through gateway
- [x] Console logs showing JWT operations
- [x] Mobile app configured with correct gateway URL

---

## 🎯 API Endpoints Summary

### Public Endpoints (No JWT Required):
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register/email` | Send OTP to email |
| POST | `/api/auth/register/verify-otp` | Verify OTP code |
| POST | `/api/auth/register/details` | Add user details |
| POST | `/api/auth/register/password` | Set password |
| POST | `/api/auth/register/username` | Complete registration |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/validate` | Validate JWT token |
| GET | `/api/auth/health` | Health check |

### Protected Endpoints (JWT Required):
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/user/me` | Get current user profile |
| GET | `/api/auth/user/{userId}` | Get user by ID |
| GET | `/api/auth/profile` | Get profile from JWT |
| POST | `/api/auth/refresh` | Refresh JWT token |

---

## 🔧 Quick Commands

### Start all services:
```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose up -d
```

### Stop all services:
```bash
docker-compose down
```

### Restart a specific service:
```bash
docker-compose restart auth-service
# or
docker-compose restart gateway-service
```

### View logs:
```bash
docker logs -f bharathva-auth      # Auth service
docker logs -f bharathva-gateway   # Gateway
docker logs -f bharathva-discovery # Discovery
```

### Rebuild and restart:
```bash
docker-compose build auth-service && docker-compose up -d auth-service
```

### Check service health:
```bash
docker-compose ps
```

---

## 🎉 You're All Set!

Your BharathVA backend is now fully operational with:

✅ **JWT Authentication** - Stateless, secure tokens  
✅ **Console Logging** - Track every operation with emojis  
✅ **Microservices Architecture** - Scalable and distributed  
✅ **Service Discovery** - Automatic service registration  
✅ **API Gateway** - Single entry point for mobile app  
✅ **Email OTP** - Secure email verification  
✅ **UUID Primary Keys** - Secure, non-sequential IDs  
✅ **Clean Code** - Well-structured and maintainable  

**Happy Testing! 🚀**


