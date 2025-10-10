# 🚀 BharathVA Backend - Complete Guide

## 📊 Service Ports

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Discovery (Eureka)** | 8761 | http://localhost:8761 | Service registry & monitoring |
| **Config Server** | 8888 | http://localhost:8888 | Configuration management |
| **API Gateway** | 8080 | http://localhost:8080 | Single entry point for all APIs |
| **Auth Service** | 8081 | http://localhost:8081 | User registration & authentication |

---

## 🐳 Run with Docker (RECOMMENDED - Fixes Java 25 Issue!)

### Prerequisites

✅ Docker installed: `docker --version`  
✅ Docker running: Check whale icon 🐳 in menu bar

If not installed:
```bash
brew install --cask docker
open /Applications/Docker.app
```

---

### Step 1: Update Email (REQUIRED!)

**File:** `backend/docker-compose.yml` (line 92)

Change:
```yaml
- SMTP_USERNAME=nishalpoojary@gmail.com
```

To YOUR actual Gmail if different!

---

### Step 2: Build Docker Images (One Command!)

```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend

docker-compose build
```

**Takes 5-10 minutes first time**

You'll see:
```
✅ Building discovery-service... done
✅ Building config-service... done
✅ Building gateway-service... done
✅ Building auth-service... done
```

---

### Step 3: Start All Services

```bash
docker-compose up
```

**Wait for all services to start (~2-3 minutes):**
```
discovery-service | Started DiscoveryServiceApplication ✅
config-service | Started ConfigServiceApplication ✅
gateway-service | Started GatewayServiceApplication ✅
auth-service | Started AuthServiceApplication ✅
```

**Keep this terminal running!**

To run in background:
```bash
docker-compose up -d
```

---

### Step 4: Verify Services Running

**Open new terminal:**

```bash
# Check containers
docker ps

# Expected: 4 containers, all "Up (healthy)"
```

**Check Eureka Dashboard:**
http://localhost:8761

Should show: GATEWAY-SERVICE and AUTH-SERVICE

---

### Step 5: Test API

```bash
# Health check
curl http://localhost:8080/api/auth/register/health

# Register email
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"nishalpoojary@gmail.com"}'
```

**📧 CHECK YOUR EMAIL FOR OTP!**

---

### Stop Services

```bash
# Press Ctrl+C in docker-compose terminal
# Or run:
docker-compose down
```

---

## 📝 All API Endpoints

### Base URL
```
http://localhost:8080/api/auth/register
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/email` | Register email & send OTP |
| POST | `/verify-otp` | Verify email OTP |
| POST | `/resend-otp` | Resend OTP |
| POST | `/details` | Submit user details |
| POST | `/password` | Create password |
| GET | `/check-username?username=test` | Check username availability |
| POST | `/username` | Create username & complete registration |

---

## 🧪 Complete Registration Flow

### 1. Register Email
```bash
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionToken": "550e8400-...",
    "currentStep": "OTP"
  }
}
```

Save the `sessionToken` for next steps!

---

### 2. Verify OTP (Get from email)
```bash
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "otp": "123456"
  }'
```

---

### 3. Submit Details
```bash
curl -X POST http://localhost:8080/api/auth/register/details \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "fullName": "Nishal Poojary",
    "phoneNumber": "9876543210",
    "countryCode": "+91",
    "dateOfBirth": "1995-05-15"
  }'
```

---

### 4. Create Password
```bash
curl -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

---

### 5. Check Username
```bash
curl "http://localhost:8080/api/auth/register/check-username?username=nishalpoojary"
```

---

### 6. Create Username (Complete!)
```bash
curl -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "username": "nishalpoojary"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentStep": "COMPLETED"
  }
}
```

🎉 **Registration complete! Check email for welcome message!**

---

## 📱 Postman Testing

### Import Collection

1. Open Postman
2. Click **Import**
3. Select: `backend/POSTMAN_COLLECTION.json`

### Setup Environment

Name: `BharathVA`

Variables:
- `baseUrl` = `http://localhost:8080/api/auth`
- `testEmail` = `nishalpoojary@gmail.com`
- `sessionToken` = *(auto-filled)*

### Run Tests

Execute in order:
1. Health Check
2. 1. Register Email (check email for OTP!)
3. 2. Verify OTP (enter OTP from email)
4. 4. Submit User Details
5. 5. Create Password
6. 6. Check Username
7. 7. Create Username (Complete!)

---

## 🐛 Troubleshooting

### Issue: Docker not running
```bash
# Check Docker status
docker info

# If error, start Docker Desktop
open /Applications/Docker.app
```

### Issue: Port already in use
```bash
# Stop existing services
docker-compose down

# Or kill processes
lsof -ti:8080 | xargs kill -9
```

### Issue: Build fails
```bash
# Clean and rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache
```

### Issue: Service unhealthy
```bash
# Check logs
docker-compose logs auth-service

# Restart service
docker-compose restart auth-service
```

---

## 📊 Docker Commands

### Basic Operations
```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service

# Check container status
docker ps

# Restart service
docker-compose restart auth-service
```

