# API Documentation

## Overview

This directory contains comprehensive API documentation for BharathVA platform.

## Available APIs

### Authentication API
[Authentication API](authentication.md) - Complete authentication and authorization documentation.

**Endpoints Covered**:
- User registration (multi-step flow)
- Email verification with OTP
- User login and logout
- Token refresh mechanism
- Profile management
- Session management

### User API
User profile and account management (to be documented).

**Planned Endpoints**:
- User profile CRUD operations
- Profile picture upload
- User search and discovery
- Follow/unfollow operations
- Privacy settings

### Tweet API
Tweet creation and management (to be documented).

**Planned Endpoints**:
- Create, read, update, delete tweets
- Tweet interactions (like, retweet, reply)
- Media upload
- Tweet feed generation
- Trending topics

## API Standards

### Request Format

All requests use JSON format:
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
X-Device-Info: <device_information>
X-IP-Address: <client_ip>
```

### Response Format

Standard success response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2025-10-12T12:00:00"
}
```

Standard error response:
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2025-10-12T12:00:00"
}
```

### Status Codes

| Code | Status | Usage |
|------|--------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Authentication

### Token-Based Authentication

All protected endpoints require authentication via Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Types

**Access Token**:
- Type: JWT (JSON Web Token)
- Lifetime: 1 hour
- Usage: API authentication
- Storage: Secure client storage

**Refresh Token**:
- Type: Secure random string
- Lifetime: 7 days
- Usage: Obtain new access token
- Storage: Secure client storage

### Token Refresh

When access token expires:
1. Client detects 401 response
2. Calls `/api/auth/refresh` with refresh token
3. Receives new access token
4. Retries original request

## Rate Limiting

### Default Limits
- Authentication endpoints: 5 requests/minute
- Registration: 3 requests/minute
- General API: 100 requests/minute
- Token refresh: 10 requests/minute

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

## Pagination

For list endpoints (future):

**Request**:
```
GET /api/tweets?page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error message",
  "data": {
    "field1": "Validation error for field1",
    "field2": "Validation error for field2"
  },
  "timestamp": "2025-10-12T12:00:00"
}
```

### Common Error Scenarios

**Validation Error**:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**Authentication Error**:
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null
}
```

**Resource Not Found**:
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

## Versioning

### Current Version
API Version: v1

### Version Strategy
- URL versioning for major changes
- Backward compatibility maintained
- Deprecation notices with migration period
- Version included in URL: `/api/v1/auth/login`

### Deprecation Policy
- Minimum 3 months notice
- Migration guide provided
- Support during transition period
- Clear deprecation warnings

## Testing

### Testing Tools
- Postman collection: `backend/POSTMAN_COLLECTION.json`
- cURL examples in documentation
- REST Client file: `backend/test-api.http`
- Automated test scripts in `backend/`

### Test Environment
- Base URL: http://localhost:8080/api
- Test accounts available
- Sandbox mode for payment features (future)

## Client Libraries

### Official Clients
- Mobile: React Native service layer in `apps/mobile/services/api/`
- Web: JavaScript/TypeScript client (future)

### Third-Party Integration
SDKs and integration guides for external developers (future).

## Webhooks

### Webhook Events (Future)
- User registration completed
- Email verified
- Password changed
- Session created/terminated

### Webhook Format
```json
{
  "event": "user.registered",
  "timestamp": "2025-10-12T12:00:00",
  "data": {
    "userId": "uuid",
    "email": "user@example.com"
  }
}
```

## Best Practices

### Request Best Practices
1. Include proper Content-Type header
2. Use appropriate HTTP method
3. Validate data before sending
4. Handle timeout scenarios
5. Implement retry logic with exponential backoff
6. Cache responses when appropriate

### Response Handling
1. Check success field before processing data
2. Handle all possible status codes
3. Display user-friendly error messages
4. Log errors for debugging
5. Implement proper error boundaries

### Security Best Practices
1. Never log or expose tokens
2. Use HTTPS in production
3. Implement request signing for sensitive operations
4. Validate all server responses
5. Handle session expiration gracefully

## Performance Optimization

### Client-Side Optimization
- Minimize API calls
- Batch requests where possible
- Implement local caching
- Use pagination for large datasets
- Compress request/response (gzip)

### Server-Side Optimization
- Database query optimization
- Response caching
- Connection pooling
- Async processing for heavy operations
- CDN for static content

## Support

### Documentation Feedback
- Report inaccuracies or unclear sections
- Suggest improvements
- Request additional examples

### API Issues
- Check API status page
- Review error response details
- Verify request format
- Check authentication headers
- Review rate limits

## References

- [Authentication API](authentication.md)
- [System Architecture](../architecture/system-architecture.md)
- [Development Guidelines](../development/guidelines.md)
- [Deployment Guide](../deployment/production-deployment.md)

## Changelog

### Version 1.0.0 (October 2025)
- Initial API release
- Authentication endpoints
- User registration flow
- Session management
- Profile management

### Future Versions
- v1.1.0: Tweet management API
- v1.2.0: User interaction API
- v1.3.0: Notification API
- v2.0.0: GraphQL API support

