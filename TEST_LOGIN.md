# Test Login and View Tokens

## Your Registered Users

From Neon database, you have:
1. Email: `nishalpoojary777@gmail.com` | Username: `dreamer8057`
2. Email: `exot4396@gmail.com` | Username: `wanderer7638`

## Test Login Command

```bash
# Test login with first user
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nishalpoojary777@gmail.com",
    "password": "YOUR_PASSWORD_HERE"
  }'
```

## What You'll See in Terminal

### In Docker Logs (run in another terminal):
```bash
cd backend
docker-compose logs -f auth-service
```

You'll see detailed output like this:

```
===========================================
LOGIN REQUEST RECEIVED
Email: nishalpoojary777@gmail.com
===========================================

===========================================
LOGIN SUCCESSFUL
===========================================
User Email: nishalpoojary777@gmail.com
User ID: 0519faaa-c5c9-4250-9102-acd460e0f2b8
Username: dreamer8057
-------------------------------------------
ACCESS TOKEN (JWT):
eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im5pc2hhbHBvb2phcnk3NzdAZ21haWwuY29tIiwidXNlcm5hbWUiOiJkcmVhbWVyODA1NyIsInVzZXJJZCI6IjA1MTlmYWFhLWM1YzktNDI1MC05MTAyLWFjZDQ2MGUwZjJiOCIsInR5cGUiOiJhY2Nlc3MiLCJzdWIiOiIwNTE5ZmFhYS1jNWM5LTQyNTAtOTEwMi1hY2Q0NjBlMGYyYjgiLCJpYXQiOjE3MDk0MzY1MDAsImV4cCI6MTcwOTQ0MDEwMH0.abc123...
-------------------------------------------
REFRESH TOKEN (Session Token):
M8P3d8fTt3zqB8z4pL0rX5nY2hK6vU9wE1mA7tC0sD4fG8jH3lN5pQ2rS6uV9xY1zA3bC5dE7fG9hJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5cD7eF9gH1iJ3kL5mN7oP9qR1sT3uV5wX7yZ9
-------------------------------------------
SESSION SAVED TO DATABASE:
Session ID: 8b19e1f0-a5b3-4c7d-9e2f-1a8d6c4b2e0a
User ID: 0519faaa-c5c9-4250-9102-acd460e0f2b8
Refresh Token: M8P3d8fTt3zqB8z4pL0rX5nY2hK6vU9wE1mA7tC0sD4fG8jH3lN5pQ2rS6uV9xY1zA3bC5dE7fG9hJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5cD7eF9gH1iJ3kL5mN7oP9qR1sT3uV5wX7yZ9
Expires At: 2025-10-17T09:22:15.123456
Created At: 2025-10-10T09:22:15.123456
Is Active: true
-------------------------------------------
Active sessions for this user: 1
===========================================

===========================================
LOGIN RESPONSE BEING SENT
===========================================
User ID: 0519faaa-c5c9-4250-9102-acd460e0f2b8
Email: nishalpoojary777@gmail.com
Username: dreamer8057
-------------------------------------------
ACCESS TOKEN (JWT): eyJhbGciOiJIUzI1NiJ9...
-------------------------------------------
REFRESH TOKEN: M8P3d8fTt3zqB8z4pL0rX5...
-------------------------------------------
Access Token Expires In: 3600000 ms (60 minutes)
Refresh Token Expires In: 604800000 ms (7 days)
===========================================
```

## Verify in Database

After successful login, check Neon database:

```sql
-- View all sessions
SELECT 
    id,
    user_id,
    refresh_token,
    created_at,
    expires_at,
    is_active
FROM user_sessions
ORDER BY created_at DESC;
```

You should see:
```
id                                    | user_id                               | refresh_token      | created_at          | expires_at          | is_active
--------------------------------------|---------------------------------------|-------------------|---------------------|---------------------|----------
8b19e1f0-a5b3-4c7d-9e2f-1a8d6c4b2e0a | 0519faaa-c5c9-4250-9102-acd460e0f2b8 | M8P3d8fTt3zqB8... | 2025-10-10 09:22:15 | 2025-10-17 09:22:15 | true
```

## user_sessions Table Structure

The table has BOTH id and user_id:

```sql
Column          Type        Description
--------------  ----------  ------------------------------------------
id              UUID        Primary key - unique session identifier
user_id         UUID        Foreign key - which user owns this session
refresh_token   VARCHAR     The actual session token (unique)
expires_at      TIMESTAMP   When this session expires
created_at      TIMESTAMP   When session was created
ip_address      VARCHAR     User's IP (optional)
user_agent      VARCHAR     Device info (optional)
is_active       BOOLEAN     Is session still valid
```

## Test Complete Flow

### 1. Start Docker Logs (Terminal 1)
```bash
cd backend
docker-compose logs -f auth-service
```

### 2. Login (Terminal 2)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nishalpoojary777@gmail.com",
    "password": "YOUR_PASSWORD"
  }' | jq .
```

### 3. Check Session in Database
Visit Neon Console or run:
```sql
SELECT * FROM user_sessions WHERE user_id = '0519faaa-c5c9-4250-9102-acd460e0f2b8';
```

## What Gets Logged

### When You Login:
1. **Controller logs**: Request received with email
2. **Service logs**: 
   - User validation
   - Token generation
   - Session creation with ID and user_id
   - Complete tokens (JWT and refresh)
3. **Controller logs**: Response being sent with both tokens

### Session Record Created:
- **id**: Unique session ID (UUID)
- **user_id**: Your user ID (UUID)
- **refresh_token**: 64-byte secure random token
- **expires_at**: Current time + 7 days
- **created_at**: Current timestamp
- **is_active**: true

## Next Steps

1. **Login with one of your existing users**
2. **Watch the Docker logs** - you'll see complete tokens
3. **Check Neon database** - you'll see the session record
4. **Save the tokens** - use them for API requests

---

**Note**: Replace `YOUR_PASSWORD` with the actual password you set during registration.

