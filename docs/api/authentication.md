# Authentication API

## Overview

The Authentication API handles user registration, login, token management, and session control. All authentication endpoints are accessible through the API Gateway.

## Base URL

```
Production: https://api.bharathva.com/api/auth
Development: http://localhost:8080/api/auth
```

## Authentication Flow

### Registration Flow
1. Register email → Receive OTP
2. Verify OTP → Email confirmed
3. Submit user details → Save profile information
4. Create password → Secure account
5. Create username → Complete registration

### Login Flow
1. Submit credentials → Receive access and refresh tokens
2. Store tokens securely → Use for authenticated requests
3. Access token expires → Use refresh token to get new access token
4. Logout → Invalidate session

## Endpoints

### Registration

#### POST /register/email
Register a new user with email address.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
    "currentStep": "OTP",
    "email": "user@example.com"
  },
  "timestamp": "2025-10-12T12:00:00"
}
```

**Status Codes**:
- 200: Success
- 400: Invalid email format or email already registered

---

#### POST /register/verify-otp
Verify email with OTP code.

**Request**:
```json
{
  "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
    "currentStep": "DETAILS"
  },
  "timestamp": "2025-10-12T12:02:00"
}
```

**Status Codes**:
- 200: Success
- 400: Invalid or expired OTP
- 400: Invalid session token

---

#### POST /register/resend-otp
Resend OTP if not received or expired.

**Request**:
```json
{
  "sessionToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "success": true,
  "message": "New OTP sent to your email",
  "data": {
    "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
    "currentStep": "OTP"
  },
  "timestamp": "2025-10-12T12:03:00"
}
```

---

#### POST /register/details
Submit user details (name, phone, date of birth).

**Request**:
```json
{
  "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "Nishal Poojary",
  "phoneNumber": "9876543210",
  "countryCode": "+91",
  "dateOfBirth": "1995-05-15"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Details saved successfully",
  "data": {
    "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
    "currentStep": "PASSWORD"
  },
  "timestamp": "2025-10-12T12:05:00"
}
```

**Validation Rules**:
- fullName: Required, 1-100 characters
- phoneNumber: Required, valid phone number
- countryCode: Optional, defaults to +91
- dateOfBirth: Optional, format YYYY-MM-DD or DD/MM/YYYY

---

#### POST /register/password
Create account password.

**Request**:
```json
{
  "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password created successfully",
  "data": {
    "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
    "currentStep": "USERNAME"
  },
  "timestamp": "2025-10-12T12:07:00"
}
```

**Password Requirements**:
- Minimum 8 characters
- Must match confirmPassword
- Stored as BCrypt hash (strength 12)

---

#### GET /register/check-username
Check if username is available.

**Request**:
```
GET /register/check-username?username=nishalpoojary
```

**Response**:
```json
{
  "success": true,
  "message": "Username is available",
  "data": {
    "available": true
  },
  "timestamp": "2025-10-12T12:08:00"
}
```

**Username Rules**:
- 3-50 characters
- Lowercase letters, numbers, and underscores only
- Must be unique

---

#### POST /register/username
Create username and complete registration.

**Request**:
```json
{
  "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
  "username": "nishalpoojary"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration completed successfully!",
  "data": {
    "sessionToken": null,
    "currentStep": "COMPLETED"
  },
  "timestamp": "2025-10-12T12:10:00"
}
```

**Side Effects**:
- User account created in database
- Registration session deleted
- Welcome email sent to user

---

### Authentication

#### POST /login
Authenticate user and create session.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Headers**:
```
X-Device-Info: iOS 17 | iPhone 15 Pro
X-IP-Address: 103.45.67.89
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
    "tokenType": "Bearer",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "nishalpoojary",
    "fullName": "Nishal Poojary",
    "expiresIn": 3600000,
    "refreshExpiresIn": 604800000
  },
  "timestamp": "2025-10-12T12:15:00"
}
```

**Token Information**:
- accessToken: Valid for 1 hour (3600000 ms)
- refreshToken: Valid for 7 days (604800000 ms)
- Store both tokens securely on client

**Status Codes**:
- 200: Success
- 401: Invalid credentials
- 401: Email not verified

---

#### POST /refresh
Refresh access token using refresh token.

**Request**:
```json
{
  "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "nishalpoojary",
    "fullName": "Nishal Poojary",
    "expiresIn": 3600000,
    "refreshExpiresIn": 604800000
  },
  "timestamp": "2025-10-12T13:15:00"
}
```

**Notes**:
- Refresh token remains the same
- New access token generated
- Session last_used_at updated in database

**Status Codes**:
- 200: Success
- 401: Invalid or expired refresh token

---

#### POST /logout
Logout and invalidate session.

**Request**:
```json
{
  "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2025-10-12T14:00:00"
}
```

**Side Effects**:
- Session deleted from database
- Refresh token invalidated
- Access token remains valid until expiration

---

#### POST /validate
Validate access token.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "message": "Token validation completed",
  "data": {
    "valid": true,
    "message": "Token is valid"
  },
  "timestamp": "2025-10-12T12:20:00"
}
```

