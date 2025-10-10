# Postman Testing Guide - BharathVA Backend

Complete guide to test all registration endpoints using Postman.

## 📥 Quick Setup

### Option 1: Import Collection (Recommended)

1. Open Postman
2. Click **Import** button
3. Copy the JSON collection below
4. Save as `BharathVA_Registration.postman_collection.json`
5. Import into Postman

### Option 2: Manual Setup

Follow the step-by-step guide below to create requests manually.

---

## 🔧 Environment Setup

### Create Environment in Postman

1. Click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it: `BharathVA Local`
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:8080/api` | `http://localhost:8080/api` |
| `authUrl` | `http://localhost:8081/auth` | `http://localhost:8081/auth` |
| `sessionToken` | | *(will be auto-filled)* |
| `testEmail` | `your-email@gmail.com` | `your-email@gmail.com` |

5. Click **Save**
6. Select this environment (top-right dropdown)

---

## 📝 Complete Test Collection

### Folder Structure

```
BharathVA Registration
├── 0. Health Check
├── 1. Register Email
├── 2. Verify OTP
├── 3. Resend OTP
├── 4. Submit Details
├── 5. Create Password
├── 6. Check Username
└── 7. Create Username (Complete)
```

---

## 🧪 Individual Test Cases

### 0️⃣ Health Check

**Request:**
```
GET {{baseUrl}}/auth/register/health
```

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200 OK):**
```json
{
    "success": true,
    "message": "Registration service is running",
    "data": "OK",
    "timestamp": "2024-10-10T15:30:00"
}
```

**✅ Test Script (Auto-verify):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Service is running", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.eql("OK");
});
```

---

### 1️⃣ Register Email

**Request:**
```
POST {{baseUrl}}/auth/register/email
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "email": "{{testEmail}}"
}
```

**Expected Response (200 OK):**
```json
{
    "success": true,
    "message": "OTP sent to your email",
    "data": {
        "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
        "currentStep": "OTP",
        "email": "your-email@gmail.com",
        "message": "OTP sent to your email. Please verify."
    },
    "timestamp": "2024-10-10T15:30:00"
}
```

**✅ Test Script (Auto-save sessionToken):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Session token is present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.sessionToken).to.exist;
    
    // Save session token for next requests
    pm.environment.set("sessionToken", jsonData.data.sessionToken);
});

pm.test("Current step is OTP", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.currentStep).to.eql("OTP");
});

console.log("✅ Session Token saved:", pm.environment.get("sessionToken"));
console.log("📧 Check your email for OTP!");
```

**📧 Action Required:** Check your email inbox for the OTP!

---

### 2️⃣ Verify OTP

**Request:**
```
POST {{baseUrl}}/auth/register/verify-otp
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "sessionToken": "{{sessionToken}}",
    "otp": "123456"
}
```

**⚠️ Replace:** `123456` with the actual OTP from your email!

**Expected Response (200 OK):**
```json
{
    "success": true,
    "message": "Email verified successfully",
    "data": {
        "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
        "currentStep": "DETAILS",
        "message": "Email verified successfully. Please provide your details."
    },
    "timestamp": "2024-10-10T15:31:00"
}
```

**❌ Error Response (Invalid OTP):**
```json
{
    "success": false,
    "message": "Invalid or expired OTP",
    "data": null,
    "timestamp": "2024-10-10T15:31:00"
}
```

**✅ Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("OTP verified successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.currentStep).to.eql("DETAILS");
});

console.log("✅ OTP verified! Moving to details step.");
```

---

### 3️⃣ Resend OTP (Optional)

**Request:**
```
POST {{baseUrl}}/auth/register/resend-otp
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "sessionToken": "{{sessionToken}}"
}
```

**Expected Response (200 OK):**
```json
{
    "success": true,
    "message": "OTP resent successfully",
    "data": {
        "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
        "currentStep": "OTP",
        "message": "New OTP sent to your email."
    },
    "timestamp": "2024-10-10T15:32:00"
}
```

**✅ Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("OTP resent successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

console.log("📧 New OTP sent! Check your email.");
```

---

### 4️⃣ Submit User Details

**Request:**
```
POST {{baseUrl}}/auth/register/details
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "sessionToken": "{{sessionToken}}",
    "fullName": "Nishal Poojary",
    "phoneNumber": "9876543210",
    "countryCode": "+91",
    "dateOfBirth": "1995-05-15"
}
```

