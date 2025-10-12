# Device Tracking and Session Management Implementation

## Overview

BharathVA now includes comprehensive device tracking and session management, allowing users to see all active login sessions and manage them from any device.

## Architecture

### Database Schema

#### Users Table (Primary)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### User Sessions Table (Foreign Key to Users)
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,                          -- FK to users(id)
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),                         -- IPv4 or IPv6
    device_info VARCHAR(500),                       -- Device description
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_user_sessions_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE                           -- Auto-delete sessions when user deleted
);
```

### Key Features

1. **Unique Session ID**: Each login creates a unique UUID session
2. **Foreign Key Relationship**: user_sessions.user_id → users.id
3. **CASCADE DELETE**: When user is deleted, all sessions auto-delete
4. **Device Tracking**: Captures device OS, model, and browser
5. **IP Tracking**: Records IPv4/IPv6 address
6. **Last Active**: Tracks when session was last used

## Frontend Implementation

### Device Info Collection

The mobile app automatically collects device information using:
- `expo-device` for device details (OS, model, brand)
- `ipify API` for public IP address

```typescript
// Device Info Format Examples:
// Android: "Android 14 | Google Pixel 8 Pro"
// iOS: "iOS 17.2 | iPhone 15 Pro"
// Web: "macOS 15 | Chrome"
```

### Login Flow

```typescript
// 1. User enters email and password
// 2. App collects device info and IP
const { deviceInfo, ipAddress } = await deviceInfoService.getFullDeviceInfo();

// 3. Sends to backend via custom headers
Headers:
  X-Device-Info: "Android 14 | Google Pixel 8 Pro"
  X-IP-Address: "49.207.153.17"

// 4. Backend creates session with this info
// 5. User can view all sessions in Settings > Active Devices
```

### Session Management UI

Users can:
- View all active devices
- See device info, IP, and last active time
- Logout specific devices
- Logout all other devices at once
- Current device is highlighted

Example UI:
```
┌─────────────────────────────────────┐
│ Active Devices                  🔄 │
│ 🛡️ 3 active devices               │
├─────────────────────────────────────┤
│ 📱 Android 14 | Pixel 8 Pro        │
│    49.207.153.17                   │
│    Last active: 5 min ago          │
│    [THIS DEVICE]                   │
├─────────────────────────────────────┤
│ 💻 macOS 15 | Chrome               │
│    13.250.22.45                    │
│    Last active: 1 day ago          │
│    [🗑️ Logout Device]              │
├─────────────────────────────────────┤
│ [🗑️ Logout All Other Devices]      │
└─────────────────────────────────────┘
```

## Backend Implementation

### API Endpoints

#### GET /auth/sessions
Get all active sessions for current user

**Request:**
```http
GET /api/auth/sessions
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Active sessions retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "deviceInfo": "Android 14 | Google Pixel 8 Pro",
      "ipAddress": "49.207.153.17",
      "lastUsedAt": "2024-01-15T10:30:00",
      "createdAt": "2024-01-15T10:25:00",
      "expiresAt": "2024-01-22T10:25:00",
      "isCurrentSession": true
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "deviceInfo": "macOS 15 | Chrome",
      "ipAddress": "13.250.22.45",
      "lastUsedAt": "2024-01-14T09:20:00",
      "createdAt": "2024-01-14T09:20:00",
      "expiresAt": "2024-01-21T09:20:00",
      "isCurrentSession": false
    }
  ]
}
```

#### POST /auth/sessions/logout
Logout specific session

**Request:**
```http
POST /api/auth/sessions/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "sessionId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session logged out successfully",
  "data": {
    "message": "Session terminated"
  }
}
```

#### POST /auth/sessions/logout-all-other
Logout all sessions except current

**Request:**
```http
POST /api/auth/sessions/logout-all-other
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "All other sessions logged out successfully",
  "data": {
    "message": "2 sessions terminated"
  }
}
```

## Security Features

1. **Authorization Required**: All session endpoints require valid JWT
2. **User Isolation**: Users can only see/manage their own sessions
3. **Current Session Protection**: Cannot logout current session via session endpoints
4. **CASCADE DELETE**: User deletion auto-removes all sessions
5. **Expiry Enforcement**: Expired sessions automatically invalidated

## Database Indexes

For optimal performance:
```sql
-- Primary lookups
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);

-- Expiry checks
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Activity tracking
CREATE INDEX idx_user_sessions_last_used_at ON user_sessions(last_used_at);

-- Composite for common queries
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, expires_at);
```

## Migration

### Apply Migration

The V5 migration drops and recreates all tables to ensure clean state:

```bash
# Using Docker
docker-compose down
docker-compose up --build

# The migration will automatically run on startup
```

### What Gets Deleted

- All existing users
- All existing sessions
- All registration sessions
- All OTPs

### Fresh Start

After migration:
- New registrations will use UUID
- Login sessions will track device info
- All FK relationships are properly enforced

## Files Changed/Created

### Backend
1. `V5__clean_recreate_users_and_sessions.sql` - Clean migration
2. `AuthenticationController.java` - Added device info headers
3. `AuthenticationService.java` - Updated login method
4. `SessionController.java` - NEW: Session management endpoints
5. `SessionManagementService.java` - NEW: Session business logic
6. `UserSessionResponse.java` - NEW: Session DTO
7. `SecurityConfig.java` - Added session endpoints to protected routes

### Frontend
1. `deviceInfoService.ts` - NEW: Device info collection
2. `authService.ts` - Updated login, added session methods
3. `config.ts` - Added session endpoints
4. `ActiveDevices.tsx` - NEW: UI for managing devices

## Testing

### Test Login with Multiple Devices

1. **Register a user:**
```bash
curl -X POST http://localhost:8080/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'
```

2. **Complete registration** (follow OTP flow)

3. **Login from Device 1:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{"email":"test@gmail.com","password":"password123"}'
```

4. **Login from Device 2:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: macOS 15 | Chrome" \
  -H "X-IP-Address: 13.250.22.45" \
  -d '{"email":"test@gmail.com","password":"password123"}'
```

5. **View active sessions:**
```bash
curl -X GET http://localhost:8080/api/auth/sessions \
  -H "Authorization: Bearer <access_token>"
```

6. **Logout specific device:**
```bash
curl -X POST http://localhost:8080/api/auth/sessions/logout \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<session_id>"}'
```

## Mobile App Usage

### Access Active Devices Screen

```typescript
// From profile settings
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/(user)/[userId]/settings/ActiveDevices');
```

### Example Integration

```typescript
import { authService } from '@/services/api/authService';

// Login with automatic device tracking
await authService.login(email, password);

// View active sessions
const sessions = await authService.getActiveSessions();

// Logout specific session
await authService.logoutSession(sessionId);

// Logout all other devices
await authService.logoutAllOtherSessions();
```

## Performance Considerations

1. **Session Cleanup**: Consider adding scheduled job to delete expired sessions
2. **Session Limits**: Consider limiting max sessions per user (e.g., 10 devices)
3. **IP Geolocation**: Future enhancement to show device location
4. **Browser Fingerprinting**: Enhanced security via device fingerprinting

## Future Enhancements

1. Device nicknames (e.g., "My iPhone", "Work Laptop")
2. Suspicious login alerts
3. Email notifications on new device login
4. Geolocation-based device info
5. Browser/app version tracking
6. Session activity history

---

**BharathVA - The Voice of India**

Secure, transparent, and user-controlled session management.