**Validation Checks**:
- JWT signature validity
- Token expiration
- Active session in database

---

#### GET /profile
Get authenticated user's profile.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "nishalpoojary",
    "fullName": "Nishal Poojary",
    "phoneNumber": "9876543210",
    "countryCode": "+91",
    "dateOfBirth": "1995-05-15",
    "isEmailVerified": true,
    "createdAt": "2025-10-12T10:00:00"
  },
  "timestamp": "2025-10-12T12:25:00"
}
```

---

### Session Management

#### GET /sessions
Get all active sessions for authenticated user.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "message": "Active sessions retrieved successfully",
  "data": [
    {
      "id": "session-uuid-1",
      "deviceInfo": "iOS 17 | iPhone 15 Pro",
      "ipAddress": "103.45.67.89",
      "lastUsedAt": "2025-10-12T12:25:00",
      "createdAt": "2025-10-12T10:15:00",
      "expiresAt": "2025-10-19T10:15:00",
      "isCurrentSession": true
    },
    {
      "id": "session-uuid-2",
      "deviceInfo": "Android 14 | Pixel 8",
      "ipAddress": "49.207.153.17",
      "lastUsedAt": "2025-10-11T18:30:00",
      "createdAt": "2025-10-11T18:30:00",
      "expiresAt": "2025-10-18T18:30:00",
      "isCurrentSession": false
    }
  ],
  "timestamp": "2025-10-12T12:25:00"
}
```

---

#### POST /sessions/logout
Logout a specific session.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request**:
```json
{
  "sessionId": "session-uuid-2"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Session logged out successfully",
  "data": {
    "message": "Session terminated"
  },
  "timestamp": "2025-10-12T12:30:00"
}
```

---

#### POST /sessions/logout-all-other
Logout all sessions except current one.

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "message": "All other sessions logged out successfully",
  "data": {
    "message": "2 sessions terminated"
  },
  "timestamp": "2025-10-12T12:35:00"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2025-10-12T12:00:00"
}
```

### Common Error Codes

| Status Code | Meaning | Example Scenario |
|------------|---------|------------------|
| 400 | Bad Request | Invalid input data, validation failed |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Email or username already exists |
| 500 | Internal Server Error | Unexpected server error |

### Example Error Responses

**Invalid Credentials**:
```json
{
  "success": false,
  "message": "Incorrect email or password",
  "data": null,
  "timestamp": "2025-10-12T12:00:00"
}
```

**Expired Session**:
```json
{
  "success": false,
  "message": "Session expired. Please start registration again.",
  "data": null,
  "timestamp": "2025-10-12T12:00:00"
}
```

**Validation Error**:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "timestamp": "2025-10-12T12:00:00"
}
```

## Security

### Password Requirements
- Minimum length: 8 characters
- Hashing algorithm: BCrypt with strength 12
- Password validation on registration
- Never transmitted or logged in plain text

### Token Security

**Access Token (JWT)**:
- Algorithm: HS256
- Expiration: 1 hour
- Claims: userId, email, username
- Signature verification required

**Refresh Token**:
- Cryptographically secure random string
- Length: 64 bytes (URL-safe Base64)
- Stored in database with session information
- Single-use recommended (optional)

