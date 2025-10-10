# 📱 Postman Testing Guide - BharathVA Backend

## ✅ Step 1: Import Collection (1 minute)

### In Postman:

1. Open **Postman Desktop** app
2. Click **Import** button (top-left corner)
3. Click **files** tab
4. Navigate to and select this file:
   ```
   /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend/POSTMAN_COLLECTION.json
   ```
5. Click **Import**

✅ You'll see: **"BharathVA Registration API"** collection with 8 requests

---

## ✅ Step 2: Create Environment (1 minute)

### In Postman:

1. Click **Environments** (left sidebar)
2. Click **+** button (top-right)
3. Name it: **BharathVA**
4. Add these 3 variables:

**Click "Add a new variable" for each:**

| VARIABLE | TYPE | INITIAL VALUE | CURRENT VALUE |
|----------|------|---------------|---------------|
| `baseUrl` | default | `http://localhost:8080/api/auth` | `http://localhost:8080/api/auth` |
| `testEmail` | default | `nishalpoojary@gmail.com` | `nishalpoojary@gmail.com` |
| `sessionToken` | default | *(leave empty)* | *(leave empty)* |

5. Click **Save** (top-right)
6. **Select "BharathVA"** from dropdown (top-right corner, next to eye icon)

---

## 🧪 Step 3: Test Each Endpoint (10 minutes)

### 📝 Before You Start:
- Make sure Docker services are running: `docker ps` should show 3 containers
- You'll receive 2 emails during this process (OTP & Welcome)

---

### Test 1: Health Check ✅

1. Click **"Health Check"** request in left sidebar
2. Click **Send** button (blue, right side)

**Expected Response:**
```json
{
    "success": true,
    "message": "Registration service is running",
    "data": "OK",
    "timestamp": "2025-10-10T..."
}
```

**Status:** Should show **200 OK** (green)

**✅ If you see this, service is working!**

---

### Test 2: Register Email 📧

1. Click **"1. Register Email"** request
2. Look at **Body** tab (should show):
   ```json
   {
       "email": "{{testEmail}}"
   }
   ```
3. Click **Send** button

**Expected Response:**
```json
{
    "success": true,
    "message": "OTP sent to your email",
    "data": {
        "sessionToken": "8e367a52-c684-4e2a-aa2f-09ce5a2755f5",
        "currentStep": "OTP",
        "email": "nishalpoojary@gmail.com",
        "message": "OTP sent to your email. Please verify."
    },
    "timestamp": "2025-10-10T..."
}
```

**Check in Postman:**
- Open **Console** (bottom panel, or View → Show Postman Console)
- Should see: `✅ Session Token saved: 8e367a52-...`

**✅ sessionToken auto-saved!** You don't need to copy it.

**📧 NOW CHECK YOUR EMAIL:** nishalpoojary@gmail.com

You should receive email with:
- **Subject:** "BharathVA - Your Email Verification Code"
- **Body:** 6-digit OTP (like 123456)
- **Theme:** Indian flag colors 🧡🤍💚

---

### Test 3: Verify OTP 🔐

1. **Check your Gmail inbox** for the OTP code
2. Click **"2. Verify OTP"** request
3. Click on **Body** tab
4. **Replace the OTP:**
   ```json
   {
       "sessionToken": "{{sessionToken}}",
       "otp": "123456"  ← CHANGE THIS TO YOUR OTP FROM EMAIL!
   }
   ```
   For example, if your OTP is `847592`, change to:
   ```json
   {
       "sessionToken": "{{sessionToken}}",
       "otp": "847592"
   }
   ```
5. Click **Send**

**Expected Response:**
```json
{
    "success": true,
    "message": "Email verified successfully",
    "data": {
        "sessionToken": "8e367a52-...",
        "currentStep": "DETAILS",
        "message": "Email verified successfully. Please provide your details."
    }
}
```

**✅ OTP verified! Moving to next step.**

---

### Test 4: Submit User Details 👤

1. Click **"4. Submit User Details"** request
2. Look at **Body** tab:
   ```json
   {
       "sessionToken": "{{sessionToken}}",
       "fullName": "Nishal Poojary",
       "phoneNumber": "9876543210",
       "countryCode": "+91",
       "dateOfBirth": "1995-05-15"
   }
   ```
3. **Update values if you want:**
   - Change name, phone, date of birth
4. Click **Send**

**Expected Response:**
```json
{
    "success": true,
    "message": "Details saved successfully",
    "data": {
        "currentStep": "PASSWORD",
        "message": "Details saved. Please create a password."
    }
}
```

**✅ Details saved!**

---

### Test 5: Create Password 🔒

1. Click **"5. Create Password"** request
2. Look at **Body** tab:
   ```json
   {
       "sessionToken": "{{sessionToken}}",
       "password": "SecurePass123!",
       "confirmPassword": "SecurePass123!"
   }
   ```
3. **Change password if you want** (min 8 characters)
4. Click **Send**

**Expected Response:**
```json
{
    "success": true,
    "message": "Password created successfully",
    "data": {
        "currentStep": "USERNAME",
        "message": "Password created. Please choose a username."
    }
}
```

**✅ Password created!**

---

### Test 6: Check Username Availability 🔍

1. Click **"6. Check Username Availability"** request
2. Look at **Params** tab:
   - Key: `username`
   - Value: `nishalpoojary` ← **Change this to your desired username**
3. Click **Send**

**If Available:**
```json
{
    "success": true,
    "message": "Username is available",
    "data": {
        "available": true
    }
}
```

