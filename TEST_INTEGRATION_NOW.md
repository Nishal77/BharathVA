# 🚀 Test Mobile + Backend Integration NOW

## ✅ Backend Status: RUNNING

```
✅ Discovery Service (8761) - Healthy
✅ Gateway Service (8080) - Running  
✅ Auth Service (8081) - Healthy
✅ Neon Database - Connected
✅ Gmail SMTP - Configured
```

---

## 📱 Step-by-Step Testing Guide

### 1️⃣ Update Mobile API Configuration

**File:** `apps/mobile/services/api/config.ts`

**For iOS Simulator (current):**
```typescript
BASE_URL: 'http://localhost:8080/api'
```

**For Android Emulator:**
```typescript
BASE_URL: 'http://10.0.2.2:8080/api'
```

**For Physical Device:**
```bash
# First, find your local IP:
ipconfig getifaddr en0
# Example output: 192.168.1.100

# Then update config.ts:
BASE_URL: 'http://192.168.1.100:8080/api'
```

---

### 2️⃣ Start Mobile App

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/apps/mobile

# Start Metro bundler
npm start

# Or run directly on iOS
npx expo run:ios

# Or run on Android
npx expo run:android
```

---

### 3️⃣ Test Complete Registration Flow

#### **Step 1: Email Registration**
1. Open the app → Registration screen appears
2. Enter email: `test@example.com` (or use real email to get OTP)
3. Tap **Next** button
4. **Loading spinner appears**
5. **Alert shows:** "Success! 📧 A 6-digit verification code has been sent to your email"
6. **Check terminal/console:** Should see `[API] POST http://localhost:8080/api/auth/register/email`

**What happens in backend:**
- Creates registration session
- Generates 6-digit OTP
- Sends email via Gmail SMTP
- Returns sessionToken

---

#### **Step 2: Verify OTP**
1. **Check your email inbox** → You'll receive:
   ```
   Subject: BharathVA - Your Email Verification Code
   Content: Your 6-digit OTP (e.g., 847592)
   Valid for: 10 minutes
   ```
2. Enter the 6-digit OTP code
3. Tap **Verify** button
4. **Loading spinner appears**
5. **Alert shows:** "Success! ✅ Email verified successfully!"
6. Screen automatically moves to **Details** step

**What happens in backend:**
- Validates OTP from database
- Marks email as verified
- Updates registration session

---

#### **Step 3: Submit Details**
1. Enter **Full Name:** `Nishal Poojary`
2. Enter **Phone Number:** `9876543210`
3. Select **Country Code:** `+91` (default)
4. Select **Date of Birth:** `15/05/1995`
5. Tap **Next** button
6. **Loading spinner appears**
7. **Alert shows:** "Details saved successfully!"
8. Screen moves to **Password** step

**What happens in backend:**
- Saves details to registration session
- Updates current step

---

#### **Step 4: Create Password**
1. Enter **Password:** `SecurePass123!`
2. Enter **Confirm Password:** `SecurePass123!`
3. Tap **Continue** button
4. **Loading spinner appears**
5. **Alert shows:** "Password created successfully!"
6. Screen moves to **Username** step

**What happens in backend:**
- Validates password strength
- Hashes password with BCrypt (strength 12)
- Saves to registration session

---

#### **Step 5: Choose Username**
1. Start typing username: `nishalp`
2. **See real-time feedback:**
   - While typing → ⏳ "Checking availability..."
   - If available → ✓ "Username is available" (green)
   - If taken → ✗ "Username is already taken" (red)
   - If too short → ! "Username must be at least 3 characters"
3. Once you see **✓ Username is available**
4. Tap **Continue** button
5. **Loading spinner appears**
6. **Alert shows:** "Registration Complete! 🎉 Welcome to BharathVA, @nishalp! Check your email for a welcome message."
7. **Check email inbox** → You'll receive:
   ```
   Subject: Welcome to BharathVA, @nishalp!
   Content: Welcome message with Indian flag colors
   ```
8. Tap **Continue** in alert
9. **App navigates to home screen** (user123 for now)

**What happens in backend:**
- Creates user in database
- Copies all data from registration session
- Deletes registration session (cleanup)
- Sends welcome email
- Returns success

---

### 4️⃣ Verify Database Storage

**Check if user was created:**

```bash
# Backend is already running with database connection
# The user data is stored in Neon PostgreSQL

# You can check via Neon Dashboard:
# https://console.neon.tech/

# Or query via Postman/API:
# GET http://localhost:8080/api/auth/users
# (if you create this endpoint later)
```

**User data stored:**
```json
{
  "id": 1,
  "fullName": "Nishal Poojary",
  "username": "nishalp",
  "email": "test@example.com",
  "phoneNumber": "9876543210",
  "countryCode": "+91",
  "dateOfBirth": "1995-05-15",
  "passwordHash": "$2a$12$...", // BCrypt hash
  "isEmailVerified": true,
  "createdAt": "2025-10-10T17:05:00",
  "updatedAt": "2025-10-10T17:05:00"
}
```

