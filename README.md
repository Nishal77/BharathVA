# BharathVA - The Voice of India

A next-generation social platform built to surpass existing social networks in speed, scalability, transparency, and user trust.

## Overview

BharathVA is a production-ready social networking platform designed for India-first content with global scalability. The platform features a microservices architecture, real-time communication, and comprehensive authentication systems.

### Technology Stack

**Backend**
- Java 17 with Spring Boot 3.2
- Microservices architecture with Spring Cloud
- PostgreSQL (Neon DB) for data persistence
- JWT-based authentication with refresh tokens
- Eureka service discovery
- API Gateway for request routing

**Mobile**
- React Native with Expo
- TypeScript for type safety
- NativeWind for styling
- SecureStore for token management
- Context API for state management

## Project Structure

```
BharathVA/
├── apps/
│   ├── mobile/              # React Native mobile application
│   └── web/                 # Web application (future)
├── backend/                 # Microservices backend
│   ├── discovery-service/   # Eureka service registry
│   ├── gateway-service/     # API Gateway
│   ├── auth-service/        # Authentication and authorization
│   ├── config-service/      # Configuration management
│   └── shared/              # Shared utilities and DTOs
├── docs/                    # Comprehensive documentation
│   ├── architecture/        # System design and architecture
│   ├── setup/               # Installation and setup guides
│   ├── api/                 # API documentation and contracts
│   ├── deployment/          # Deployment procedures
│   └── development/         # Development guidelines
└── scripts/                 # Build and deployment scripts
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for mobile development)
- Java 17 (for local backend development)
- PostgreSQL client (optional, for database access)

### Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

2. Start all services using Docker
```bash
docker-compose up --build
```

3. Verify services are running
- Eureka Dashboard: http://localhost:8761
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081

### Mobile Setup

1. Navigate to mobile directory
```bash
cd apps/mobile
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm start
```

4. Run on simulator/device
```bash
# iOS
npm run ios

# Android
npm run android
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture](docs/architecture/README.md)** - System design, microservices architecture, database schema
- **[Setup](docs/setup/README.md)** - Installation guides, environment configuration, Docker setup
- **[API](docs/api/README.md)** - API endpoints, request/response formats, authentication flows
- **[Deployment](docs/deployment/README.md)** - Production deployment, CI/CD, monitoring
- **[Development](docs/development/README.md)** - Coding standards, contribution guidelines, testing

## Core Features

### Authentication System
- Multi-step registration with email verification
- JWT-based authentication with automatic token refresh
- Session management with device tracking
- Secure password hashing with BCrypt
- OAuth integration support

### Security
- End-to-end encryption for sensitive data
- CORS configuration for secure cross-origin requests
- SQL injection prevention through JPA
- Rate limiting on authentication endpoints
- Secure token storage using platform-specific secure storage

### Scalability
- Horizontal scaling support through microservices
- Service discovery and load balancing
- Database connection pooling
- Asynchronous processing for non-blocking operations
- Caching strategies for frequently accessed data

## API Endpoints

### Authentication
```
POST   /api/auth/register/email      - Register with email
POST   /api/auth/register/verify-otp - Verify email OTP
POST   /api/auth/register/details    - Submit user details
POST   /api/auth/register/password   - Create password
POST   /api/auth/register/username   - Create username
POST   /api/auth/login                - User login
POST   /api/auth/refresh              - Refresh access token
POST   /api/auth/logout               - User logout
GET    /api/auth/profile              - Get user profile
```

### Session Management
```
GET    /api/auth/sessions             - Get active sessions
POST   /api/auth/sessions/logout      - Logout specific session
POST   /api/auth/sessions/logout-all  - Logout all other sessions
```

## Database Schema

### Core Tables
- `users` - User account information
- `user_sessions` - Active login sessions with refresh tokens
- `email_otps` - Email verification OTPs
- `registration_sessions` - Registration flow state management

See [Database Schema Documentation](docs/architecture/database-schema.md) for detailed information.

## Development

### Backend Development
```bash
cd backend

# Compile all services
mvn clean compile

# Run tests
mvn test

# Package services
mvn clean package -DskipTests
```

### Mobile Development
```bash
cd apps/mobile

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Testing

### Backend Testing
```bash
# Health check
curl http://localhost:8080/api/auth/register/health

# Test complete registration flow
cd backend
./TEST_FULLNAME_MIGRATION.sh
```

### API Testing
- Postman collection available at `backend/POSTMAN_COLLECTION.json`
- REST Client file available at `backend/test-api.http`

## Deployment

### Docker Deployment
```bash
cd backend
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration
All services use environment-specific configuration:
- Development: `.env` files
- Production: Environment variables or secrets management

See [Deployment Guide](docs/deployment/README.md) for production deployment procedures.

## Monitoring and Logging

### Service Health Monitoring
- Eureka Dashboard: http://localhost:8761
- Spring Boot Actuator endpoints available on each service
- Health checks configured for all services

### Logging
- Centralized logging for all microservices
- Structured logging format for easy parsing
- Log levels: INFO, WARN, ERROR
- Logs available through Docker: `docker-compose logs -f [service-name]`

## Security Considerations

### Production Checklist
- Use HTTPS/TLS for all communications
- Rotate JWT secrets regularly
- Implement rate limiting on all endpoints
- Enable database SSL connections
- Use Docker secrets instead of environment files
- Implement request validation and sanitization
- Enable CORS only for trusted origins
- Regular security audits and dependency updates

## Performance

### Optimization Strategies
- Database indexing on frequently queried columns
- Connection pooling for database connections
- Caching for static and frequently accessed data
- Asynchronous processing for non-critical operations
- CDN integration for static assets
- Horizontal scaling through container orchestration

## Contributing

See [Development Guidelines](docs/development/README.md) for:
- Code style and conventions
- Git workflow and branching strategy
- Pull request process
- Testing requirements

## Support and Documentation

- **Technical Documentation**: See `docs/` directory
- **API Documentation**: See `docs/api/`
- **Troubleshooting**: See `docs/setup/troubleshooting.md`

## License

Proprietary - All rights reserved

## Architecture Principles

BharathVA follows enterprise-grade architecture principles:

1. **Separation of Concerns**: Each microservice handles a specific domain
2. **Fail-Safe Design**: Services fail gracefully with proper error handling
3. **Observability**: Comprehensive logging and monitoring
4. **Security First**: Authentication, authorization, and data protection at every layer
5. **Scalability**: Designed to handle millions of concurrent users
6. **Maintainability**: Clean code, clear documentation, modular design

## Status

Current Version: 1.0.0
Status: Active Development
Last Updated: October 2025
