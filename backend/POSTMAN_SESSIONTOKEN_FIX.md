# 🔧 Fix sessionToken Issue in Postman

## ❌ Problem

You're getting:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "sessionToken": "Session token is required"
  }
}
```

**Reason:** sessionToken variable is empty in Postman

---

## ✅ Solution: Manual Setup (2 Minutes)

### Step 1: Run Register Email and Copy Token

1. Click **"1. Register Email"** request
2. Click **Send**
3. In **Response**, you'll see:
```json
{
  "data": {
    "sessionToken": "8e367a52-c684-4e2a-aa2f-09ce5a2755f5"  ← COPY THIS!
  }
}
```

4. **Select and copy the entire sessionToken value** (the long UUID string)
   - Click inside the quotes
   - Triple-click to select all
   - Copy (`Cmd+C`)

---

### Step 2: Save to Environment

1. Click **Environments** icon (left sidebar, eye icon)
2. Find your `BharathVA` environment
3. Click on it to edit
4. Find `sessionToken` row
5. **Paste the token** in **CURRENT VALUE** column
6. Click **Save** (top-right)

---

### Step 3: Verify It's Saved

1. Click any other request (like "2. Verify OTP")
2. Click **Body** tab
3. Look at the JSON - you'll see `"sessionToken": "{{sessionToken}}"`
4. **Hover your mouse** over `{{sessionToken}}`
5. **Tooltip should show the actual UUID value**

If tooltip shows the UUID ✅ You're good!  
If tooltip shows empty ❌ Go back to Step 2

---

### Step 4: Now Run Other Requests

All other requests will work now! Continue with:
- 2. Verify OTP
- 4. Submit Details
- 5. Create Password
- 7. Create Username

---

## 🎯 Quick Visual Guide

```
POSTMAN INTERFACE:

Left Sidebar:
├── Collections
│   └── BharathVA Registration API
│       ├── Health Check
│       ├── 1. Register Email  ← Run this first
│       ├── 2. Verify OTP      ← sessionToken needed
│       ├── 3. Resend OTP
│       ├── 4. Submit Details  ← sessionToken needed
│       ├── 5. Create Password ← sessionToken needed
│       ├── 6. Check Username
│       └── 7. Create Username ← sessionToken needed
│
└── Environments
    └── BharathVA  ← Save sessionToken here
        ├── baseUrl: http://localhost:8080/api/auth
        ├── testEmail: nishalpoojary@gmail.com
        └── sessionToken: PASTE_HERE ← Important!
```

---

## 📝 Step-by-Step Example

### Request 1: Register Email

**Send this:**
```
POST http://localhost:8080/api/auth/register/email
Body: {"email": "nishalpoojary@gmail.com"}
```

**You get:**
```json
{
  "success": true,
  "data": {
    "sessionToken": "c2f97275-d182-47b0-b648-8610d869b618"  ← COPY THIS
  }
}
```

**Action:**
1. Copy: `c2f97275-d182-47b0-b648-8610d869b618`
2. Go to Environments → BharathVA
3. Paste in sessionToken CURRENT VALUE
4. Save

---

### Request 2: Verify OTP

**Before sending, check:**
```json
{
  "sessionToken": "{{sessionToken}}",  ← Hover here
  "otp": "123456"
}
```

**Hover over `{{sessionToken}}`**
- Should show: `c2f97275-d182-47b0-b648-8610d869b618`
- If empty: Go back and save token in environment!

**Update OTP from email, then Send**

---

## 🔍 Debugging

### Check if sessionToken is set:

**Method 1: Hover Test**
- In any request Body
- Hover over `{{sessionToken}}`
- Should show UUID value

**Method 2: Console**
- View → Show Postman Console
- After "Register Email", should see:
  ```
  Session Token: c2f97275-d182-47b0-b648-8610d869b618
  ```

**Method 3: Environment View**
- Click Environments
- Click BharathVA
- Check CURRENT VALUE column for sessionToken
- Should have UUID value

---

## ✅ Once Fixed, Complete Flow

```
1. Register Email → COPY TOKEN → Save to environment
2. Verify OTP → Update OTP → Send
3. Submit Details → Send
4. Create Password → Send  
5. Create Username → Send
6. DONE! 🎉
```

---

## 🎯 Summary

**Issue:** sessionToken variable empty  
**Fix:** Manually copy from response → Save in environment  
**Time:** 1 minute  

**After fix:** All requests work perfectly!

**Alternative:** See `POSTMAN_TESTING.md` for detailed guide

---

**🇮🇳 Jai Hind!**

