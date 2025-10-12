# BharathVA - Quick Start Guide

## System Status

### Backend Services
```
✅ Discovery Service   Port 8761   HEALTHY
✅ Auth Service        Port 8081   HEALTHY  
✅ Gateway Service     Port 8080   RUNNING
```

### Database (Neon PostgreSQL)
```
✅ users               User accounts
✅ user_sessions       Refresh token storage (JWT system)
✅ email_otps          Email verification
✅ registration_sessions  Registration flow
```

## Start Backend

### First Time Setup
```bash
cd backend

# Setup environment files
./setup-env.sh

# Edit auth-service/.env with your credentials
nano auth-service/.env
```

### Start Services
```bash
# Start all microservices
docker-compose up --build

# Or run in background
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f auth-service
```

## Start Frontend

```bash
cd apps/mobile
npx expo start --clear
```

## Authentication Flow

### 1. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Returns both tokens:
- `accessToken`: JWT (1 hour)
- `refreshToken`: Session token (7 days)

### 2. Use Access Token
```bash
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Refresh Token
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### 4. Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Frontend Usage

```typescript
import { authService } from './services/api/authService';

// Login
const response = await authService.login('email', 'password');

// Tokens auto-stored in SecureStore
// Auto-refreshes on expiration

// Logout
await authService.logout();
```

## Configuration

### Backend (.env files)
Each microservice has its own `.env` file:

**auth-service/.env**:
```env
JWT_EXPIRATION=3600000           # 1 hour
JWT_REFRESH_EXPIRATION=604800000 # 7 days
DB_URL=your_neon_db_url
SMTP_USERNAME=your_email@gmail.com
```

See `backend/ENV_SETUP_GUIDE.md` for details.

### Frontend (config.ts)
```typescript
BASE_URL: 'http://192.168.0.9:8080/api'
```

## Key Features

- JWT access tokens (1 hour)
- Refresh tokens (7 days, stored in DB)
- Automatic token refresh on frontend
- Session management and revocation
- Secure storage (expo-secure-store)
- Multiple device support

## Documentation

- **Quick Start**: This file
- **Environment Setup**: `backend/ENV_SETUP_GUIDE.md`
- **Docker Microservices**: `backend/DOCKER_MICROSERVICES_SETUP.md`
- **JWT Implementation**: `backend/auth-service/JWT_REFRESH_TOKEN_IMPLEMENTATION.md`
- **Project README**: `README.md`

---

**BharathVA - The Voice of India**

