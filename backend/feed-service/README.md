# BharathVA Feed Service

A microservice for managing social media feeds in the BharathVA platform, built with Spring Boot and MongoDB.

## Features

- Create, read, update, and delete feeds
- User authentication and authorization
- MongoDB integration for feed storage
- NeonDB integration for user validation
- Caching for improved performance
- Comprehensive logging and monitoring

## Architecture

### Database Configuration

- **MongoDB**: Primary database for storing feed data
- **NeonDB (PostgreSQL)**: User validation through auth service integration

### Authentication Flow

1. User authenticates with Auth Service (NeonDB)
2. Auth Service returns JWT token
3. Feed Service validates JWT token with Auth Service
4. Feed Service validates user exists in NeonDB
5. Feed operations are performed on MongoDB

## Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/bharathva_feed
MONGO_DATABASE=bharathva_feed

# NeonDB Configuration (for user validation)
NEON_DB_URL=jdbc:postgresql://your-neon-host/neondb?sslmode=require
NEON_DB_USERNAME=neondb_owner
NEON_DB_PASSWORD=your_neon_password

# Auth Service Configuration
AUTH_SERVICE_URL=http://localhost:8081
AUTH_SERVICE_LOCAL_URL=http://localhost:8081

# JWT Configuration (must match auth service)
JWT_SECRET=your-64-character-secret-key-for-feed-service-jwt-validation-only
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Eureka Configuration
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://localhost:8761/eureka/

# Server Configuration
SERVER_PORT=8082
SPRING_PROFILES_ACTIVE=default
```

### Application Configuration

The service uses `application.yml` with environment variable substitution:

```yaml
spring:
  application:
    name: feed-service
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:default}
  
  # MongoDB Configuration
  data:
    mongodb:
      uri: ${MONGO_URI:mongodb://localhost:27017/bharathva_feed}
      database: ${MONGO_DATABASE:bharathva_feed}
      auto-index-creation: true
  
  # NeonDB PostgreSQL Configuration (for user validation)
  datasource:
    url: ${NEON_DB_URL:jdbc:postgresql://localhost:5432/neondb}
    username: ${NEON_DB_USERNAME:neondb_owner}
    password: ${NEON_DB_PASSWORD:your_password}
    driver-class-name: org.postgresql.Driver
```

## API Endpoints

### Feed Management

- `POST /api/feed/create` - Create a new feed
- `GET /api/feed/{feedId}` - Get feed by ID
- `GET /api/feed/user/{userId}` - Get user's feeds (paginated)
- `GET /api/feed/all` - Get all feeds (paginated)
- `GET /api/feed/search?q=query` - Search feeds
- `DELETE /api/feed/{feedId}` - Delete feed
- `GET /api/feed/health` - Health check

### Request/Response Format

#### Create Feed Request
```json
{
  "userId": "user-uuid-from-neondb",
  "message": "Hello from BharathVA!"
}
```

#### Feed Response
```json
{
  "success": true,
  "message": "Feed created successfully",
  "data": {
    "id": "feed-mongodb-id",
    "userId": "user-uuid-from-neondb",
    "message": "Hello from BharathVA!",
    "createdAt": "2024-01-01T12:00:00",
    "updatedAt": "2024-01-01T12:00:00"
  },
  "timestamp": "2024-01-01T12:00:00"
}
```

## Database Schema

### MongoDB Collection: `feeds`

```javascript
{
  "_id": ObjectId("..."),
  "userId": "uuid-from-neondb",
  "message": "User's message content",
  "createdAt": ISODate("2024-01-01T12:00:00Z"),
  "updatedAt": ISODate("2024-01-01T12:00:00Z")
}
```

### Indexes

- `userId` - For fast user feed queries
- `createdAt` - For chronological ordering

## Running the Service

### Prerequisites

1. MongoDB running on localhost:27017
2. Auth Service running on localhost:8081
3. Eureka Server running on localhost:8761 (optional)

### Development Mode

```bash
# Copy environment configuration
cp env.example .env

# Update .env with your configuration
nano .env

# Run the service
mvn spring-boot:run
```

### Production Mode

```bash
# Build the application
mvn clean package

# Run with environment variables
java -jar target/feed-service-1.0.0.jar
```

## Testing

### Unit Tests

```bash
mvn test
```

### Integration Tests

```bash
# Run the comprehensive test script
./TEST_FEED_CREATION.sh
```

### Manual Testing

1. Start all services (Auth, Feed, Discovery)
2. Register a user through Auth Service
3. Login to get JWT token
4. Create feeds using the token
5. Verify feeds are stored in MongoDB

## Monitoring and Logging

### Health Checks

- Service health: `GET /api/feed/health`
- MongoDB connection: Checked on startup
- Auth Service connection: Validated on each request

### Logging

The service provides comprehensive logging:

- Feed creation with MongoDB document IDs
- User validation results
- Authentication failures
- Performance metrics

### Example Log Output

```
2024-01-01 12:00:00 - Creating feed for user: user-123
2024-01-01 12:00:00 - User validation result for userId user-123: true
2024-01-01 12:00:00 - Feed created successfully with ID: 507f1f77bcf86cd799439011 for user: user-123 - Message: 'Hello from BharathVA!'
2024-01-01 12:00:00 - MongoDB Storage: Document saved to collection 'feeds' with _id: 507f1f77bcf86cd799439011
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Check JWT secret matches between services
2. **MongoDB Connection**: Verify MongoDB is running and accessible
3. **User Validation Failed**: Ensure Auth Service is running and accessible
4. **Port Conflicts**: Check if port 8082 is available

### Debug Mode

Enable debug logging:

```yaml
logging:
  level:
    com.bharathva.feed: DEBUG
    org.springframework.security: DEBUG
```

## Security

- JWT token validation for all authenticated endpoints
- User validation against Auth Service
- Input validation and sanitization
- CORS configuration for cross-origin requests

## Performance

- MongoDB indexing for fast queries
- Redis caching for frequently accessed data
- Connection pooling for database connections
- Asynchronous processing where applicable

## Contributing

1. Follow the coding standards
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

Proprietary - All rights reserved