# How to See JWT and Session Tokens

## Quick Test to See Everything

### Option 1: Test with curl

#### Step 1: Open Terminal for Logs
```bash
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose logs -f auth-service
```

#### Step 2: Login in Another Terminal
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nishalpoojary777@gmail.com",
    "password": "YOUR_PASSWORD"
  }'
```

### Option 2: Use the Mobile App

When you login through the app, check the backend logs:
```bash
docker-compose logs -f auth-service
```

## What You'll See

### In Terminal Logs:

```
===========================================
LOGIN SUCCESSFUL
===========================================
User Email: nishalpoojary777@gmail.com
User ID: 0519faaa-c5c9-4250-9102-acd460e0f2b8
Username: dreamer8057
-------------------------------------------
ACCESS TOKEN (JWT):
eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im5pc2hhbHBvb2phcnk3NzdAZ21haWwuY29tIiwidXNlcm5hbWUiOiJkcmVhbWVyODA1NyIsInVzZXJJZCI6IjA1MTlmYWFhLWM1YzktNDI1MC05MTAyLWFjZDQ2MGUwZjJiOCIsInR5cGUiOiJhY2Nlc3MiLCJzdWIiOiIwNTE5ZmFhYS1jNWM5LTQyNTAtOTEwMi1hY2Q0NjBlMGYyYjgiLCJpYXQiOjE3NjAxNzM4MDAsImV4cCI6MTc2MDE3NzQwMH0.xyz123abc456...
-------------------------------------------
REFRESH TOKEN (Session Token):
M8P3d8fTt3zqB8z4pL0rX5nY2hK6vU9wE1mA7tC0sD4fG8jH3lN5pQ2rS6uV9xY1zA3bC5dE7fG9hJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN1oP3qR5sT7uV9wX1yZ3aB5cD7eF9gH1iJ3kL5mN7oP9qR1sT3uV5wX7yZ9
-------------------------------------------
SESSION SAVED TO DATABASE:
Session ID: 8b19e1f0-a5b3-4c7d-9e2f-1a8d6c4b2e0a
User ID: 0519faaa-c5c9-4250-9102-acd460e0f2b8
Refresh Token: M8P3d8fTt3zqB8z4pL0...
Expires At: 2025-10-17T14:45:30
Created At: 2025-10-10T14:45:30
Is Active: true
-------------------------------------------
```

### In API Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "M8P3d8fTt3zqB8z4pL0rX5...",
  "userId": "0519faaa-c5c9-4250-9102-acd460e0f2b8",
  "email": "nishalpoojary777@gmail.com",
  "username": "dreamer8057"
}
```

### In Neon Database:

After login, query:
```sql
SELECT * FROM user_sessions ORDER BY created_at DESC LIMIT 1;
```

Result:
```
id:              8b19e1f0-a5b3-4c7d-9e2f-1a8d6c4b2e0a  ← Session ID
user_id:         0519faaa-c5c9-4250-9102-acd460e0f2b8  ← User ID  
refresh_token:   M8P3d8fTt3zqB8z4pL0rX5...
created_at:      2025-10-10 14:45:30
expires_at:      2025-10-17 14:45:30  (7 days later)
is_active:       true
```

## Why Nothing Stored Yet?

The `user_sessions` table is currently empty because:
- ✅ You completed registration
- ❌ You haven't logged in yet

**Registration creates user account**  
**Login creates session tokens**

## Test Now

### Quick Test Script:
```bash
# 1. Start log viewer
docker-compose logs -f auth-service &

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nishalpoojary777@gmail.com",
    "password": "YOUR_PASSWORD_HERE"
  }' | jq .
```

You'll immediately see:
- Complete JWT token in logs
- Complete refresh token in logs
- Session ID and User ID in logs
- Session record created in database

## Verify Session Created

### Check Database:
```sql
-- View all sessions
SELECT 
    id as session_id,
    user_id,
    LEFT(refresh_token, 30) || '...' as token,
    created_at,
    expires_at,
    is_active
FROM user_sessions
ORDER BY created_at DESC;
```

### Expected Result:
```
session_id        | user_id          | token              | created_at          | expires_at          | is_active
------------------|------------------|-------------------|---------------------|---------------------|----------
8b19e1f0-a5b3-... | 0519faaa-c5c9-...| M8P3d8fTt3zqB8... | 2025-10-10 14:45:30 | 2025-10-17 14:45:30 | t
```

## Documentation Files

Now only 10 essential files:

**Main:**
- `README.md` - Project overview
- `QUICK_START.md` - Quick start
- `TEST_LOGIN.md` - Login testing
- `HOW_TO_SEE_TOKENS.md` - This file
- `IMPLEMENTATION_COMPLETE.md` - Summary

**Mobile:**
- `apps/mobile/README.md`
- `apps/mobile/services/api/README.md`

**Backend:**
- `backend/README.md`
- `backend/HOW_TO_RUN.md`
- `backend/DOCKER_CHEAT_SHEET.md`
- `backend/auth-service/JWT_REFRESH_TOKEN_IMPLEMENTATION.md`

---

**Ready to test!** Login now and see complete tokens in your terminal logs!

