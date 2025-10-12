# BharathVA Backend Services

Microservices-based backend infrastructure for the BharathVA social platform.

## Architecture

### Service Inventory

| Service | Port | Responsibility | Technology |
|---------|------|----------------|------------|
| Discovery Service | 8761 | Service registry and health monitoring | Spring Cloud Eureka |
| Gateway Service | 8080 | API routing and load balancing | Spring Cloud Gateway |
| Auth Service | 8081 | Authentication and authorization | Spring Boot, JWT |
| Config Service | 8888 | Configuration management | Spring Cloud Config |

### Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Build Tool**: Maven 3.9+
- **Database**: PostgreSQL 15 (Neon DB)
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA with Hibernate
- **Database Migration**: Flyway
- **Email**: Spring Mail (SMTP)
- **Containerization**: Docker and Docker Compose

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f auth-service
```

### Local Development

```bash
# Build all services
mvn clean install

# Run specific service
cd auth-service
mvn spring-boot:run
```

## Service Details

### Discovery Service
Eureka server for service registration and discovery.

**Key Features**:
- Service registry for all microservices
- Health monitoring and reporting
- Client-side load balancing
- Automatic service deregistration on failure

**Dashboard**: http://localhost:8761

### Gateway Service
API Gateway providing single entry point for all client requests.

**Key Features**:
- Request routing based on URL patterns
- Load balancing across service instances
- CORS configuration
- Request/response filtering

**Routes**:
- `/api/auth/*` -> Auth Service
- `/api/users/*` -> User Service (future)
- `/api/tweets/*` -> Tweet Service (future)

### Auth Service
Handles user authentication, registration, and session management.

**Key Features**:
- Multi-step user registration with email verification
- JWT-based authentication with refresh tokens
- Session management with device tracking
- Password hashing with BCrypt (strength 12)
- Email OTP verification
- Session device tracking

**Database Tables**:
- users
- user_sessions
- email_otps
- registration_sessions

### Config Service
Centralized configuration management for all services.

**Key Features**:
- Externalized configuration
- Environment-specific properties
- Dynamic configuration refresh
- Configuration encryption support

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register/email       - Register with email
POST   /api/auth/register/verify-otp  - Verify email OTP
POST   /api/auth/register/details     - Submit user details
POST   /api/auth/register/password    - Create password
POST   /api/auth/register/username    - Create username
GET    /api/auth/register/check-username - Check username availability
POST   /api/auth/register/resend-otp  - Resend OTP
POST   /api/auth/login                - User login
POST   /api/auth/refresh              - Refresh access token
POST   /api/auth/logout               - Logout session
POST   /api/auth/validate             - Validate token
GET    /api/auth/profile              - Get user profile
```

### Session Management
```
GET    /api/auth/sessions             - Get active sessions
POST   /api/auth/sessions/logout      - Logout specific session
POST   /api/auth/sessions/logout-all-other - Logout all other sessions
```

## Configuration

### Environment Variables

All services use environment-specific configuration via `.env` files.

**Auth Service Configuration**:
```env
DB_URL=jdbc:postgresql://host/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=your_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
JWT_SECRET=your_64_character_secret
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000
SERVER_PORT=8081
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
```

See [Environment Configuration Guide](../docs/setup/environment-configuration.md) for details.

## Database Schema

### Core Tables

**users**: User account information
- Primary key: UUID
- Unique constraints: email, username
- Password stored as BCrypt hash

**user_sessions**: Active login sessions
- Foreign key: user_id references users(id)
- Unique refresh token per session
- Tracks IP address and device info

**email_otps**: Email verification codes
- 6-digit OTP codes
- 10-minute expiration
- Single-use enforcement

**registration_sessions**: Multi-step registration state
- Temporary storage for registration flow
- 24-hour expiration
- Cleaned up after completion

See [Database Schema Documentation](../docs/architecture/database-schema.md) for complete schema.

## Security

### Authentication
- JWT access tokens (1-hour expiration)
- Refresh tokens (7-day expiration)
- Session-based token validation
- Device and IP tracking

### Password Security
- BCrypt hashing with strength 12
- Minimum 8 characters
- Validation on registration
- Never logged or transmitted in plain text

### Network Security
- CORS configured for specific origins
- SSL/TLS for all connections
- Rate limiting on authentication endpoints
- Request validation and sanitization

## Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### API Testing
Use provided Postman collection:
```bash
# Import collection
backend/POSTMAN_COLLECTION.json
```

Or use cURL:
```bash
# Health check
curl http://localhost:8080/api/auth/register/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Monitoring

### Health Endpoints
- Discovery: http://localhost:8761/actuator/health
- Gateway: http://localhost:8080/actuator/health
- Auth: http://localhost:8081/actuator/health

### Eureka Dashboard
View all registered services: http://localhost:8761

### Logs
```bash
# Docker logs
docker-compose logs -f auth-service

# Application logs
tail -f logs/auth-service.log
```

## Troubleshooting

### Services Not Starting
```bash
# Check Docker status
docker info

# Check logs
docker-compose logs

# Rebuild services
docker-compose down -v
docker-compose up --build
```

### Port Conflicts
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Database Connection Issues
- Verify credentials in .env file
- Check database server accessibility
- Verify SSL mode configuration
- Review service logs for connection errors

## Build and Deployment

### Local Build
```bash
# Build all services
mvn clean install

# Build specific service
mvn clean install -pl auth-service -am

# Skip tests
mvn clean install -DskipTests
```

### Docker Build
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build auth-service

# No cache build
docker-compose build --no-cache
```

### Production Deployment
See [Production Deployment Guide](../docs/deployment/production-deployment.md)

## Development Workflow

### Adding New Microservice

1. Create service directory
```bash
mkdir tweet-service
```

2. Create Dockerfile
```dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build
COPY . .
RUN mvn clean install -DskipTests -pl tweet-service -am

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/tweet-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

3. Add to docker-compose.yml
```yaml
tweet-service:
  build:
    context: .
    dockerfile: tweet-service/Dockerfile
  container_name: bharathva-tweet
  ports:
    - "8082:8082"
  env_file:
    - ./tweet-service/.env
  depends_on:
    discovery-service:
      condition: service_healthy
  networks:
    - bharathva-network
  restart: unless-stopped
```

4. Register with Eureka
```yaml
# tweet-service/src/main/resources/application.yml
eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_CLIENT_SERVICEURL_DEFAULTZONE}
```

## Performance Tuning

### JVM Optimization
```bash
JAVA_OPTS="-Xmx2G -Xms1G \
           -XX:+UseG1GC \
           -XX:MaxGCPauseMillis=200"
```

### Database Connection Pool
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### Thread Pool Configuration
```yaml
server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
```

## Documentation

### Complete Documentation
See `docs/` directory for comprehensive documentation:
- Architecture and design
- API specifications
- Deployment procedures
- Development guidelines

### API Documentation
- Postman Collection: `POSTMAN_COLLECTION.json`
- REST Client: `test-api.http`
- Detailed API docs: `docs/api/authentication.md`

## Support

### Getting Help
1. Review documentation in `docs/` directory
2. Check service logs for errors
3. Verify environment configuration
4. Test with provided scripts and collections

### Reporting Issues
- Include service logs
- Provide reproduction steps
- Note environment details
- Include configuration (sanitized)

## License

Proprietary - All rights reserved

## Version

Current Version: 1.0.0
Last Updated: October 2025