**Expected Response (200 OK):**
```json
{
    "success": true,
    "message": "Details saved successfully",
    "data": {
        "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
        "currentStep": "PASSWORD",
        "message": "Details saved. Please create a password."
    },
    "timestamp": "2024-10-10T15:33:00"
}
```

**✅ Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Details saved successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.currentStep).to.eql("PASSWORD");
});

console.log("✅ Details saved! Moving to password step.");
```

---

### 5️⃣ Create Password

**Request:**
```
POST {{baseUrl}}/auth/register/password
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "sessionToken": "{{sessionToken}}",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
}
```

**Expected Response (200 OK):**
```json
{
    "success": true,
    "message": "Password created successfully",
    "data": {
        "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
        "currentStep": "USERNAME",
        "message": "Password created. Please choose a username."
    },
    "timestamp": "2024-10-10T15:34:00"
}
```

**❌ Validation Error (Passwords don't match):**
```json
{
    "success": false,
    "message": "Passwords do not match",
    "data": null,
    "timestamp": "2024-10-10T15:34:00"
}
```

**✅ Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Password created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.currentStep).to.eql("USERNAME");
});

console.log("✅ Password created! Moving to username step.");
```

---

### 6️⃣ Check Username Availability

**Request:**
```
GET {{baseUrl}}/auth/register/check-username?username=nishalpoojary
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
| Key | Value |
|-----|-------|
| `username` | `nishalpoojary` |

**Expected Response (200 OK - Available):**
```json
{
    "success": true,
    "message": "Username is available",
    "data": {
        "available": true
    },
    "timestamp": "2024-10-10T15:35:00"
}
```

**Expected Response (200 OK - Taken):**
```json
{
    "success": true,
    "message": "Username is taken",
    "data": {
        "available": false
    },
    "timestamp": "2024-10-10T15:35:00"
}
```

**✅ Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has availability status", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('available');
});

var jsonData = pm.response.json();
if (jsonData.data.available) {
    console.log("✅ Username is available!");
} else {
    console.log("❌ Username is taken. Try another.");
}
```

---

### 7️⃣ Create Username (Complete Registration)

**Request:**
```
POST {{baseUrl}}/auth/register/username
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "sessionToken": "{{sessionToken}}",
    "username": "nishalpoojary"
}
```

**Expected Response (200 OK):**
```json
{
    "success": true,
    "message": "Registration completed successfully!",
    "data": {
        "sessionToken": null,
        "currentStep": "COMPLETED",
        "message": "Registration completed successfully! Welcome to BharathVA!"
    },
    "timestamp": "2024-10-10T15:36:00"
}
```

**❌ Error Response (Username taken):**
```json
{
    "success": false,
    "message": "Username is already taken. Please choose another.",
    "data": null,
    "timestamp": "2024-10-10T15:36:00"
}
```

**✅ Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Registration completed", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data.currentStep).to.eql("COMPLETED");
});

console.log("🎉 Registration completed successfully!");
console.log("📧 Check your email for welcome message!");

