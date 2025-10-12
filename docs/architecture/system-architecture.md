# System Architecture

## Overview

BharathVA employs a microservices architecture designed for high availability, horizontal scalability, and fault tolerance. The system is built to handle millions of concurrent users while maintaining sub-100ms response times for critical operations.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                            │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Mobile Client   │              │   Web Client     │         │
│  │  (React Native)  │              │   (React)        │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
└───────────┼────────────────────────────────┼───────────────────┘
            │                                │
            └────────────────┬───────────────┘
                             │
┌────────────────────────────┼───────────────────────────────────┐
│                            │     API Gateway Layer             │
│                   ┌────────▼─────────┐                         │
│                   │  API Gateway     │                         │
│                   │  (Port 8080)     │                         │
│                   │  - Routing       │                         │
│                   │  - Load Balancing│                         │
│                   └────────┬─────────┘                         │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                             │   Service Discovery Layer         │
│                   ┌─────────▼──────────┐                        │
│                   │  Eureka Registry   │                        │
│                   │  (Port 8761)       │                        │
│                   └─────────┬──────────┘                        │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                             │   Microservices Layer             │
│         ┌───────────────────┼───────────────────┐               │
│         │                   │                   │               │
│  ┌──────▼─────────┐  ┌──────▼─────────┐ ┌──────▼─────────┐   │
│  │  Auth Service  │  │  Tweet Service │ │  User Service  │   │
│  │  (Port 8081)   │  │  (Port 8082)   │ │  (Port 8083)   │   │
│  └────────┬───────┘  └────────┬───────┘ └────────┬───────┘   │
└───────────┼────────────────────┼──────────────────┼───────────┘
            │                    │                  │
┌───────────┼────────────────────┼──────────────────┼───────────┐
│           │      Data Persistence Layer          │            │
│  ┌────────▼────────────────────▼──────────────────▼────────┐  │
│  │              PostgreSQL Database (Neon DB)              │  │
│  │  - Users          - User Sessions    - Tweets           │  │
│  │  - Email OTPs     - Registration     - Notifications    │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Discovery Service (Eureka)
**Responsibility**: Service registration and discovery

**Key Features**:
- Service registry for all microservices
- Health check monitoring
- Load balancing support
- Automatic service deregistration on failure

**Port**: 8761

**Technology**: Spring Cloud Netflix Eureka

### 2. API Gateway
**Responsibility**: Single entry point for all client requests

**Key Features**:
- Request routing to appropriate microservices
- Load balancing across service instances
- CORS configuration
- Rate limiting (future)
- API versioning support

**Port**: 8080

**Technology**: Spring Cloud Gateway

**Routes**:
- `/api/auth/*` → Auth Service
- `/api/users/*` → User Service (future)
- `/api/tweets/*` → Tweet Service (future)

### 3. Auth Service
**Responsibility**: User authentication and authorization

**Key Features**:
- Multi-step user registration with email verification
- JWT-based authentication
- Refresh token management
- Session tracking with device information
- Password security with BCrypt
- OTP generation and validation

**Port**: 8081

**Database Tables**:
- users
- user_sessions
- email_otps
- registration_sessions

### 4. Config Service
**Responsibility**: Centralized configuration management

**Key Features**:
- Externalized configuration
- Environment-specific configurations
- Configuration refresh without restart
- Encryption for sensitive properties

**Port**: 8888

**Technology**: Spring Cloud Config Server

## Data Flow

### Authentication Flow

```
1. Client Request
   └─> API Gateway (8080)
       └─> Auth Service (8081)
           ├─> Validate credentials
           ├─> Generate JWT access token
           ├─> Generate refresh token
           ├─> Store session in database
           └─> Return tokens to client

2. Authenticated Request
   └─> API Gateway (8080)
       ├─> Extract JWT from Authorization header
       ├─> Validate JWT signature and expiration
       └─> Route to appropriate service
           └─> Service validates token
               └─> Process request
                   └─> Return response

3. Token Refresh
   └─> API Gateway (8080)
       └─> Auth Service (8081)
           ├─> Validate refresh token from database
           ├─> Check session expiration
           ├─> Generate new access token
           ├─> Update session last_used_at
           └─> Return new access token
```

### Registration Flow

```
Step 1: Email Registration
Client → Gateway → Auth Service
  ├─> Validate email format
  ├─> Check if email already registered
  ├─> Create registration session
  ├─> Generate 6-digit OTP
  ├─> Store OTP in database
  ├─> Send OTP via email
  └─> Return session token

Step 2: OTP Verification
Client → Gateway → Auth Service
  ├─> Validate session token
  ├─> Verify OTP code
  ├─> Mark email as verified
  ├─> Mark OTP as used
  └─> Proceed to next step

Step 3: User Details
Client → Gateway → Auth Service
  ├─> Validate session
  ├─> Store name, phone, date of birth
  └─> Proceed to password step

Step 4: Password Creation
Client → Gateway → Auth Service
  ├─> Validate session
  ├─> Hash password with BCrypt
  ├─> Store password hash
  └─> Proceed to username step

Step 5: Username Creation
Client → Gateway → Auth Service
  ├─> Validate session
  ├─> Check username availability
  ├─> Create user account
  ├─> Send welcome email
  ├─> Clean up registration session
  └─> Return success
```

