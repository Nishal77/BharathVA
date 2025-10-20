# Mobile Development Setup Guide

## Problem Solved

The issue you were experiencing was that the mobile app was configured to connect to `localhost:8081`, which works fine in the iOS Simulator but fails on physical devices because `localhost` on a physical device refers to the device itself, not your development machine.

## Solution Implemented

### 1. Fixed API Configuration

**File: `apps/mobile/services/api/environment.ts`**
- Created environment-based configuration
- Set development machine IP: `192.168.0.225:8081`
- Added support for staging and production environments

**File: `apps/mobile/services/api/config.ts`**
- Updated to use environment configuration
- Added logging configuration for development

### 2. Enhanced API Service

**File: `apps/mobile/services/api/authService.ts`**
- Added detailed logging for development
- Improved error handling and debugging

### 3. Added Connection Testing

**File: `apps/mobile/services/api/testConnection.ts`**
- Created comprehensive API connection tests
- Added response time monitoring
- Detailed error reporting

**File: `apps/mobile/app/(auth)/register/SignInAsSupport.tsx`**
- Added "Test API Connection" button (development only)
- Real-time connection testing from the app

### 4. Utility Scripts

**File: `apps/mobile/scripts/get-ip.js`**
- Script to automatically find your machine's IP address
- Usage: `node apps/mobile/scripts/get-ip.js`

## How to Use

### 1. Find Your Machine's IP Address

```bash
# Run the IP detection script
node apps/mobile/scripts/get-ip.js

# Or manually find it
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 2. Update Configuration (if needed)

If your IP address changes, update `apps/mobile/services/api/environment.ts`:

```typescript
const environments: Record<Environment, ApiConfig> = {
  development: {
    baseUrl: 'http://YOUR_IP_ADDRESS:8081/auth', // Update this
    timeout: 30000,
    enableLogging: true,
  },
  // ... other environments
};
```

### 3. Test Connection

#### From the App (Development Mode)
1. Open the registration screen
2. Tap "🔍 Test API Connection" button
3. Check the results

#### From Terminal
```bash
# Test basic connectivity
curl http://192.168.0.225:8081/auth/register/health

# Test with headers
curl -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     http://192.168.0.225:8081/auth/register/health
```

### 4. Start Backend Services

Make sure your backend services are running:

```bash
# From the backend directory
cd backend
./start-all-services.sh

# Or using Docker
docker-compose up -d
```

## Network Requirements

### For Physical Devices
- ✅ Device and development machine on same WiFi network
- ✅ Backend services running on development machine
- ✅ Port 8081 accessible (no firewall blocking)
- ✅ CORS properly configured (already done)

### For Simulators/Emulators
- ✅ localhost works fine
- ✅ No network configuration needed

## Troubleshooting

### Connection Issues

1. **"Network request failed"**
   - Check if backend services are running
   - Verify IP address is correct
   - Ensure device is on same network

2. **"Request timeout"**
   - Check network connectivity
   - Verify backend is responding
   - Check firewall settings

3. **"Invalid response from server"**
   - Backend might be returning HTML instead of JSON
   - Check backend logs for errors

### Backend Service Issues

1. **Check if services are running:**
   ```bash
   # Check auth service
   curl http://192.168.0.225:8081/auth/register/health
   
   # Check gateway
   curl http://192.168.0.225:8080/actuator/health
   
   # Check discovery service
   curl http://192.168.0.225:8761/actuator/health
   ```

2. **Check service logs:**
   ```bash
   # Auth service logs
   tail -f backend/logs/auth-service.log
   
   # Gateway logs
   tail -f backend/logs/gateway-service.log
   ```

### Database Issues

1. **Check database connection:**
   - Verify Neon database credentials
   - Check if database is accessible
   - Review database logs

2. **Check database tables:**
   ```sql
   -- Connect to your Neon database and run:
   SELECT * FROM users LIMIT 5;
   SELECT * FROM registration_sessions LIMIT 5;
   ```

## Development Workflow

### 1. Start Development
```bash
# Terminal 1: Start backend services
cd backend
./start-all-services.sh

# Terminal 2: Start mobile app
cd apps/mobile
npm start
```

### 2. Test on Different Devices
- **iOS Simulator**: Should work with localhost
- **Physical iPhone**: Uses your machine's IP address
- **Android Emulator**: Should work with localhost
- **Physical Android**: Uses your machine's IP address

### 3. Debug Connection Issues
1. Use the "Test API Connection" button in the app
2. Check console logs for detailed API requests/responses
3. Use the terminal curl commands to test backend directly

## Production Deployment

When deploying to production:

1. Update `environment.ts` with production API URL
2. Remove development-only features (test buttons, etc.)
3. Set `enableLogging: false` for production
4. Use HTTPS endpoints

## Security Notes

- Development configuration uses HTTP (not HTTPS)
- Production should always use HTTPS
- API keys and secrets should be environment variables
- Never commit production credentials to version control

## Support

If you encounter issues:

1. Check the connection test results
2. Verify backend services are running
3. Check network connectivity
4. Review backend logs
5. Test with curl commands

The connection test feature in the app will help diagnose most common issues automatically.