---

## 🐛 Debugging Tips

### Check API Calls

**In Metro bundler console, you'll see:**
```
[API] POST http://localhost:8080/api/auth/register/email
[API] Success: OTP sent to your email
Registration response: { sessionToken: "8e367a52-...", ... }

[API] POST http://localhost:8080/api/auth/register/verify-otp
[API] Success: Email verified successfully
OTP verification response: { currentStep: "DETAILS", ... }

[API] POST http://localhost:8080/api/auth/register/details
[API] Success: Details saved successfully

... etc
```

---

### Common Issues

**Issue 1:** "Network error. Please check your connection."
```
✅ Fix: 
1. Check backend is running:
   curl http://localhost:8080/api/auth/register/health
   
2. Verify BASE_URL in config.ts
   - iOS Simulator: localhost:8080
   - Android Emulator: 10.0.2.2:8080
   - Physical Device: YOUR_IP:8080
```

---

**Issue 2:** "sessionToken is required"
```
✅ Fix: 
Check console logs - sessionToken should be logged after email registration.
If it's not being saved, the backend didn't return it.

Check backend logs:
docker logs bharathva-auth
```

---

**Issue 3:** No email received
```
✅ Fix:
1. Check spam/junk folder
2. Backend SMTP configured: zpge fisd qker ffog
3. Check backend logs:
   docker logs bharathva-auth | grep "Email sent"
```

---

**Issue 4:** Username always showing "taken"
```
✅ Fix:
Backend might not be responding to check-username endpoint.

Test manually:
curl "http://localhost:8080/api/auth/register/check-username?username=testuser"

Should return:
{"success":true,"message":"Username is available","data":{"available":true}}
```

---

## 📊 API Calls Made During Registration

```
1. POST /api/auth/register/email
   Body: { "email": "test@example.com" }
   Response: { "sessionToken": "8e367a52-..." }

2. POST /api/auth/register/verify-otp
   Body: { "sessionToken": "8e367a52-...", "otp": "847592" }
   Response: { "currentStep": "DETAILS" }

3. POST /api/auth/register/details
   Body: { 
     "sessionToken": "8e367a52-...",
     "fullName": "Nishal Poojary",
     "phoneNumber": "9876543210",
     "countryCode": "+91",
     "dateOfBirth": "1995-05-15"
   }
   Response: { "currentStep": "PASSWORD" }

4. POST /api/auth/register/password
   Body: {
     "sessionToken": "8e367a52-...",
     "password": "SecurePass123!",
     "confirmPassword": "SecurePass123!"
   }
   Response: { "currentStep": "USERNAME" }

5. GET /api/auth/register/check-username?username=nishalp
   Response: { "available": true }

6. POST /api/auth/register/username
   Body: {
     "sessionToken": "8e367a52-...",
     "username": "nishalp"
   }
   Response: { "currentStep": "COMPLETED" }
```

---

## ✅ Success Checklist

After testing, you should have:

- [x] Backend running (3 services)
- [ ] Mobile app running
- [ ] Email registration works
- [ ] OTP email received
- [ ] OTP verification works
- [ ] Details submission works
- [ ] Password creation works
- [ ] Username availability check works (real-time)
- [ ] Registration completes
- [ ] Welcome email received
- [ ] User data in Neon database
- [ ] App navigates to home screen

---

## 🎯 Quick Test Commands

**Test from terminal while app is running:**

```bash
# 1. Check backend health
curl http://localhost:8080/api/auth/register/health

# 2. Test email registration (use your real email to get OTP)
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"nishalpoojary@gmail.com"}'

# 3. Check username availability
curl "http://localhost:8080/api/auth/register/check-username?username=nishalp"

# 4. View running services
docker ps
```

---

## 🎉 Expected Result

After completing the flow, you should see:

**Mobile App:**
```
✅ Loading spinners during API calls
✅ Success alerts at each step
✅ Real-time username availability checking
✅ Final success alert with username
✅ Navigation to home screen
```

**Email Inbox:**
```
✅ OTP email (6 digits)
✅ Welcome email (with @username)
```

**Database (Neon):**
```
✅ User record in 'users' table
✅ All fields populated correctly
✅ Email verified = true
✅ Password hashed with BCrypt
```

**Console Logs:**
```
✅ All API calls logged
✅ Session token saved
✅ Responses logged
✅ No errors
```

---

## 📱 Next Steps After Testing

Once you've verified the integration works:

1. **Update home navigation** to use actual user ID from response
2. **Add JWT token storage** for authentication
3. **Implement login flow** (reuse backend structure)
4. **Add secure storage** for session tokens (Keychain/Keystore)
5. **Implement logout** functionality
6. **Add profile management** APIs

---

**🚀 Start Testing NOW!**

```bash
# Terminal 1: Backend is already running ✅
docker ps

# Terminal 2: Start mobile app
cd apps/mobile && npm start
```

**🇮🇳 Good luck! Jai Hind!**