## Scalability Design

### Horizontal Scaling
- Stateless microservices enable horizontal scaling
- Multiple instances of each service can run simultaneously
- API Gateway handles load balancing
- Database connection pooling prevents connection exhaustion

### Database Optimization
- Indexed columns for fast queries
- Foreign key relationships with cascade rules
- Automatic cleanup of expired sessions and OTPs
- Connection pooling with HikariCP

### Caching Strategy (Future)
- Redis for session caching
- CDN for static assets
- API response caching for read-heavy endpoints

## Security Architecture

### Authentication Layer
- JWT-based stateless authentication
- Refresh tokens stored in database
- Token expiration enforcement
- Session tracking for security monitoring

### Authorization Layer
- Role-based access control (RBAC)
- Resource-level permissions
- JWT claims for user context

### Data Protection
- BCrypt password hashing (strength 12)
- Encrypted storage for sensitive data
- SSL/TLS for all communications
- Prepared statements prevent SQL injection

### Network Security
- CORS configuration for controlled access
- Rate limiting on sensitive endpoints
- Request validation and sanitization
- Protection against common vulnerabilities

## Technology Stack Details

### Backend Services
- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **Build Tool**: Maven 3.9+
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL 15+ (Neon DB)
- **ORM**: Spring Data JPA with Hibernate
- **Validation**: Jakarta Bean Validation
- **Email**: Spring Mail with SMTP

### Mobile Application
- **Framework**: React Native with Expo
- **Language**: TypeScript 5.0+
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: React Context API
- **Secure Storage**: Expo SecureStore
- **Navigation**: Expo Router
- **HTTP Client**: Fetch API with custom wrapper

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Database Hosting**: Neon DB (PostgreSQL)
- **Email Service**: Gmail SMTP
- **Version Control**: Git

## Performance Targets

### Response Time
- Authentication: < 200ms (p95)
- Token validation: < 50ms (p95)
- User profile retrieval: < 100ms (p95)
- Registration flow: < 500ms per step (p95)

### Throughput
- Concurrent logins: 10,000+ per second
- Token validations: 50,000+ per second
- Active sessions: 1,000,000+ concurrent

### Availability
- Target uptime: 99.9%
- Maximum planned downtime: 4 hours per month
- Zero-downtime deployments

## Monitoring and Observability

### Metrics Collection
- Request count and response times
- Error rates and types
- Database query performance
- JVM memory and CPU usage

### Logging
- Structured logging with correlation IDs
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized log aggregation
- Log retention: 30 days

### Health Checks
- Service health endpoints
- Database connectivity checks
- Dependency health verification
- Custom business logic health checks

## Future Architecture Enhancements

### Planned Improvements
- Event-driven architecture with message queues
- GraphQL API for flexible client queries
- Real-time features with WebSocket
- CDN integration for media content
- Elasticsearch for search functionality
- Redis for caching and session storage
- Kubernetes for container orchestration

### Scalability Roadmap
- Multi-region deployment
- Read replicas for database scaling
- Microservice mesh with service mesh technology
- Advanced rate limiting and throttling
- Circuit breakers for resilience

## Design Principles

### 1. Single Responsibility
Each microservice has a well-defined, focused responsibility.

### 2. Loose Coupling
Services communicate through well-defined APIs with minimal dependencies.

### 3. High Cohesion
Related functionality is grouped within the same service.

### 4. Fail-Safe
Services fail gracefully with proper error handling and fallback mechanisms.

### 5. Observable
Comprehensive logging, metrics, and tracing for system visibility.

### 6. Secure by Default
Security controls at every layer of the application.

### 7. Scalable
Designed for horizontal scaling from the ground up.

### 8. Maintainable
Clean code, clear documentation, and modular design.

## Glossary

**Access Token**: Short-lived JWT token for API authentication (1 hour)
**Refresh Token**: Long-lived token for obtaining new access tokens (7 days)
**Session**: A user's login session tracked in the database
**OTP**: One-Time Password for email verification (6 digits, 10-minute expiry)
**Registration Session**: Temporary storage for multi-step registration process
**Microservice**: Independent, deployable service with specific business capability
**Service Discovery**: Mechanism for services to find and communicate with each other
**API Gateway**: Single entry point that routes requests to appropriate services

## References

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- Spring Cloud Documentation: https://spring.io/projects/spring-cloud
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- React Native Documentation: https://reactnative.dev/
- JWT Specification: https://tools.ietf.org/html/rfc7519

