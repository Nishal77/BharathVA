# 🚀 Quick Start - BharathVA Backend

## ✅ Services Are Running!

```
bharathva-discovery (8761) - Healthy ✅
bharathva-gateway (8080) - Running ✅  
bharathva-auth (8081) - Healthy ✅
```

---

## 🧪 Test with Postman (5 Minutes)

### Step 1: Import Collection

1. Open **Postman**
2. Click **Import**
3. Select: `backend/POSTMAN_COLLECTION.json`

### Step 2: Setup Environment

1. Click **Environments**
2. Click **+** 
3. Name: `BharathVA`
4. Add:
   - `baseUrl` = `http://localhost:8080/api/auth`
   - `testEmail` = `nishalpoojary@gmail.com`
   - `sessionToken` = *(empty)*
5. Save and select it

### Step 3: Run Tests

**Execute in this order:**

1. ✅ **Health Check** → Send
   - Should return: `"success": true`

2. 📧 **1. Register Email** → Send
   - **CHECK YOUR EMAIL FOR OTP!**
   - Session token auto-saved

3. 🔐 **2. Verify OTP** → Update OTP from email → Send
   - Replace `123456` with your 6-digit OTP

4. 👤 **4. Submit User Details** → Send
   - Updates your name, phone, DOB

5. 🔒 **5. Create Password** → Send
   - Password configured already

6. 🔍 **6. Check Username** → Send
   - Tests if username available

7. 🎉 **7. Create Username** → Send
   - **REGISTRATION COMPLETE!**
   - **CHECK EMAIL FOR WELCOME MESSAGE!**

---

## 📊 Service URLs

| Service | Port | URL |
|---------|------|-----|
| Eureka Dashboard | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| Auth Service | 8081 | http://localhost:8081 |

---

## 🔥 Quick Commands

```bash
# View containers
docker ps

# View logs
docker-compose logs -f auth-service

# Stop services
docker-compose down

# Start services
docker-compose up
```

---

## 📧 Emails You'll Receive

1. **OTP Email** (after step 2)
   - Subject: "BharathVA - Your Email Verification Code"
   - 6-digit code
   - Valid 10 minutes

2. **Welcome Email** (after step 7)
   - Subject: "Welcome to BharathVA, @yourusername!"
   - Confirmation message

---

## ✨ Summary

**Backend is LIVE:**
- ✅ Docker containers running
- ✅ All APIs working
- ✅ Email integration active
- ✅ Database connected

**Test with:**
- Postman (import `POSTMAN_COLLECTION.json`)
- See `POSTMAN_TESTING.md` for detailed guide

**Stop:**
```bash
docker-compose down
```

**Restart:**
```bash
docker-compose up
```

---

**🇮🇳 Jai Hind!**

