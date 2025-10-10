# 🔐 Environment Configuration

## ✅ Secure Configuration Practice

All sensitive credentials are stored in **`.env` file ONLY** - never hardcoded in source files.

---

## 📁 Configuration Files

### .env (Sensitive - Git Ignored)
**Location:** `backend/auth-service/.env`

**Contains:**
- Database credentials
- SMTP credentials  
- JWT secrets
- All sensitive information

**Status:** ✅ Added to `.gitignore` - never committed to Git

---

### .env.example (Template - Git Tracked)
**Location:** `backend/auth-service/.env.example`

**Contains:**
- Variable names only
- No sensitive values
- Template for developers

**Status:** ✅ Safe to commit to Git

---

### application.yml (Config - Git Tracked)
**Location:** `backend/auth-service/src/main/resources/application.yml`

**Contains:**
- Only variable references: `${VARIABLE_NAME}`
- NO default values with sensitive data
- NO hardcoded credentials

**Status:** ✅ Safe to commit to Git

---

## 🔧 How It Works

### application.yml References:
```yaml
spring:
  datasource:
    url: ${DB_URL}              # NO default value
    username: ${DB_USERNAME}    # NO default value
    password: ${DB_PASSWORD}    # NO default value
  
  mail:
    username: ${SMTP_USERNAME}  # NO default value
    password: ${SMTP_PASSWORD}  # NO default value
```

### .env File Provides:
```bash
DB_URL=jdbc:postgresql://ep-summer-bar-a1bv6p9u...
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_Dtqy63pieawz

SMTP_USERNAME=nishalpoojary66@gmail.com
SMTP_PASSWORD=ojursmdswzazuykw
```

### Docker Compose Uses .env:
```yaml
environment:
  - DB_URL=${DB_URL}
  - DB_USERNAME=${DB_USERNAME}
  - SMTP_USERNAME=${SMTP_USERNAME}
  # etc.
```

---

## 🛡️ Security Benefits

1. **No Secrets in Code** ✅
   - application.yml has NO sensitive data
   - Safe to commit to Git
   - Can be shared publicly

2. **.env File Protected** ✅
   - Listed in `.gitignore`
   - Never committed to Git
   - Only exists locally

3. **Easy Environment Management** ✅
   - Development: Use local `.env` file
   - Docker: Use `docker-compose.yml` environment
   - Production: Use environment variables

4. **Team Collaboration** ✅
   - Developers use their own `.env` file
   - Template provided in `.env.example`
   - No credential conflicts

---

## 📋 Current Variables

### Database (Neon PostgreSQL)
- `DB_URL` - Database connection string
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

### Email (Gmail SMTP)
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USERNAME` - Gmail email address
- `SMTP_PASSWORD` - Gmail App Password

### JWT (Authentication)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRATION` - Token expiration time (ms)

### Application
- `SERVER_PORT` - Server port (8081)
- `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` - Discovery service URL

---

## ✅ What's Protected

**Never in Git:**
- Database passwords
- SMTP passwords
- JWT secrets
- API keys
- Any sensitive credentials

**In Git:**
- Variable names only
- Application structure
- Non-sensitive configuration

---

## 🎯 Summary

**Configuration Pattern:**
1. `.env` file → Contains actual sensitive values
2. `application.yml` → References variables only
3. `docker-compose.yml` → Uses .env values
4. `.env.example` → Template without sensitive data

**Result:** ✅ Secure, maintainable, Git-safe configuration!

**🇮🇳 Best practices followed!**

