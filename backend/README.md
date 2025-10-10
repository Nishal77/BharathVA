# BharathVA Backend

Spring Boot microservices with complete user registration system.

## 🚀 Quick Start with Docker (RECOMMENDED)

```bash
cd backend

# Build images (5-10 min first time)
docker-compose build

# Start all services (2-3 min)
docker-compose up

# Test
curl http://localhost:8080/api/auth/register/health
```

**See `HOW_TO_RUN.md` for complete guide**

## 📦 Services

| Service | Port | Purpose |
|---------|------|---------|
| Discovery (Eureka) | 8761 | Service registry |
| Config | 8888 | Configuration |
| Gateway | 8080 | API entry point |
| Auth | 8081 | Authentication & Registration |

## 📝 Registration API

All requests go through Gateway: `http://localhost:8080/api/auth/register/`

### Complete Flow:
1. **POST** `/email` - Register email → Get sessionToken
2. **POST** `/verify-otp` - Verify OTP from email
3. **POST** `/details` - Submit user details
4. **POST** `/password` - Create password
5. **POST** `/username` - Choose username → Complete!

See `POSTMAN_TESTING_GUIDE.md` for detailed testing.

## 🗄️ Database

Uses Neon PostgreSQL with 3 tables:
- `users` - Permanent user data
- `email_otps` - Temporary OTP storage
- `registration_sessions` - Multi-step registration sessions

## ⚙️ Configuration

All credentials are configured in `auth-service/src/main/resources/application.yml`

**Important:** Replace `your-email@gmail.com` with your actual Gmail address!

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Gateway       │  Port: 8080
│   Service       │  (API Entry Point)
└────────┬────────┘
         │
    ┌────┴─────┬─────────────┬──────────────┐
    │          │             │              │
┌───▼───┐ ┌───▼───┐  ┌──────▼─────┐  ┌────▼────┐
│ Auth  │ │ User  │  │  Content   │  │  ...    │
│Service│ │Service│  │  Service   │  │ Service │
│:8081  │ │:8082  │  │   :8083    │  │  :808x  │
└───────┘ └───────┘  └────────────┘  └─────────┘
         │          
    ┌────┴─────┬─────────────┐
    │          │             │
┌───▼───────┐ ┌▼────────┐  ┌▼────────┐
│ Discovery │ │ Config  │  │ Shared  │
│  Service  │ │ Service │  │ Module  │
│  :8761    │ │ :8888   │  │         │
└───────────┘ └─────────┘  └─────────┘
```

## 📦 Modules

### Core Services

#### 1. **shared/**
Common codebase shared across all services
- DTOs (Data Transfer Objects)
- Common utilities
- Exception handlers
- Shared configurations

#### 2. **discovery-service/** (Port: 8761)
Service registry using Netflix Eureka
- Service registration and discovery
- Health monitoring
- Load balancing support

#### 3. **config-service/** (Port: 8888)
Centralized configuration management using Spring Cloud Config
- Externalized configuration
- Environment-specific properties
- Dynamic configuration updates

#### 4. **gateway-service/** (Port: 8080)
API Gateway and request router
- Single entry point for all client requests
- Request routing to appropriate services
- Load balancing
- CORS handling

#### 5. **auth-service/** (Port: 8081)
Authentication and Authorization Service
- User registration (multi-step flow)
- Email OTP verification
- JWT token generation
- Password management
- User login

## 🚀 Registration Flow

The registration process follows a secure, multi-step approach:

### Step 1: Email Registration
```
POST /api/auth/register/email
{
  "email": "user@example.com"
}
```
- Validates email uniqueness
- Creates registration session
- Generates 6-digit OTP
- Sends OTP via email

### Step 2: OTP Verification
```
POST /api/auth/register/verify-otp
{
  "sessionToken": "uuid-token",
  "otp": "123456"
}
```
- Validates OTP (10-minute expiry)
- Marks email as verified
- Proceeds to next step

### Step 3: User Details
```
POST /api/auth/register/details
{
  "sessionToken": "uuid-token",
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "countryCode": "+91",
  "dateOfBirth": "1990-01-01"
}
```
- Saves user personal information
- Validates phone number format

### Step 4: Password Creation
```
POST /api/auth/register/password
{
  "sessionToken": "uuid-token",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```
- Validates password strength (min 8 characters)
- Hashes password using BCrypt
- Stores securely

### Step 5: Username Selection
```
POST /api/auth/register/username
{
  "sessionToken": "uuid-token",
  "username": "johndoe"
}
```
- Validates username uniqueness
- Creates final user account
- Sends welcome email
- Completes registration

### Additional Endpoints

**Resend OTP:**
```
POST /api/auth/register/resend-otp
{
  "sessionToken": "uuid-token"
}
```

**Check Username Availability:**
```
GET /api/auth/register/check-username?username=johndoe
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email OTPs Table
```sql
CREATE TABLE email_otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Registration Sessions Table
```sql
CREATE TABLE registration_sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(150) NOT NULL,
    full_name VARCHAR(100),
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255),
    username VARCHAR(50),
    is_email_verified BOOLEAN DEFAULT FALSE,
    current_step VARCHAR(50) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