**If Taken:**
```json
{
    "success": true,
    "message": "Username is taken",
    "data": {
        "available": false
    }
}
```

**Try different usernames until you find an available one!**

---

### Test 7: Create Username (Complete!) 🎉

1. Click **"7. Create Username (Complete!)"** request
2. Look at **Body** tab:
   ```json
   {
       "sessionToken": "{{sessionToken}}",
       "username": "nishalpoojary"  ← Use the available username!
   }
   ```
3. Click **Send**

**Expected Response:**
```json
{
    "success": true,
    "message": "Registration completed successfully!",
    "data": {
        "sessionToken": null,
        "currentStep": "COMPLETED",
        "message": "Registration completed successfully! Welcome to BharathVA!"
    }
}
```

**🎉 REGISTRATION COMPLETE!**

**📧 CHECK YOUR EMAIL AGAIN!**

You should receive:
- **Subject:** "Welcome to BharathVA, @nishalpoojary!"
- **Content:** Welcome message with Indian flag theme

---

## 📊 Quick Reference

### All Endpoints:

| # | Request Name | Method | Endpoint | What It Does |
|---|--------------|--------|----------|--------------|
| 0 | Health Check | GET | `/register/health` | Check if service is running |
| 1 | Register Email | POST | `/register/email` | Start registration, send OTP |
| 2 | Verify OTP | POST | `/register/verify-otp` | Verify email with OTP |
| 3 | Resend OTP | POST | `/register/resend-otp` | Resend OTP if needed |
| 4 | Submit Details | POST | `/register/details` | Add name, phone, DOB |
| 5 | Create Password | POST | `/register/password` | Set account password |
| 6 | Check Username | GET | `/register/check-username` | Check if username available |
| 7 | Create Username | POST | `/register/username` | Finalize registration |

---

## ⚠️ Common Issues & Fixes

### Issue: "Could not send request"

**Error:** `Error: connect ECONNREFUSED`

**Fix:** Services not running. Start Docker:
```bash
docker-compose up
```

---

### Issue: "Invalid or expired OTP"

**Reasons:**
- Wrong OTP entered
- OTP expired (10 minutes)
- Used wrong email

**Fix:**
- Check email again for correct OTP
- Use **"3. Resend OTP"** to get new code
- Verify email matches in Test 2

---

### Issue: "Invalid session"

**Reason:** sessionToken not saved

**Fix:**
- Check Console (View → Show Postman Console)
- Look for: `✅ Session Token saved: ...`
- Re-run "1. Register Email" if needed

---

### Issue: "Username already taken"

**Fix:**
- Try different username in Test 7
- Use underscores: `nishal_poojary`
- Add numbers: `nishalpoojary123`

---

## 💡 Pro Tips

### Tip 1: View Auto-Tests

After sending each request:
- Click **Test Results** tab (below response)
- Should show ✅ green checkmarks

### Tip 2: View Console Logs

Open Postman Console:
- **View** → **Show Postman Console** (or Cmd+Alt+C)
- See helpful messages like:
  ```
  ✅ Session Token saved: 8e367a52-...
  📧 CHECK YOUR EMAIL FOR OTP!
  ✅ OTP verified! Moving to details step.
  🎉 REGISTRATION COMPLETE!
  ```

### Tip 3: Save Responses

After successful registration:
- Click **Save Response** → **Save as Example**
- Useful for reference later

---

## 📧 Expected Emails

### Email 1: OTP Verification

**Arrives:** After Test 2 (Register Email)

**Subject:** BharathVA - Your Email Verification Code

**Content:**
- 6-digit code (e.g., 847592)
- Valid for 10 minutes
- Indian flag colored design

**Example:**
```
Your Verification Code

  8 4 7 5 9 2

Valid for 10 minutes

🧡 🤍 💚
```

---

### Email 2: Welcome Message

**Arrives:** After Test 7 (Create Username)

**Subject:** Welcome to BharathVA, @nishalpoojary!

**Content:**
- Congratulations message
- Platform introduction
- Indian flag themed design

---

## 🎯 Complete Test Run Summary

**Time:** ~10 minutes

**Steps:**
1. Health Check (10 sec)
2. Register Email (10 sec) → Check Gmail (30 sec)
3. Verify OTP (10 sec)
4. Submit Details (10 sec)
5. Create Password (10 sec)
6. Check Username (10 sec)
7. Create Username (10 sec) → Check Gmail (30 sec)

**Result:** User registered in database! 🎉

---

## 📊 View in Database (Optional)

Your data is stored in **Neon PostgreSQL**:

```sql
-- User data in users table
SELECT * FROM users WHERE email = 'nishalpoojary@gmail.com';

-- Should show:
-- id | full_name | username | email | is_email_verified
-- 1  | Nishal Poojary | nishalpoojary | nishalpoojary@gmail.com | true
```

---

## 🔄 Test Again with Different Email

1. Change `testEmail` environment variable to new email
2. Run all tests again
3. You can register multiple users!

---

## ✅ Success Checklist

- [ ] Postman collection imported
- [ ] Environment created with 3 variables
- [ ] Environment selected (top-right)
- [ ] Health check passed
- [ ] Email registration worked
- [ ] OTP email received
- [ ] OTP verified successfully
- [ ] Details submitted
- [ ] Password created
- [ ] Username checked
- [ ] Registration completed
- [ ] Welcome email received

---

## 🎉 Done!

If all tests pass, your backend is **fully operational**!

**Next:** Integrate with your React Native mobile app in `apps/mobile/`

**API Base URL for mobile:**
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

---

**Happy Testing! 🚀**

**🇮🇳 Jai Hind!**

