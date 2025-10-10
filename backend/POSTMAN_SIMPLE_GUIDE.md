# Postman Testing - Simple Guide

Quick guide to test BharathVA registration API with Postman.

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button (top-left)
3. Click **File** tab
4. Select: `/Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend/POSTMAN_COLLECTION.json`
5. Click **Import**

You'll see: "BharathVA Registration API" collection with 8 requests.

### Step 2: Create Environment

1. Click **Environments** (left sidebar)
2. Click **+** (Create Environment)
3. Name it: `BharathVA Local`
4. Add these 3 variables:

| Variable Name | Value |
|---------------|-------|
| `baseUrl` | `http://localhost:8080/api/auth` |
| `testEmail` | `YOUR_EMAIL@gmail.com` |
| `sessionToken` | *(leave empty)* |

5. Click **Save**
6. Select "BharathVA Local" from dropdown (top-right)

---

## 🧪 Test Flow (5 minutes)

### Test 1: Health Check

1. Click "Health Check" request
2. Click **Send** button
3. You should see:
```json
{
  "success": true,
  "message": "Registration service is running",
  "data": "OK"
}
```

✅ **Service is working!**

---

### Test 2: Register Email

1. Click "1. Register Email"
2. Update `testEmail` variable if needed (top-right)
3. Click **Send**

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
    "currentStep": "OTP",
    "email": "your@email.com"
  }
}
```

✅ **sessionToken auto-saved!** (check Console)

📧 **CHECK YOUR EMAIL FOR OTP!**

---

### Test 3: Verify OTP

1. **Check your email** for OTP (6-digit code)
2. Click "2. Verify OTP" request
3. In **Body** tab, replace `123456` with your actual OTP:
```json
{
  "sessionToken": "{{sessionToken}}",
  "otp": "YOUR_OTP_HERE"
}
```
4. Click **Send**

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "currentStep": "DETAILS"
  }
}
```

✅ **OTP verified!**

---

### Test 4: Submit Details

1. Click "4. Submit User Details"
2. Update details in **Body** if needed:
```json
{
  "sessionToken": "{{sessionToken}}",
  "fullName": "Nishal Poojary",
  "phoneNumber": "9876543210",
  "countryCode": "+91",
  "dateOfBirth": "1995-05-15"
}
```
3. Click **Send**

✅ **Details saved!**

---

### Test 5: Create Password

1. Click "5. Create Password"
2. Body already configured:
```json
{
  "sessionToken": "{{sessionToken}}",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```
3. Click **Send**

✅ **Password created!**

---

### Test 6: Check Username

1. Click "6. Check Username Availability"
2. In URL, change username if needed:
```
http://localhost:8080/api/auth/register/check-username?username=nishalpoojary
```
3. Click **Send**

**If available:**
```json
{
  "success": true,
  "message": "Username is available",
  "data": {
    "available": true
  }
}
```

Try different usernames until you find an available one!

---

### Test 7: Complete Registration

1. Click "7. Create Username (Complete!)"
2. Update username in Body:
```json
{
  "sessionToken": "{{sessionToken}}",
  "username": "nishalpoojary"
}
```
3. Click **Send**

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully!",
  "data": {
    "currentStep": "COMPLETED"
  }
}
```

🎉 **REGISTRATION COMPLETE!**

📧 **Check email for welcome message!**

---

## 🎯 Auto-Test Scripts

The collection has built-in test scripts that:

✅ **Auto-verify responses** - Green checkmarks if successful
✅ **Auto-save sessionToken** - No need to copy manually!
✅ **Log messages** - See progress in Console

### View Console

View → Show Postman Console (or `Cmd+Alt+C`)

You'll see:
```
✅ Session Token saved: 550e8400-e29b-41d4-a716-446655440000
📧 CHECK YOUR EMAIL FOR OTP!
✅ OTP verified! Moving to details step.
✅ Details saved! Moving to password step.
🎉 REGISTRATION COMPLETE!
```

---

## 📊 Run Entire Collection

### Automated Testing

1. Click collection name: "BharathVA Registration API"
2. Click **Run** button
3. Select all requests
4. Click **Run BharathVA Registration API**

**Note:** You'll need to manually enter OTP from email during the run.

---

## 🔍 Inspect Responses

### Response Tabs

- **Body**: JSON response data
- **Cookies**: Session cookies (if any)
- **Headers**: Response headers
- **Test Results**: Auto-test results (✓ or ✗)

### Pretty vs Raw

- **Pretty**: Formatted JSON (easy to read)
- **Raw**: Unformatted response
- **Preview**: HTML preview (if applicable)

---

## ❌ Common Errors

### Error: Connection Refused

```json
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Fix:** Services not running. Start Docker:
```bash
docker-compose up
```

---

### Error: 503 Service Unavailable

```json
{
  "status": 503,
  "error": "Service Unavailable"
}
```

**Fix:** Auth Service not registered yet. Wait 30 seconds and retry.

---

### Error: Invalid OTP

```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**Fix:** 
- Check you entered correct OTP from email
- OTP expires in 10 minutes
- Use "3. Resend OTP" to get new code

---

### Error: Username Already Taken

```json
{
  "success": false,
  "message": "Username is already taken"
}
```

**Fix:** Try different username in step 7.

---

## 📧 Email Examples

### OTP Email

**Subject:** BharathVA - Your Email Verification Code

**Content:**
- 6-digit OTP code
- Valid for 10 minutes
- Indian flag themed design

### Welcome Email

**Subject:** Welcome to BharathVA, @yourusername!

**Content:**
- Congratulations message
- Platform introduction
- Indian flag themed

---

## 💡 Pro Tips

### 1. Save Requests

After successful tests, save requests for reuse:
- Right-click request → Duplicate
- Name it: "Register Email - Nishal"

### 2. Use Variables

Instead of hardcoding:
```json
{
  "email": "test@example.com"
}
```

Use variables:
```json
{
  "email": "{{testEmail}}"
}
```

### 3. Pre-request Scripts

Add to **Pre-request Script** tab to generate random data:
```javascript
pm.environment.set("randomEmail", `test${Date.now()}@example.com`);
```

### 4. Quick Tests

Add custom tests in **Tests** tab:
```javascript
pm.test("Email sent", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.currentStep).to.eql("OTP");
});
```

---

## 📋 Testing Checklist

Complete registration test:
- [ ] Health check passes
- [ ] Email registration works
- [ ] OTP email received
- [ ] OTP verification successful
- [ ] Details submission works
- [ ] Password creation works
- [ ] Username availability checked
- [ ] Username created
- [ ] Registration completed
- [ ] Welcome email received

---

## 🎉 Success!

If all tests pass, your backend is **fully operational**!

**You now have:**
- ✅ Working backend (4 microservices)
- ✅ Docker containers running
- ✅ Complete registration flow
- ✅ Email integration working
- ✅ Postman collection for testing

---

## 🚀 Next Steps

1. Integrate with your React Native mobile app
2. Add login functionality
3. Implement JWT authentication
4. Build more features!

**Check your mobile app folder:**
```
apps/mobile/app/(auth)/register/
```

Your existing components will work with these APIs:
- `SignInAsSupport.tsx` → `/register/email`
- `OTPVerification.tsx` → `/register/verify-otp`
- `details.tsx` → `/register/details`
- `CreatePassword.tsx` → `/register/password`
- `Username.tsx` → `/register/username`

---

**🎉 Happy Testing!**

**🇮🇳 Jai Hind!**