1. **Password Hashing**: BCrypt with strength 12
2. **OTP Security**: 
   - 6-digit random code
   - 10-minute expiry
   - Single-use only
3. **Session Management**: 
   - UUID-based session tokens
   - 24-hour session expiry
4. **Data Validation**: 
   - Jakarta Validation annotations
   - Custom business logic validation
5. **CORS**: Configured for cross-origin requests

## 📧 Email Configuration

The service uses SMTP for sending OTP and welcome emails:

### Required Environment Variables

Create environment variables or use `application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SMTP_USERNAME}
    password: ${SMTP_PASSWORD}  # App-specific password for Gmail
```

### Gmail Setup
1. Enable 2-Factor Authentication in your Google Account
2. Generate App-specific password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Use the generated password as `SMTP_PASSWORD`

## 🔌 Database Configuration

### Neon PostgreSQL

Connection string format:
```
jdbc:postgresql://[host]/[database]?sslmode=require
```

### Environment Variables

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

## 🛠️ Building and Running

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- PostgreSQL (Neon DB)
- SMTP credentials (Gmail recommended)

### Build All Services
```bash
cd backend
mvn clean install
```

### Run Services (in order)

1. **Discovery Service** (Port: 8761)
```bash
cd discovery-service
mvn spring-boot:run
```
Access Eureka Dashboard: http://localhost:8761

2. **Config Service** (Port: 8888)
```bash
cd config-service
mvn spring-boot:run
```

3. **Gateway Service** (Port: 8080)
```bash
cd gateway-service
mvn spring-boot:run
```

4. **Auth Service** (Port: 8081)
```bash
cd auth-service
mvn spring-boot:run
```

### Environment Setup

Create environment variables or configure in `application.yml`:

```bash
# Database
export DB_URL=jdbc:postgresql://[host]/[database]?sslmode=require
export DB_USERNAME=your_username
export DB_PASSWORD=your_password

# SMTP
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password

# JWT
export JWT_SECRET=your-secret-key
export JWT_EXPIRATION=86400000
```

## 📡 API Testing

### Via Gateway (Recommended)
```bash
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Direct to Auth Service
```bash
curl -X POST http://localhost:8081/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📊 Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| Discovery Service | 8761 | Eureka Server |
| Config Service | 8888 | Configuration Server |
| Gateway Service | 8080 | API Gateway |
| Auth Service | 8081 | Authentication |

## 🔍 Monitoring

- **Eureka Dashboard**: http://localhost:8761
- **Gateway Health**: http://localhost:8080/actuator/health
- **Auth Service Health**: http://localhost:8081/actuator/health

## 📝 Development Best Practices

1. **Database Design**
   - Separate tables for permanent and temporary data
   - Proper indexing for performance
   - Timestamp tracking (created_at, updated_at)

2. **Security**
   - Never store sensitive data in plaintext
   - Use BCrypt for password hashing
   - Implement proper session management

3. **Error Handling**
   - Global exception handler
   - Meaningful error messages
   - Proper HTTP status codes

4. **Code Organization**
   - Clear separation of concerns
   - DTOs for data transfer
   - Service layer for business logic
   - Repository layer for data access

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 404 | Resource not found |
| 500 | Internal server error |

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Cloud Netflix](https://spring.io/projects/spring-cloud-netflix)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

Follow the existing code structure and patterns when adding new features.

## 📄 License

Copyright © 2024 BharathVA. All rights reserved.

---

**Jai Hind! 🇮🇳**

