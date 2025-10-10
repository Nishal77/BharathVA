# 🔧 Fix Postman sessionToken Issue

## ❌ Problem

All requests after "Register Email" show:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "sessionToken": "Session token is required"
  }
}
```

**Cause:** sessionToken not being saved/used correctly in Postman

---

## ✅ Solution (2 Options)

### Option 1: Manual Fix (Quick - 1 minute)

#### After "1. Register Email" request:

1. **Send the request** - You'll get response like:
```json
{
  "data": {
    "sessionToken": "8e367a52-c684-4e2a-aa2f-09ce5a2755f5"
  }
}
```

2. **Copy the sessionToken** (the long UUID string)

3. **Update Environment Variable:**
   - Click **Environments** (left sidebar)
   - Select `BharathVA`
   - Find `sessionToken` variable
   - Paste the UUID in **CURRENT VALUE** column
   - Click **Save**

4. **Now run other requests** - They'll work!

---

### Option 2: Re-Import Fixed Collection (Better)

1. **Delete old collection:**
   - Right-click "BharathVA Registration API"
   - Click **Delete**

2. **Re-import:**
   - Click **Import**
   - Select: `backend/POSTMAN_COLLECTION.json`
   - Import

3. **The collection now has improved auto-save scripts!**

---

## 🧪 Test Again

### 1. Register Email
```
Send → Check response for sessionToken
Check Console (View → Show Postman Console)
Should see: "Session Token: 8e367a52-..."
```

### 2. Verify Manually Saved

```
Click Environments → BharathVA
Check sessionToken has value
If empty, copy from response and paste
```

### 3. Run Next Requests

Now all other requests will work!

---

## 🎯 Quick Test

Run this to verify sessionToken is being used:

```
After "1. Register Email":
- Click "2. Verify OTP"
- Look at Body tab
- Should show: "sessionToken": "{{sessionToken}}"
- Hover over {{sessionToken}} - should show the actual value
```

If hover shows empty, manually set it in environment!

---

## 💡 Alternative: Use Collection Variables

Instead of Environment variables:

1. Click collection name (BharathVA Registration API)
2. Click **Variables** tab
3. Set:
   - `baseUrl` = `http://localhost:8080/api/auth`
   - `testEmail` = `nishalpoojary@gmail.com`
   - `sessionToken` = *(will auto-fill)*
4. Save

Collection variables work better for auto-save!

---

## ✅ Checklist

- [ ] Re-import POSTMAN_COLLECTION.json
- [ ] Create/update environment with 3 variables
- [ ] Run "1. Register Email"
- [ ] Check Console for "Session Token: ..."
- [ ] Verify sessionToken saved in Environment
- [ ] If not, manually copy and paste
- [ ] Run remaining requests

---

**After fix, all requests will work!**

See `POSTMAN_TESTING.md` for complete flow.

