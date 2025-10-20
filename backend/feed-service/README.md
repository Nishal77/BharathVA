# BharathVA Feed Service

Microservice for managing social media feeds in the BharathVA platform. This service handles feed creation, retrieval, interactions, and provides real-time social media functionality.

## Architecture

- **Database**: MongoDB (Document-based storage for flexible feed data)
- **Authentication**: JWT tokens from Auth Service
- **Caching**: Spring Cache with Caffeine
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway

## Features

### Core Functionality
- ✅ Create, read, update, delete feeds
- ✅ Like, retweet, bookmark interactions
- ✅ Reply and thread support
- ✅ Media content support (images, videos)
- ✅ Search and discovery
- ✅ Trending feeds
- ✅ User-specific feeds
- ✅ Public timeline

### Technical Features
- ✅ MongoDB integration with proper indexing
- ✅ JWT authentication with Auth Service
- ✅ Caching for performance optimization
- ✅ Soft delete functionality
- ✅ Pagination support
- ✅ Real-time view counting
- ✅ Comprehensive error handling

## Quick Start

### Using Docker (Recommended)

```bash
# Start feed service with dependencies
cd backend
docker-compose up feed-service

# Or start all services
docker-compose up
```

### Local Development

```bash
# Prerequisites
- Java 17+
- Maven 3.9+
- MongoDB 7.0+
- Running Auth Service

# Build and run
cd feed-service
mvn clean install
mvn spring-boot:run
```

## API Endpoints

### Feed Management
```
POST   /api/feed/create              - Create new feed
GET    /api/feed/{feedId}            - Get feed by ID
GET    /api/feed/user/{userId}       - Get user's feeds
GET    /api/feed/public              - Get public feeds
DELETE /api/feed/{feedId}            - Delete feed
```

### Feed Interactions
```
POST   /api/feed/{feedId}/like       - Like/Unlike feed
POST   /api/feed/{feedId}/retweet    - Retweet/Unretweet feed
POST   /api/feed/{feedId}/bookmark   - Bookmark/Unbookmark feed
```

### Feed Replies
```
POST   /api/feed/create              - Create reply (with parentFeedId)
GET    /api/feed/{feedId}/replies    - Get replies to feed
```

### Search & Discovery
```
GET    /api/feed/search?q={query}    - Search feeds
GET    /api/feed/trending            - Get trending feeds
```

### Health & Status
```
GET    /api/feed/health              - Service health check
```

## Configuration

### Environment Variables

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/bharathva_feed
MONGO_DATABASE=bharathva_feed

# Auth Service Configuration
AUTH_SERVICE_URL=http://auth-service:8081
AUTH_SERVICE_LOCAL_URL=http://localhost:8081

# JWT Configuration
JWT_SECRET=your-64-character-secret-key-for-feed-service-jwt-validation-only
JWT_EXPIRATION=3600000

# Server Configuration
SERVER_PORT=8082

# Eureka Configuration
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/

# Cache Configuration
CACHE_TTL=300

# Feed Configuration
MAX_FEED_ITEMS=50
DEFAULT_PAGE_SIZE=20
```

## Database Schema

### Feed Document Structure
```json
{
  "_id": "ObjectId",
  "userId": "String (UUID from Auth Service)",
  "username": "String",
  "fullName": "String",
  "avatarUrl": "String",
  "verified": "Boolean",
  "content": "String (max 280 chars)",
  "emojis": ["String"],
  "media": {
    "type": "String (grid|single|carousel)",
    "items": [
      {
        "id": "String",
        "type": "String (image|video|gif)",
        "url": "String",
        "thumbnailUrl": "String",
        "altText": "String",
        "width": "Number",
        "height": "Number",
        "fileSize": "Number"
      }
    ]
  },
  "threadId": "String",
  "parentFeedId": "String",
  "repliesCount": "Number",
  "retweetsCount": "Number",
  "likesCount": "Number",
  "bookmarksCount": "Number",
  "viewsCount": "Number",
  "isLiked": "Boolean",
  "isRetweeted": "Boolean",
  "isBookmarked": "Boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "isDeleted": "Boolean",
  "feedType": "String (ORIGINAL|RETWEET|REPLY|QUOTE_TWEET)"
}
```

### MongoDB Indexes
- `userId` - User-specific queries
- `createdAt` - Time-based sorting
- `threadId` - Thread conversations
- `parentFeedId` - Reply chains
- `isDeleted` - Soft delete filtering
- `content` - Full-text search
- Compound indexes for complex queries

## Testing

### Automated Testing
```bash
# Run the test script
./TEST_FEED_SERVICE.sh
```

### Manual Testing with Postman
1. Import `POSTMAN_FEED_COLLECTION.json`
2. Set up environment variables
3. Run the collection tests

### Test Coverage
- ✅ Feed creation and retrieval
- ✅ User authentication integration
- ✅ Feed interactions (like, retweet, bookmark)
- ✅ Reply functionality
- ✅ Search and discovery
- ✅ Error handling
- ✅ MongoDB operations

## Performance Optimization

### Caching Strategy
- User information cached for 5 minutes
- Feed data cached with TTL
- Cache eviction on updates

### Database Optimization
- Proper indexing for all query patterns
- Compound indexes for complex queries
- TTL index for automatic cleanup of deleted feeds

### Query Optimization
- Pagination for large result sets
- Efficient aggregation pipelines
- Optimized search queries

## Monitoring

### Health Checks
- Service health endpoint
- MongoDB connection monitoring
- Auth service connectivity

### Metrics
- Request/response times
- Cache hit rates
- Database query performance
- Error rates

## Security

### Authentication
- JWT token validation
- User ID extraction from tokens
- Authorization for user-specific operations

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Rate Limiting
- API rate limiting (configured at gateway level)
- Per-user rate limits for feed creation

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up feed-service

# Or build individual service
docker build -t bharathva-feed-service .
```

### Production Considerations
- MongoDB replica set for high availability
- Redis for distributed caching
- Load balancing across multiple instances
- Monitoring and logging setup

## Integration

### Auth Service Integration
- Validates user existence before feed operations
- Caches user information for performance
- Handles user profile updates

### Gateway Integration
- Routes `/api/feed/*` requests to feed service
- Handles CORS and security headers
- Load balancing and failover

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **Auth Service Integration Issues**
   - Verify Auth Service is running
   - Check JWT secret configuration
   - Validate user ID format

3. **Performance Issues**
   - Check MongoDB indexes
   - Monitor cache hit rates
   - Review query patterns

### Logs
```bash
# View service logs
docker-compose logs feed-service

# View MongoDB logs
docker-compose logs mongodb
```

## Development

### Adding New Features
1. Create model classes in `model/` package
2. Add repository methods in `repository/` package
3. Implement service logic in `service/` package
4. Create REST endpoints in `controller/` package
5. Add tests and update documentation

### Code Style
- Follow Spring Boot conventions
- Use proper logging with SLF4J
- Implement proper error handling
- Add comprehensive JavaDoc comments

## License

Proprietary - All rights reserved

## Version

Current Version: 1.0.0
Last Updated: October 2025
