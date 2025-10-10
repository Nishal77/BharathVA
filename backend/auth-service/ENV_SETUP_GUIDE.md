# Environment Setup Guide

## ✅ `.env` File Created

A `.env` file has been created in the root of `auth-service` folder with your Neon DB and email credentials.

### Location
```
backend/auth-service/.env
```

### Contents
```env
# Database Configuration (Neon PostgreSQL)
DB_URL=jdbc:postgresql://ep-summer-bar-a1bv6p9u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_Dtqy63pieawz

# SMTP Configuration for Email OTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=zpgefisdqkerffog

# JWT Configuration
JWT_SECRET=bharathva-super-secret-key-change-in-production-2024
JWT_EXPIRATION=86400000

# Application Configuration
SERVER_PORT=8081
```

## ⚠️ IMPORTANT: Update Email Address

**You MUST update the email address in `.env`:**

1. Open `backend/auth-service/.env`
2. Change this line:
   ```
   SMTP_USERNAME=your-email@gmail.com
   ```
   To your actual Gmail address:
   ```
   SMTP_USERNAME=YOUR_ACTUAL_EMAIL@gmail.com
   ```
3. Save the file

## 🔒 Security Notes

### ✅ Already Protected
- `.env` file is in `.gitignore` ✓
- Will NOT be committed to Git ✓
- Contains all sensitive credentials ✓

### 🚫 Never Do This
- ❌ Don't commit `.env` to Git
- ❌ Don't share `.env` file publicly
- ❌ Don't hardcode credentials in code

## 📝 How to Use `.env`

### Option 1: With Environment Variables (Recommended)

The `.env` file is a template. You need to load it as environment variables:

**macOS/Linux:**
```bash
cd backend/auth-service

# Export all variables
export $(cat .env | grep -v '^#' | xargs)

# Then run service
mvn spring-boot:run
```

### Option 2: Using application.yml (Current Setup)

The credentials are already in `application.yml`, so you can run directly:
```bash
cd backend/auth-service
mvn spring-boot:run
```

### Option 3: Use dotenv library

Add this dependency to `pom.xml` if you want auto-loading:
```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
</dependency>
```

## 🎯 Current Configuration

Right now, credentials are configured in **TWO places**:

1. **`.env`** file (reference/backup)
2. **`application.yml`** (actively used)

The service will work with `application.yml` without needing `.env`.

## 🔄 Switching to .env

If you want to use `.env` instead of `application.yml`:

1. Install dotenv library (see above)
2. Update `application.yml` to use environment variables:
   ```yaml
   spring:
     datasource:
       url: ${DB_URL}
       username: ${DB_USERNAME}
       password: ${DB_PASSWORD}
   ```
3. Load `.env` before running

## 📚 Summary

✅ **Created:**
- `.env` file with all credentials
- Protected by `.gitignore`

⚠️ **Action Required:**
- Update email in `.env` to YOUR Gmail

✅ **Currently Works:**
- Service runs with `application.yml` (no `.env` needed)

---

**The `.env` file is ready to use as a reference or for environment variable loading!**

