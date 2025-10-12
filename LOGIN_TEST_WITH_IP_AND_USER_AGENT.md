# Login Test with IP Address and User Agent Tracking

## Overview

This document explains how to test the login functionality with the new IP address and user agent tracking features. The system now captures and stores device information for each login session.

## What's New

### 1. IP Address Tracking
- The system now captures the client's IP address during login
- Supports both direct connections and proxy/load balancer scenarios (X-Forwarded-For header)
- IP address is stored in the `user_sessions` table

### 2. User Agent Tracking
- Captures the client's User-Agent string (browser, device info)
- Stored alongside the refresh token for session management
- Useful for identifying devices and browser types

### 3. Enhanced Logging
- **System.out.println** for terminal visibility (clear console output)
- **log.info** for application logs
- Detailed session information including IP and User-Agent
- Real-time database verification

## Database Schema

The `user_sessions` table now includes:

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL,
    ip_address VARCHAR(45),        -- NEW: Stores IP address
    user_agent VARCHAR(500)         -- NEW: Stores User-Agent
);
```

## Testing the Login Flow

### Prerequisites

1. Ensure all services are running:
```bash
cd backend
docker-compose ps
```

Expected output:
```
bharathva-discovery   (healthy)
bharathva-gateway     (healthy)
bharathva-auth        (healthy)
```

2. Wait 30-40 seconds after starting services for Eureka registration to complete.

### Test 1: Login via curl (Terminal)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl/7.88.1" \
  -d '{"email":"nishalpoojary777@gmail.com","password":"YOUR_PASSWORD"}'
```

### Test 2: Login via curl with Custom Headers

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{"email":"nishalpoojary777@gmail.com","password":"YOUR_PASSWORD"}'
```

### Test 3: Login from React Native Expo App

The mobile app automatically sends the User-Agent header. The login will capture:
- Device IP address
- React Native Expo user agent string
- Device and platform information

## Expected Terminal Output

After a successful login, you should see:

```
===========================================
✅ LOGIN SUCCESSFUL - SESSION CREATED
===========================================
📧 Email: nishalpoojary777@gmail.com
👤 Username: nishalwho
🆔 User ID: b903254e-1c45-432b-91d3-9fa7113a4e9b
-------------------------------------------
🔑 JWT ACCESS TOKEN:
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiOTAzMjU0ZS0xYzQ1LTQzMmItOTFkMy05ZmE3MTEzYTRlOWIi...
-------------------------------------------
🔄 REFRESH TOKEN (Session Token):
Abc123XyzRandomRefreshToken456...
-------------------------------------------
💾 DATABASE SESSION DETAILS:
Session ID: c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6
Expires At: 2025-10-18T10:15:30.123456
Created At: 2025-10-11T10:15:30.123456
IP Address: 172.18.0.1
User Agent: curl/7.88.1
Is Active: true
-------------------------------------------
📊 Total active sessions: 1
===========================================
```

## Checking Database Records

### Query 1: Check User Sessions

```bash
cd backend
docker-compose exec auth-service sh -c "echo 'SELECT * FROM user_sessions WHERE user_id = (SELECT id FROM users WHERE email = '\''nishalpoojary777@gmail.com'\'') ORDER BY created_at DESC LIMIT 1;' | psql \$DB_URL"
```

Or use Neon DB Console:

```sql
SELECT 
    id,
    user_id,
    LEFT(refresh_token, 30) || '...' as refresh_token_preview,
    expires_at,
    created_at,
    is_active,
    ip_address,
    user_agent
FROM user_sessions
WHERE user_id = (
    SELECT id FROM users WHERE email = 'nishalpoojary777@gmail.com'
)
ORDER BY created_at DESC
LIMIT 5;
```

Expected result:

| id | user_id | refresh_token_preview | expires_at | created_at | is_active | ip_address | user_agent |
|----|---------|----------------------|------------|------------|-----------|------------|------------|
| c1a2b3c4... | b903254e... | Abc123XyzRandomRefreshToken456... | 2025-10-18 10:15:30 | 2025-10-11 10:15:30 | true | 172.18.0.1 | curl/7.88.1 |

### Query 2: View All Sessions for User

```sql
SELECT 
    id,
    created_at,
    expires_at,
    is_active,
    ip_address,
    CASE 
        WHEN user_agent LIKE '%iPhone%' THEN 'iPhone'
        WHEN user_agent LIKE '%Android%' THEN 'Android'
        WHEN user_agent LIKE '%curl%' THEN 'curl'
        ELSE 'Other'
    END as device_type
FROM user_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'nishalpoojary777@gmail.com')
ORDER BY created_at DESC;
```

## Understanding the Output

### IP Address

- **Local Docker**: `172.18.0.1` or similar (Docker bridge network)
- **Mobile App**: Your actual IP address from the network
- **Behind Proxy**: X-Forwarded-For header value (if provided)

### User Agent Examples

| User Agent | Device/Client |
|------------|---------------|
| `curl/7.88.1` | Terminal curl command |
| `Mozilla/5.0 (iPhone; CPU iPhone OS 14_0...)` | iPhone Safari |
| `Mozilla/5.0 (Linux; Android 11; ...)` | Android Chrome |
| `Expo/50.0.0 (iPhone14,5; iOS 16.0)` | React Native Expo iOS |

## Troubleshooting

### Issue 1: Session Token Not Showing in Database

**Symptoms**: No entries in `user_sessions` table after login

**Solution**:
1. Check if you completed registration (not just account creation)
2. Perform a **login** request (POST `/api/auth/login`)
3. Check Docker logs: `docker-compose logs -f auth-service`

### Issue 2: IP Address Shows as null

**Symptoms**: `ip_address` column is null in database

**Possible causes**:
- Request not passing through the controller properly
- Check if `HttpServletRequest` is available
- Verify Docker network configuration

**Solution**:
```bash
# Check auth-service logs
docker-compose logs auth-service | grep "IP Address"

# Should show: IP Address: 172.18.0.1 (or similar)
```

### Issue 3: User Agent Shows as null

**Symptoms**: `user_agent` column is null

**Solution**:
Always include User-Agent header in requests:
```bash
curl ... -H "User-Agent: YourApp/1.0"
```

## API Response

Successful login response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "Abc123XyzRandomRefreshToken456...",
    "tokenType": "Bearer",
    "userId": "b903254e-1c45-432b-91d3-9fa7113a4e9b",
    "email": "nishalpoojary777@gmail.com",
    "username": "nishalwho",
    "expiresIn": 3600000,
    "refreshExpiresIn": 604800000
  },
  "timestamp": "2025-10-11T10:15:30.123456"
}
```

## Security Notes

1. **IP Address Privacy**: IP addresses are stored for security purposes only
2. **Session Management**: Users can see their active devices/sessions
3. **Token Rotation**: Refresh tokens are unique per device/session
4. **Auto Cleanup**: Expired sessions should be cleaned periodically

## Next Steps

1. **Test login from mobile app**
2. **Verify IP and user agent in database**
3. **Test multiple device logins** (see multiple sessions)
4. **Test logout** (session should be deactivated)
5. **Test token refresh** (uses existing session)

---

**BharathVA - The Voice of India**

Secure authentication with full device tracking and session management.

