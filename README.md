# BharathVA - The Voice of India

A next-generation social platform built to surpass Twitter in speed, scalability, transparency, and cultural relevance.

## Tech Stack

### Backend
- Java 17 + Spring Boot 3.2.0
- Microservices (Eureka, Gateway, Auth Service)
- PostgreSQL 17 (Neon)
- JWT + Refresh Token Authentication
- Docker + Docker Compose

### Frontend
- React Native + Expo ~54
- TypeScript
- NativeWind (Tailwind for React Native)
- Expo Router

## Quick Start

### Backend
```bash
cd backend
docker-compose up -d

# Check status
docker-compose ps
```

### Frontend
```bash
cd apps/mobile
npx expo start --clear
```

## Authentication System

### Dual-Token Architecture
- **Access Token**: JWT (1 hour) - for API requests
- **Refresh Token**: Random token (7 days) - stored in database

### Features
- Automatic token refresh on expiration
- Session management and revocation
- Multi-device support
- Secure storage (expo-secure-store)

### API Endpoints
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and deactivate session
- `POST /auth/register/*` - Registration flow

## Project Structure

```
BharathVA/
├── apps/
│   ├── mobile/          # React Native Expo app
│   └── web/             # (Future)
├── backend/
│   ├── auth-service/    # Authentication & Authorization
│   ├── gateway-service/ # API Gateway
│   ├── discovery-service/ # Eureka Server
│   └── docker-compose.yml
├── libs/                # Shared libraries
└── pnpm-workspace.yaml
```

## Documentation

- **Quick Start**: See `QUICK_START.md`
- **Backend Guide**: See `backend/README.md` and `backend/HOW_TO_RUN.md`
- **JWT Implementation**: See `backend/auth-service/JWT_REFRESH_TOKEN_IMPLEMENTATION.md`
- **API Testing**: Use `backend/POSTMAN_COLLECTION.json`

## Database

Using Neon PostgreSQL with:
- `users` - User accounts
- `user_sessions` - Refresh token storage
- `email_otps` - Email verification
- `registration_sessions` - Registration flow state

## Development

### Install Dependencies
```bash
pnpm install
```

### Environment Variables
See `backend/docker-compose.yml` for backend configuration.

Update `apps/mobile/services/api/config.ts` with your local IP for mobile testing.

## Testing

### Backend Health
```bash
curl http://localhost:8080/api/auth/register/health
```

### Login Test
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## License

Proprietary - BharathVA Platform

---

**Built for scale. Engineered for excellence.**