### Rate Limiting
Recommended rate limits for production:
- Registration: 3 requests per minute per IP
- Login: 5 failed attempts per 15 minutes per IP
- Token refresh: 10 requests per minute per user
- OTP resend: 3 requests per hour per email

### CORS Configuration
Development:
- Allow all origins: `*`
- Allow credentials: true

Production:
- Specific origins only
- Secure headers configuration
- Credential support enabled

## Client Integration

### Mobile Client (React Native)

**Store Tokens**:
```typescript
import * as SecureStore from 'expo-secure-store';

// Save tokens
await SecureStore.setItemAsync('accessToken', response.data.accessToken);
await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);

// Retrieve tokens
const accessToken = await SecureStore.getItemAsync('accessToken');
```

**Authenticated Requests**:
```typescript
const response = await fetch(`${BASE_URL}/profile`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Automatic Token Refresh**:
```typescript
// If request returns 401
if (response.status === 401) {
  // Refresh access token
  const refreshed = await authService.refreshAccessToken();
  if (refreshed) {
    // Retry original request with new token
  } else {
    // Redirect to login
  }
}
```

### Web Client

**Store Tokens**:
```javascript
// Use secure cookie or sessionStorage
sessionStorage.setItem('accessToken', response.data.accessToken);
// Store refresh token in httpOnly cookie (server-side)
```

**Axios Interceptor**:
```javascript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // Attempt token refresh
      await refreshAccessToken();
      // Retry original request
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Best Practices

### Client Implementation
1. Store tokens securely (never in localStorage for web)
2. Implement automatic token refresh
3. Clear tokens on logout
4. Handle 401 errors gracefully
5. Validate token expiration before requests
6. Send device info for session tracking

### Server Implementation
1. Validate all input data
2. Use prepared statements for database queries
3. Implement request logging
4. Monitor failed authentication attempts
5. Clean up expired sessions regularly
6. Rotate JWT secrets periodically

## Testing

### Manual Testing with cURL

**Complete Registration Flow**:
```bash
# 1. Register email
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Verify OTP (check email)
curl -X POST http://localhost:8080/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","otp":"123456"}'

# 3. Submit details
curl -X POST http://localhost:8080/api/auth/register/details \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","fullName":"Test User","phoneNumber":"9876543210","countryCode":"+91","dateOfBirth":"1995-05-15"}'

# 4. Create password
curl -X POST http://localhost:8080/api/auth/register/password \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","password":"TestPass123!","confirmPassword":"TestPass123!"}'

# 5. Create username
curl -X POST http://localhost:8080/api/auth/register/username \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN","username":"testuser"}'
```

**Login and Use API**:
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Use access token
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Automated Testing
Use the provided Postman collection:
```bash
# Import collection
backend/POSTMAN_COLLECTION.json

# Set environment variables
baseUrl: http://localhost:8080/api/auth
testEmail: your@email.com
```

## Performance Considerations

### Response Times
- Login: < 200ms (p95)
- Token validation: < 50ms (p95)
- Token refresh: < 100ms (p95)
- Registration steps: < 150ms each (p95)

### Database Queries
All authentication endpoints optimized with:
- Indexed queries on email and username
- Connection pooling for concurrent requests
- Prepared statements for security and performance

### Token Generation
- Access token: < 10ms
- Refresh token: < 5ms (cryptographic random generation)
- JWT signing: < 20ms

## Monitoring

### Key Metrics
- Login success rate
- Token refresh rate
- Failed authentication attempts
- Active sessions count
- Registration completion rate
- OTP verification success rate

### Logging
All authentication events logged with:
- User identifier (email or userId)
- IP address
- Device information
- Timestamp
- Success/failure status
- Error details (if applicable)

## Migration and Versioning

### API Versioning
Current version: v1
Future versions will use URL versioning:
- v1: /api/auth/login
- v2: /api/v2/auth/login

### Breaking Changes
Breaking changes will be communicated with:
- Minimum 3-month deprecation notice
- Migration guide provided
- Support for old version during transition

## Reference Implementation

See `apps/mobile/services/api/authService.ts` for a complete client-side implementation including:
- Token management
- Automatic refresh
- Error handling
- Secure storage
- Device info collection

