# Environment Variables Setup Guide

This guide explains how to set up environment variables for each microservice in the BharathVA backend.

## Overview

Each microservice has its own `.env` file for configuration:
- `discovery-service/.env`
- `gateway-service/.env`
- `auth-service/.env`

## Initial Setup

### 1. Copy Template Files

Copy the `.env.example` files to create your `.env` files:

```bash
cd backend

# Discovery Service
cp discovery-service/.env.example discovery-service/.env

# Gateway Service
cp gateway-service/.env.example gateway-service/.env

# Auth Service
cp auth-service/.env.example auth-service/.env
```

### 2. Configure Each Service

#### Discovery Service (.env)

```env
SERVER_PORT=8761
```

This service has minimal configuration as it's the Eureka registry.

#### Gateway Service (.env)

```env
SERVER_PORT=8080
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
```

#### Auth Service (.env)

Update with your actual credentials:

```env
# Database Configuration (Neon PostgreSQL)
DB_URL=jdbc:postgresql://your-neon-db-url/neondb?sslmode=require
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Email SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_at_least_64_characters_long
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Server Configuration
SERVER_PORT=8081

# Eureka Discovery Service URL
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Keep `.env.example` files** updated as templates
3. **Use strong JWT secrets** (minimum 64 characters)
4. **Use Gmail App Passwords** instead of regular passwords for SMTP
5. **Rotate secrets regularly** in production

## Generating a Secure JWT Secret

You can generate a secure JWT secret using:

```bash
openssl rand -base64 64
```

Or use this Python command:

```python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

## Gmail SMTP Setup

To use Gmail for sending OTP emails:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security > 2-Step Verification > App passwords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use this App Password in `SMTP_PASSWORD`

## Docker Compose Integration

The `docker-compose.yml` is configured to automatically load environment variables from each service's `.env` file:

```yaml
auth-service:
  build:
    context: ./auth-service
  env_file:
    - ./auth-service/.env
```

## Running the Services

Once `.env` files are configured:

```bash
cd backend
docker-compose up --build
```

All services will start with their respective environment variables loaded.

## Troubleshooting

### Service won't start
- Check if `.env` file exists in the service directory
- Verify all required variables are set
- Check for syntax errors in `.env` file

### Database connection fails
- Verify `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`
- Check if Neon database is accessible
- Ensure SSL mode is set correctly (`sslmode=require`)

### Email not sending
- Verify Gmail App Password is correct
- Check if 2FA is enabled on Gmail account
- Ensure `SMTP_PORT` is 587 (not 465)

## Environment Variables Reference

### Auth Service

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://...` |
| `DB_USERNAME` | Database username | `neondb_owner` |
| `DB_PASSWORD` | Database password | `your_password` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USERNAME` | Email address | `your@gmail.com` |
| `SMTP_PASSWORD` | Gmail App Password | `16-char-password` |
| `JWT_SECRET` | JWT signing secret | `64+ char string` |
| `JWT_EXPIRATION` | Access token lifetime (ms) | `3600000` (1 hour) |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime (ms) | `604800000` (7 days) |
| `SERVER_PORT` | Service port | `8081` |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | Eureka URL | `http://discovery-service:8761/eureka/` |

### Gateway Service

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_PORT` | Service port | `8080` |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | Eureka URL | `http://discovery-service:8761/eureka/` |

### Discovery Service

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_PORT` | Service port | `8761` |

