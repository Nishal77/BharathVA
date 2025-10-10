# 📱 Postman Testing Guide

## ✅ Backend Status: WORKING!

```json
{
  "success": true,
  "message": "Registration service is running",
  "data": "OK"
}
```

**Services:** Discovery (8761), Gateway (8080), Auth (8081) ✅

**The Lombok warning is just an IDE linter message - IGNORE IT! Your services are running perfectly!**

---

## 🚀 Postman Setup (2 Minutes)

### Import Collection

1. Open **Postman Desktop**
2. Click **Import** button
3. Select: `backend/POSTMAN_COLLECTION.json`
4. Click **Import**

✅ Collection added with 8 requests

### Create Environment

1. Click **Environments** (left sidebar)
2. Click **+**
3. Name: `BharathVA`
4. Add variables:

```
baseUrl = http://localhost:8080/api/auth
testEmail = nishalpoojary@gmail.com
sessionToken = (empty)
```

5. **Save** and **Select** environment

---

## 🧪 Test Flow (5 Minutes)

### 1. Health Check
```
Request: Health Check
Action: Send
Expect: "success": true
```

### 2. Register Email 📧
```
Request: 1. Register Email
Action: Send
Result: sessionToken auto-saved
📧 CHECK EMAIL FOR OTP!
```

### 3. Verify OTP 🔐
```
Request: 2. Verify OTP
Update: "otp": "YOUR_6_DIGIT_CODE"
Action: Send
Result: Email verified
```

### 4. Submit Details 👤
```
Request: 4. Submit User Details
Action: Send
```

### 5. Create Password 🔒
```
Request: 5. Create Password
Action: Send
```

### 6. Check Username 🔍
```
Request: 6. Check Username
Update: username in URL
Action: Send
```

### 7. Complete! 🎉
```
Request: 7. Create Username
Action: Send
Result: COMPLETED
📧 CHECK EMAIL FOR WELCOME!
```

---

## 📊 Ports Reference

| Port | Service | URL |
|------|---------|-----|
| **8761** | Eureka | http://localhost:8761 |
| **8080** | Gateway | http://localhost:8080 |
| **8081** | Auth | http://localhost:8081 |

---

## 🐳 Docker Commands

```bash
docker ps              # View running services
docker-compose logs -f # View logs
docker-compose down    # Stop
docker-compose up      # Start
```

---

**Your backend is LIVE and working!**

**The Lombok warning in pom.xml is just IDE linting - services run perfectly!**

**🇮🇳 Jai Hind!**