### Advanced
```bash
# Rebuild specific service
docker-compose up --build auth-service

# Remove everything
docker-compose down -v

# View resource usage
docker stats

# Access container shell
docker exec -it bharathva-auth sh

# Clean unused images
docker system prune -a
```

---

## 🗄️ Database

### Neon PostgreSQL (Configured)
```
Host: ep-summer-bar-a1bv6p9u-pooler.ap-southeast-1.aws.neon.tech
Database: neondb
Username: neondb_owner
Password: npg_Dtqy63pieawz
SSL: Required
```

### Tables (Auto-created)
- `users` - Permanent user data
- `email_otps` - Temporary OTP storage (10-min expiry)
- `registration_sessions` - Registration session tracking (24-hr expiry)

---

## 📧 Email Configuration

### Gmail SMTP (Configured)
```
Host: smtp.gmail.com
Port: 587
Username: nishalpoojary@gmail.com (UPDATE THIS!)
Password: zpgefisdqkerffog
```

### Emails Sent
1. **OTP Verification** - After email registration
2. **Welcome Email** - After registration completes

---

## 🏗️ Architecture

```
Client (Mobile/Web)
    ↓
Gateway Service (8080)
    ↓
├─→ Auth Service (8081) → Neon Database
└─→ Discovery Service (8761)
```

### How It Works

1. **Discovery Service (8761)** - All services register here
2. **Gateway (8080)** - Routes requests to appropriate service
3. **Auth Service (8081)** - Handles registration & authentication
4. **Services communicate** through Eureka service discovery

---

## 📁 Project Structure

```
backend/
├── docker-compose.yml              # Orchestrates all services
├── .dockerignore                   # Optimizes Docker builds
│
├── discovery-service/
│   ├── Dockerfile                  # Java 17 image
│   ├── pom.xml
│   └── src/
│
├── config-service/
│   ├── Dockerfile                  # Java 17 image
│   ├── pom.xml
│   └── src/
│
├── gateway-service/
│   ├── Dockerfile                  # Java 17 image
│   ├── pom.xml
│   └── src/
│
├── auth-service/
│   ├── Dockerfile                  # Java 17 image
│   ├── .env                        # Environment variables
│   ├── pom.xml
│   └── src/
│       ├── main/java/
│       │   ├── config/             # Security, Async
│       │   ├── controller/         # REST endpoints
│       │   ├── dto/                # Request/Response objects
│       │   ├── entity/             # Database entities
│       │   ├── repository/         # Data access
│       │   └── service/            # Business logic
│       └── test/                   # Test structure
│
└── shared/                         # Common code
    └── src/main/java/
        ├── dto/
        ├── exception/
        └── util/
```

---

## ✅ Success Checklist

- [ ] Docker Desktop installed and running
- [ ] Email updated in `docker-compose.yml`
- [ ] Built images: `docker-compose build`
- [ ] Started services: `docker-compose up`
- [ ] All 4 containers running: `docker ps`
- [ ] Eureka shows 2 services: http://localhost:8761
- [ ] Health check works: `curl http://localhost:8080/api/auth/register/health`
- [ ] Registration works: Test with Postman
- [ ] OTP email received
- [ ] Registration completed
- [ ] Welcome email received

---

## 🎯 Quick Commands Reference

```bash
# Navigate to backend
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend

# Build (first time or after code changes)
docker-compose build

# Start all services
docker-compose up

# Test
curl http://localhost:8080/api/auth/register/health

# Stop
docker-compose down

# View logs
docker-compose logs -f auth-service

# Restart
docker-compose restart auth-service
```

---

## 📚 Additional Resources

- **`POSTMAN_TESTING_GUIDE.md`** - Detailed API testing guide
- **`POSTMAN_COLLECTION.json`** - Import to Postman
- **`POSTMAN_SIMPLE_GUIDE.md`** - Postman quick start
- **`test-api.http`** - REST Client file for Cursor
- **`DOCKER_CHEAT_SHEET.md`** - Quick Docker commands
- **`README.md`** - Architecture overview

---

## 🔑 Key Features

### Security
- ✅ BCrypt password hashing (strength 12)
- ✅ Email verification required
- ✅ OTP expiry (10 minutes)
- ✅ Session management (24-hour expiry)
- ✅ CORS enabled for mobile app

### Scalability
- ✅ Microservices architecture
- ✅ Service discovery (Eureka)
- ✅ API Gateway for routing
- ✅ Docker containerization
- ✅ Health monitoring

### Reliability
- ✅ Auto-restart on failures
- ✅ Health checks
- ✅ Async email sending
- ✅ Database connection pooling
- ✅ Global error handling

---

## 🎉 Summary

**What you have:**
- ✅ 4 microservices with Docker
- ✅ Complete registration system (8 endpoints)
- ✅ Database configured (Neon PostgreSQL)
- ✅ Email configured (Gmail SMTP)
- ✅ Postman collection ready
- ✅ Java 17 in Docker (solves Java 25 issue!)

**How to run:**
```bash
docker-compose up --build
```

**How to test:**
- Import `POSTMAN_COLLECTION.json` to Postman
- Run all 8 requests in order

**Time to working backend:** 10-15 minutes!

---

**🇮🇳 Jai Hind!**

Start with: `docker-compose build` then `docker-compose up`

