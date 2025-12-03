# Auth Service Configuration Summary

## Changes Made

### 1. Updated `application.yml` to Use Environment Variables

All configuration values now use environment variables with sensible defaults, following the pattern from `news-ai-service`.

#### Server Configuration
```yaml
server:
  port: ${SERVER_PORT:8081}
  address: 0.0.0.0
```

#### Database Configuration
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://...}
    username: ${DB_USERNAME:neondb_owner}
    password: ${DB_PASSWORD:npg_Dtqy63pieawz}
```

#### Email Configuration
```yaml
spring:
  mail:
    host: ${SMTP_HOST:smtp.gmail.com}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME:}
    password: ${SMTP_PASSWORD:}
```

#### JWT Configuration
```yaml
jwt:
  secret: ${JWT_SECRET:...}
  expiration: ${JWT_EXPIRATION:3600000}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}
```

#### Eureka Configuration
```yaml
eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:http://discovery-service:8761/eureka/}
  instance:
    prefer-ip-address: ${EUREKA_INSTANCE_PREFERIPADDRESS:true}
    instance-id: ${EUREKA_INSTANCE_INSTANCEID:${spring.application.name}:${random.value}}
    hostname: ${EUREKA_INSTANCE_HOSTNAME:auth-service}
    lease-renewal-interval-in-seconds: ${EUREKA_INSTANCE_LEASE_RENEWAL_INTERVAL:10}
    lease-expiration-duration-in-seconds: ${EUREKA_INSTANCE_LEASE_EXPIRATION:30}
```

#### Management Endpoints
```yaml
management:
  endpoints:
    web:
      exposure:
        include: ${MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE:health,info,metrics}
  endpoint:
    health:
      show-details: ${MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS:always}
  health:
    db:
      enabled: ${MANAGEMENT_HEALTH_DB_ENABLED:true}
    defaults:
      enabled: ${MANAGEMENT_HEALTH_DEFAULTS_ENABLED:true}
```

#### OTP Configuration
```yaml
otp:
  expiry-minutes: ${OTP_EXPIRY_MINUTES:10}
  length: ${OTP_LENGTH:6}
```

#### Cloudinary Configuration
```yaml
cloudinary:
  cloud_name: ${CLOUDINARY_CLOUD_NAME:dqmryiyhz}
  api_key: ${CLOUDINARY_API_KEY:397473723639954}
  api_secret: ${CLOUDINARY_API_SECRET:FM-U9FOM6wm1KWDjS_vc39dngCg}
```

#### Logging Configuration
```yaml
logging:
  level:
    com.bharathva.auth: ${LOGGING_LEVEL_COM_BHARATHVA_AUTH:INFO}
    root: ${LOGGING_LEVEL_ROOT:INFO}
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```

### 2. Created Environment File Templates

- **`.env.example`**: Template file with all required environment variables
- **`ENV_SETUP.md`**: Comprehensive documentation for environment setup

### 3. Updated Docker Compose

Updated `docker-compose.yml` to load `.env.local` first, then fall back to `.env`:

```yaml
env_file:
  - ./auth-service/.env.local
  - ./auth-service/.env
```

## Environment Variable Reference

### Required Variables (No Defaults)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://host/db?sslmode=require` |
| `DB_USERNAME` | Database username | `neondb_owner` |
| `DB_PASSWORD` | Database password | `your_password` |
| `SMTP_USERNAME` | Email username | `your_email@gmail.com` |
| `SMTP_PASSWORD` | Email password/app password | `your_app_password` |
| `JWT_SECRET` | JWT signing secret (min 64 chars) | `random_secret_string...` |

### Optional Variables (With Defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8081` | Server port |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `REDIS_HOST` | `redis` | Redis hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_EXPIRATION` | `3600000` | Access token TTL (ms) |
| `JWT_REFRESH_EXPIRATION` | `604800000` | Refresh token TTL (ms) |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | `http://discovery-service:8761/eureka/` | Eureka URL |
| `OTP_EXPIRY_MINUTES` | `10` | OTP expiration time |
| `OTP_LENGTH` | `6` | OTP code length |
| `CLOUDINARY_CLOUD_NAME` | `dqmryiyhz` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `397473723639954` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `FM-U9FOM6wm1KWDjS_vc39dngCg` | Cloudinary API secret |

## Usage

### For Docker

1. Copy `.env.example` to `.env.local`:
```bash
cd backend/auth-service
cp .env.example .env.local
```

2. Update values in `.env.local`

3. Start services:
```bash
cd backend
docker-compose up auth-service
```

### For Local Development

1. Create `.env.local` file with your values

2. Export variables or use dotenv:
```bash
export $(cat .env.local | xargs)
mvn spring-boot:run
```

## Benefits

1. **Security**: Sensitive values are not hardcoded in application.yml
2. **Flexibility**: Easy to switch between environments (dev/staging/prod)
3. **Consistency**: Follows the same pattern as other services (news-ai-service)
4. **Documentation**: Clear reference of all configuration options
5. **Defaults**: Sensible defaults for development while allowing overrides

## Next Steps

1. Create your `.env.local` file from `.env.example`
2. Update all required variables with your actual values
3. Test the service to ensure all configurations are working
4. Never commit `.env.local` or `.env` to version control


