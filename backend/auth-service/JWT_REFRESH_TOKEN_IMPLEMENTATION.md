# JWT and Refresh Token Implementation Guide

## Overview

BharathVA implements a secure two-token authentication system:
- **Access Token (JWT)**: Short-lived token for API requests (1 hour default)
- **Refresh Token**: Long-lived token for obtaining new access tokens (7 days default)

## Architecture

### Token Flow

```
1. User Login
   ├─> Backend validates credentials
   ├─> Generates Access Token (JWT) - expires in 1 hour
   ├─> Generates Refresh Token (random secure string) - expires in 7 days
   ├─> Stores Refresh Token in database (user_sessions table)
   └─> Returns both tokens to client

2. API Request
   ├─> Client sends Access Token in Authorization header
   ├─> Backend validates JWT signature and expiration
   └─> Grants or denies access

3. Token Refresh
   ├─> Access Token expires
   ├─> Client sends Refresh Token to /auth/refresh
   ├─> Backend validates Refresh Token from database
   ├─> Generates new Access Token
   └─> Returns new Access Token (keeps same Refresh Token)

4. Logout
   ├─> Client sends Refresh Token to /auth/logout
   ├─> Backend deactivates session in database
   └─> Client clears all tokens from storage
```

## Backend Implementation

### Database Schema

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Key Components

#### 1. JwtService
- `generateAccessToken()`: Creates JWT with 1-hour expiration
- `generateRefreshToken()`: Creates secure random token
- `validateToken()`: Verifies JWT signature and expiration
- `refreshAccessToken()`: Issues new access token

#### 2. AuthenticationService
- `login()`: Issues both tokens, stores refresh token in DB
- `refreshToken()`: Validates refresh token and issues new access token
- `logout()`: Deactivates refresh token session
- `logoutAllSessions()`: Deactivates all user sessions

#### 3. UserSessionRepository
- Manages refresh token persistence
- Tracks active sessions per user
- Handles session cleanup

### API Endpoints

#### POST /auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "xyz123abc456...",
    "tokenType": "Bearer",
    "userId": "uuid-here",
    "email": "user@example.com",
    "username": "username",
    "expiresIn": 3600000,
    "refreshExpiresIn": 604800000,
    "message": "Login successful"
  }
}
```

#### POST /auth/refresh
```json
Request:
{
  "refreshToken": "xyz123abc456..."
}

Response:
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "xyz123abc456...",
    "userId": "uuid-here",
    "email": "user@example.com",
    "username": "username",
    "expiresIn": 3600000,
    "refreshExpiresIn": 604800000
  }
}
```

#### POST /auth/logout
```json
Request:
{
  "refreshToken": "xyz123abc456..."
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /auth/validate
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Token is valid"
  }
}
```

## Frontend Implementation

### Token Storage

Tokens are stored securely using Expo SecureStore:
- `accessToken`: Stored in SecureStore
- `refreshToken`: Stored in SecureStore
- `userData`: User info cached in SecureStore

### Authentication Flow

```typescript
// Login
const loginResponse = await authService.login(email, password);
// Tokens are automatically stored in SecureStore

// Make authenticated requests
const response = await apiCall('/endpoint', 'GET', null, true);
// includeAuth = true automatically adds Authorization header

// Automatic token refresh on 401
// If access token expires, frontend automatically:
// 1. Calls /auth/refresh with refresh token
// 2. Stores new access token
// 3. Retries original request

// Logout
await authService.logout();
// Deactivates session on backend and clears all tokens
```

### Available Methods

```typescript
// Authentication
authService.login(email, password)
authService.logout()
authService.refreshAccessToken()

// Token management
authService.isAuthenticated()
authService.validateToken()
authService.getCurrentUser()

// Token storage (via tokenManager)
tokenManager.saveTokens(accessToken, refreshToken)
tokenManager.getAccessToken()
tokenManager.getRefreshToken()
tokenManager.clearTokens()
tokenManager.saveUserData(userData)
tokenManager.getUserData()
```

## Security Features

### Backend
1. **Refresh Token Rotation**: Each refresh generates a new access token
2. **Session Management**: Tracks all active sessions per user
3. **Database Validation**: Refresh tokens validated against database
4. **Secure Generation**: Cryptographically secure random tokens
5. **Expiration Enforcement**: Automatic cleanup of expired sessions
6. **IP & User Agent Tracking**: Optional session metadata

### Frontend
1. **Secure Storage**: Uses Expo SecureStore (encrypted on device)
2. **Automatic Refresh**: Seamless token renewal on expiration
3. **Token Isolation**: Refresh token only sent to /refresh endpoint
4. **Logout Cleanup**: Proper cleanup on logout
5. **Error Handling**: Graceful handling of token errors

## Configuration

### Backend (application.yml)
```yaml
jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:3600000}         # 1 hour in ms
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}  # 7 days in ms
```

### Environment Variables
```bash
JWT_SECRET=your-secret-key-min-256-bits
JWT_EXPIRATION=3600000          # 1 hour
JWT_REFRESH_EXPIRATION=604800000 # 7 days
```

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Refresh Token
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'

# Logout
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'

# Validate Token
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer your-access-token"
```

### Using Postman

Import the collection from `POSTMAN_COLLECTION.json` and:
1. Login to get both tokens
2. Save accessToken and refreshToken as environment variables
3. Use {{accessToken}} in Authorization headers
4. Test refresh endpoint with {{refreshToken}}

## Best Practices

1. **Never expose refresh tokens in logs or URLs**
2. **Always use HTTPS in production**
3. **Implement rate limiting on /auth/refresh**
4. **Set appropriate token expiration times**
5. **Monitor and limit active sessions per user**
6. **Implement device/session management for users**
7. **Rotate JWT secret periodically**
8. **Clean up expired sessions regularly**

## Migration from Old System

If migrating from old token system:
1. Run database migration: `V3__create_user_sessions_table.sql`
2. Update frontend to use new authService methods
3. Update API calls to pass `includeAuth: true` for protected endpoints
4. Test token refresh flow thoroughly
5. Monitor session table growth

## Troubleshooting

### Common Issues

**Access token expired immediately**
- Check JWT_EXPIRATION environment variable
- Verify server time is correct

**Refresh token not working**
- Verify refresh token in database
- Check is_active flag and expires_at
- Ensure refresh token not expired

**Token validation fails**
- Verify JWT_SECRET matches between services
- Check token format (Bearer prefix)
- Validate token signature

**Sessions accumulating in database**
- Implement cleanup job for expired sessions
- Set proper expiration times
- Consider limiting sessions per user

## Performance Considerations

1. **Database indexes**: Created on user_id, refresh_token, expires_at
2. **Session limits**: Consider limiting active sessions per user
3. **Cleanup job**: Implement scheduled task to delete expired sessions
4. **Caching**: Consider caching user data to reduce DB queries
5. **Connection pooling**: Properly configured in HikariCP

## Security Audit Checklist

- [ ] JWT secret is strong (256+ bits)
- [ ] Tokens stored securely on client
- [ ] HTTPS enabled in production
- [ ] Rate limiting on auth endpoints
- [ ] Session expiration properly enforced
- [ ] Expired sessions cleaned up
- [ ] Logging doesn't expose tokens
- [ ] CORS properly configured
- [ ] SQL injection prevention (using JPA)
- [ ] XSS protection enabled

