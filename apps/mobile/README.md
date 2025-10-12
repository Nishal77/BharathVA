# BharathVA Mobile App

React Native + Expo mobile application for BharathVA social platform.

## Tech Stack

- React Native 0.81.4
- Expo ~54
- TypeScript
- NativeWind (Tailwind CSS)
- Expo Router
- expo-secure-store (token storage)

## Quick Start

```bash
# Install dependencies (from project root)
cd ../..
pnpm install

# Start dev server
cd apps/mobile
npx expo start

# Clear cache if needed
npx expo start --clear
```

## Authentication

### Login
```typescript
import { authService } from './services/api/authService';

const response = await authService.login('email@example.com', 'password');
// Tokens automatically stored in SecureStore
```

### Logout
```typescript
await authService.logout();
// Clears tokens and deactivates session
```

### Check Authentication
```typescript
const isAuthenticated = await authService.isAuthenticated();
const user = await authService.getCurrentUser();
```

## Configuration

Update backend URL in `services/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_LOCAL_IP:8080/api',
  TIMEOUT: 30000,
};
```

**Find your local IP:**
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`
- Linux: `ip addr show`

## Project Structure

```
mobile/
├── app/                 # Expo Router screens
│   ├── (auth)/         # Authentication screens
│   ├── (user)/         # User screens
│   └── _layout.tsx
├── components/          # Reusable components
├── services/
│   └── api/
│       ├── authService.ts  # Authentication API
│       └── config.ts       # API configuration
├── contexts/            # React contexts
└── assets/              # Images, fonts, etc.
```

## Troubleshooting

### Module Not Found
```bash
cd apps/mobile
rm -rf .expo
cd ../..
pnpm install
cd apps/mobile
npx expo start --clear
```

### Backend Not Reachable
1. Make sure backend is running: `cd backend && docker-compose ps`
2. Update `BASE_URL` in `config.ts` with your local IP
3. Test: `curl http://YOUR_IP:8080/api/auth/register/health`

### iOS Simulator
```bash
npx expo start
# Press 'i' for iOS simulator
```

### Android Emulator
```bash
npx expo start
# Press 'a' for Android emulator
```

## Features

- Multi-step registration with OTP
- Email verification
- Login with JWT + Refresh tokens
- Automatic token refresh
- Secure token storage
- Session management
- Profile management

---

**BharathVA Mobile - The Voice of India**