// Clear session token
pm.environment.set("sessionToken", "");
```

**📧 Action:** Check your email for the welcome message!

---

## 🎯 Complete Test Flow

### Step-by-Step Testing

1. **Run Health Check** ✅
   - Verify service is running

2. **Register Email** 📧
   - Use your real email
   - Note the sessionToken (auto-saved)
   - Check email for OTP

3. **Verify OTP** 🔐
   - Copy OTP from email
   - Paste in request
   - Submit

4. **Submit Details** 👤
   - Fill in your information
   - Submit

5. **Create Password** 🔒
   - Enter secure password
   - Confirm it matches
   - Submit

6. **Check Username** 🔍
   - Test different usernames
   - Find an available one

7. **Create Username** 🎉
   - Use available username
   - Complete registration
   - Check welcome email!

---

## 📦 Postman Collection JSON

Copy this and import into Postman:

```json
{
  "info": {
    "name": "BharathVA Registration API",
    "description": "Complete registration flow testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "0. Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/auth/register/health",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "health"]
        }
      }
    },
    {
      "name": "1. Register Email",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "var jsonData = pm.response.json();",
              "pm.environment.set('sessionToken', jsonData.data.sessionToken);",
              "",
              "console.log('Session Token:', pm.environment.get('sessionToken'));",
              "console.log('Check your email for OTP!');"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"email\": \"{{testEmail}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register/email",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "email"]
        }
      }
    },
    {
      "name": "2. Verify OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"sessionToken\": \"{{sessionToken}}\",\n    \"otp\": \"123456\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register/verify-otp",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "verify-otp"]
        }
      }
    },
    {
      "name": "3. Resend OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"sessionToken\": \"{{sessionToken}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register/resend-otp",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "resend-otp"]
        }
      }
    },
    {
      "name": "4. Submit Details",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"sessionToken\": \"{{sessionToken}}\",\n    \"fullName\": \"Nishal Poojary\",\n    \"phoneNumber\": \"9876543210\",\n    \"countryCode\": \"+91\",\n    \"dateOfBirth\": \"1995-05-15\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register/details",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "details"]
        }
      }
    },
    {
      "name": "5. Create Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"sessionToken\": \"{{sessionToken}}\",\n    \"password\": \"SecurePass123!\",\n    \"confirmPassword\": \"SecurePass123!\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register/password",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "password"]
        }
      }
    },
    {
      "name": "6. Check Username",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/auth/register/check-username?username=nishalpoojary",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "check-username"],
          "query": [
            {
              "key": "username",
              "value": "nishalpoojary"
            }
          ]
        }
      }
    },
    {
      "name": "7. Create Username",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Registration completed', function () {",
              "    var jsonData = pm.response.json();",
              "    pm.expect(jsonData.data.currentStep).to.eql('COMPLETED');",
              "});",
              "",
              "console.log('🎉 Registration completed!');",
              "console.log('📧 Check your email for welcome message!');"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"sessionToken\": \"{{sessionToken}}\",\n    \"username\": \"nishalpoojary\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register/username",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register", "username"]
        }
      }
    }
  ]
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path (Complete Registration)
1. Health Check → ✅
2. Register Email → ✅
3. Verify OTP → ✅
4. Submit Details → ✅
5. Create Password → ✅
6. Check Username → ✅ Available
7. Create Username → ✅ Completed

### Scenario 2: Invalid OTP
1. Register Email → ✅
2. Verify with wrong OTP → ❌ "Invalid or expired OTP"

### Scenario 3: Expired OTP
1. Register Email → ✅
2. Wait 11 minutes
3. Verify OTP → ❌ "Invalid or expired OTP"
4. Resend OTP → ✅
5. Verify with new OTP → ✅

### Scenario 4: Username Already Taken
1. Complete registration with "nishalpoojary"
2. Start new registration
3. Try same username → ❌ "Username is already taken"

### Scenario 5: Password Validation
1. Register → Details → ✅
2. Try password "abc" → ❌ Validation error (min 8 chars)
3. Try mismatched passwords → ❌ "Passwords do not match"

---

## 📊 Expected Results Summary

| Step | Expected Status | Expected Data |
|------|----------------|---------------|
| Health Check | 200 | `success: true` |
| Register Email | 200 | sessionToken, currentStep: "OTP" |
| Verify OTP | 200 | currentStep: "DETAILS" |
| Submit Details | 200 | currentStep: "PASSWORD" |
| Create Password | 200 | currentStep: "USERNAME" |
| Check Username | 200 | `available: true/false` |
| Create Username | 200 | currentStep: "COMPLETED" |

---

## 🎓 Pro Tips

### Auto-Save Session Token
The collection automatically saves `sessionToken` after step 1. You don't need to copy-paste it!

### Test Multiple Registrations
Change the `testEmail` environment variable to test with different emails.

### Quick Username Testing
Try different usernames in step 6:
- `nishalpoojary`
- `test_user_123`
- `bharathva_fan`

### Check Response Times
Look at the time shown in Postman. All requests should complete in < 2 seconds.

### Console Logs
Check Postman Console (View → Show Postman Console) for detailed logs!

---

## 🚀 Running Collection

### Run Entire Collection
1. Click collection name
2. Click **Run**
3. Select all requests
4. Click **Run BharathVA Registration API**
5. Watch automated tests!

⚠️ **Note**: You'll need to manually enter OTP from email during the run.

---

## ✅ Success Checklist

- [ ] Environment created with `baseUrl` and `testEmail`
- [ ] Collection imported successfully
- [ ] Health check passes
- [ ] Email registration works
- [ ] OTP email received
- [ ] OTP verification successful
- [ ] Details submission works
- [ ] Password creation works
- [ ] Username availability check works
- [ ] Registration completes
- [ ] Welcome email received

---

**🎉 Happy Testing!**

**Jai Hind! 🇮🇳**

