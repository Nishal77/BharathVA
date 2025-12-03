# Auth Service Environment Configuration

## Overview

The Auth Service uses environment variables for configuration. All sensitive values should be stored in environment files, not committed to version control.

## Environment Files

### `.env` (Docker)
Used by Docker Compose when running services in containers. This file is loaded automatically by docker-compose.

### `.env.local` (Local Development)
Used for local development outside Docker. This file takes precedence over `.env` in docker-compose.

### `.env.example`
Template file showing all required environment variables. Copy this to create your `.env` or `.env.local` file.

## Setup Instructions

### 1. Create Environment File

```bash
cd backend/auth-service
cp .env.example .env.local
```

### 2. Update Configuration Values

Edit `.env.local` and update the following required variables:

#### Required Variables

- **DB_URL**: Neon PostgreSQL connection string
- **DB_USERNAME**: Database username
- **DB_PASSWORD**: Database password
- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port
- **SMTP_USERNAME**: Email account username
- **SMTP_PASSWORD**: Email account password (use app password for Gmail)
- **JWT_SECRET**: Secret key for JWT token signing (minimum 64 characters)
- **EUREKA_CLIENT_SERVICEURL_DEFAULTZONE**: Eureka discovery service URL

#### Optional Variables (with defaults)

- **SERVER_PORT**: Server port (default: 8081)
- **REDIS_HOST**: Redis hostname (default: redis)
- **REDIS_PORT**: Redis port (default: 6379)
- **JWT_EXPIRATION**: Access token expiration in milliseconds (default: 3600000 = 1 hour)
- **JWT_REFRESH_EXPIRATION**: Refresh token expiration in milliseconds (default: 604800000 = 7 days)
- **OTP_EXPIRY_MINUTES**: OTP expiration time (default: 10)
- **OTP_LENGTH**: OTP code length (default: 6)
- **CLOUDINARY_CLOUD_NAME**: Cloudinary cloud name
- **CLOUDINARY_API_KEY**: Cloudinary API key
- **CLOUDINARY_API_SECRET**: Cloudinary API secret

## Environment Variable Reference

All environment variables used in `application.yml`:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SERVER_PORT` | Server port | 8081 | No |
| `DB_URL` | PostgreSQL connection URL | - | Yes |
| `DB_USERNAME` | Database username | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `SMTP_HOST` | SMTP server host | smtp.gmail.com | Yes |
| `SMTP_PORT` | SMTP server port | 587 | Yes |
| `SMTP_USERNAME` | Email username | - | Yes |
| `SMTP_PASSWORD` | Email password | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRATION` | Access token TTL (ms) | 3600000 | No |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL (ms) | 604800000 | No |
| `REDIS_HOST` | Redis hostname | redis | No |
| `REDIS_PORT` | Redis port | 6379 | No |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | Eureka URL | http://discovery-service:8761/eureka/ | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | No |
| `OTP_EXPIRY_MINUTES` | OTP expiration | 10 | No |
| `OTP_LENGTH` | OTP code length | 6 | No |
| `LOGGING_LEVEL_COM_BHARATHVA_AUTH` | Auth service log level | INFO | No |
| `LOGGING_LEVEL_ROOT` | Root log level | INFO | No |
| `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE` | Management endpoints | health,info,metrics | No |
| `MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS` | Health details | always | No |

## Docker Usage

When using Docker Compose, the service automatically loads environment variables from:
1. `./auth-service/.env.local` (if exists)
2. `./auth-service/.env` (fallback)

```bash
# Start services with environment variables
cd backend
docker-compose up auth-service
```

## Local Development (Without Docker)

For local development, you can:

### Option 1: Export Environment Variables

```bash
export DB_URL="jdbc:postgresql://..."
export DB_USERNAME="neondb_owner"
export DB_PASSWORD="your_password"
# ... etc
mvn spring-boot:run
```

### Option 2: Use .env.local with dotenv

Add to `pom.xml` or use a tool like `dotenv-cli`:

```bash
npm install -g dotenv-cli
dotenv -e .env.local -- mvn spring-boot:run
```

### Option 3: Use IDE Environment Variables

Configure your IDE (IntelliJ IDEA, VS Code) to load variables from `.env.local`.

## Security Best Practices

1. **Never commit `.env` or `.env.local`** to version control
2. **Use strong JWT secrets** (minimum 64 characters, random)
3. **Use app passwords** for Gmail SMTP (not your regular password)
4. **Rotate secrets regularly** in production
5. **Use different values** for development, staging, and production
6. **Restrict file permissions**: `chmod 600 .env.local`

## Verification

After setting up environment variables, verify configuration:

```bash
# Check if service starts
cd backend/auth-service
mvn spring-boot:run

# Or with Docker
cd backend
docker-compose up auth-service

# Test health endpoint
curl http://localhost:8081/auth/register/health
```

## Troubleshooting

### Service won't start
- Check all required environment variables are set
- Verify database connection string is correct
- Ensure SMTP credentials are valid

### Database connection errors
- Verify `DB_URL` format is correct
- Check database credentials
- Ensure database is accessible from your network

### Email sending fails
- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Check firewall allows SMTP port (587)

### JWT errors
- Ensure `JWT_SECRET` is at least 64 characters
- Use a cryptographically secure random string


