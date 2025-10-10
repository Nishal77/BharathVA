# API Services

This folder contains all API service files for the mobile app.

## Structure

```
services/api/
├── config.ts          # API configuration (BASE_URL, endpoints)
├── authService.ts     # Authentication API calls
└── README.md          # This file
```

## Configuration

### Update BASE_URL in `config.ts`:

**For iOS Simulator:**
```typescript
BASE_URL: 'http://localhost:8080/api'
```

**For Android Emulator:**
```typescript
BASE_URL: 'http://10.0.2.2:8080/api'
```

**For Physical Device:**
```typescript
BASE_URL: 'http://YOUR_LOCAL_IP:8080/api'  // e.g., http://192.168.1.100:8080/api
```

To find your local IP:
```bash
# macOS
ipconfig getifaddr en0

# Or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Usage

### Import the service:

```typescript
import { authService, ApiError } from '../../../services/api/authService';
```

### Call API methods:

```typescript
// Register email
try {
  const response = await authService.registerEmail(email);
  const sessionToken = response.sessionToken;
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    Alert.alert('Error', error.message);
  }
}
```

## Available Methods

- `authService.registerEmail(email)` - Register and send OTP
- `authService.verifyOtp(sessionToken, otp)` - Verify OTP
- `authService.resendOtp(sessionToken)` - Resend OTP
- `authService.submitDetails(...)` - Submit user details
- `authService.createPassword(...)` - Create password
- `authService.checkUsername(username)` - Check availability
- `authService.createUsername(...)` - Complete registration
- `authService.healthCheck()` - Check API health

## Error Handling

All methods throw `ApiError` on failure:

```typescript
try {
  await authService.registerEmail(email);
} catch (error) {
  if (error instanceof ApiError) {
    // Show error message from backend
    Alert.alert('Error', error.message);
  } else {
    // Network or unknown error
    Alert.alert('Error', 'Something went wrong');
  }
}
```

## Backend Integration

The mobile app now connects to:
- **Discovery Service** (8761) - Service registry
- **Gateway Service** (8080) - API router
- **Auth Service** (8081) - Registration logic
- **Neon Database** - User data storage
- **Gmail SMTP** - OTP emails

All requests go through the Gateway for proper routing and load balancing.

