# BharathVA Backend

Microservices architecture for BharathVA social platform.

## Services

### Discovery Service (Port 8761)
- Eureka Server for service discovery
- Service registry for microservices

### Gateway Service (Port 8080)
- API Gateway with routing
- Load balancing
- Route: `/api/*` to respective services

### Auth Service (Port 8081)
- User registration (multi-step with OTP)
- Authentication (JWT + Refresh tokens)
- Session management
- Email verification

## Quick Start

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Authentication

### JWT + Refresh Token System

**Access Token (JWT)**
- Lifetime: 1 hour
- Used for API authentication
- Stateless validation

**Refresh Token**
- Lifetime: 7 days
- Stored in database (user_sessions table)
- Used to get new access tokens

### Endpoints
- `POST /auth/login` - Get both tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Deactivate session
- `POST /auth/validate` - Validate access token

## Configuration

Environment variables in `docker-compose.yml`:

```yaml
JWT_SECRET: your-secret-key
JWT_EXPIRATION: 3600000           # 1 hour
JWT_REFRESH_EXPIRATION: 604800000 # 7 days

DB_URL: your-neon-database-url
DB_USERNAME: neondb_owner
DB_PASSWORD: your-password

SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USERNAME: your@gmail.com
SMTP_PASSWORD: your-app-password
```

## Database Schema

### Tables
- `users` - User accounts (email, username, password_hash)
- `user_sessions` - Refresh token storage
- `email_otps` - Email verification OTPs
- `registration_sessions` - Registration flow state

### Migration
Tables are auto-created by Hibernate (`ddl-auto: update`).

## API Testing

Use the Postman collection: `POSTMAN_COLLECTION.json`

Or test with curl:
```bash
# Health check
curl http://localhost:8080/api/auth/register/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Development

### Build
```bash
mvn clean install
```

### Run Locally
```bash
./start-all-services.sh
```

### Docker
```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Services Restarting
```bash
# Check logs
docker-compose logs auth-service

# Rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port Conflicts
```bash
lsof -ti:8080,8081,8761 | xargs kill -9
```

## Documentation

- **JWT Implementation**: `auth-service/JWT_REFRESH_TOKEN_IMPLEMENTATION.md`
- **How to Run**: `HOW_TO_RUN.md`
- **Docker Commands**: `DOCKER_CHEAT_SHEET.md`

---

**BharathVA Backend - Production Ready**
