# BharathVA Mobile Application

React Native mobile application for iOS and Android platforms.

## Technology Stack

- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript 5.0+
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API
- **Secure Storage**: Expo SecureStore
- **HTTP Client**: Custom fetch wrapper with automatic token refresh

## Project Structure

```
apps/mobile/
├── app/                    # File-based routing
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   ├── register/      # Multi-step registration
│   │   └── ...
│   ├── (user)/            # Main application screens
│   │   ├── home.tsx
│   │   ├── profile/
│   │   └── ...
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── tweet/            # Tweet-related components
│   ├── ui/               # UI primitives
│   └── ...
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── ...
├── services/             # API services
│   └── api/
│       ├── authService.ts
│       ├── config.ts
│       └── tokenManager.ts
├── constants/            # App constants
├── hooks/                # Custom hooks
└── assets/               # Images, fonts, videos
```

## Setup

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- iOS Simulator (macOS only) or Android Emulator
- Expo CLI

### Installation

```bash
# Navigate to mobile directory
cd apps/mobile

# Install dependencies
npm install

# Start development server
npm start
```

### Running on Devices

**iOS Simulator**:
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Physical Device**:
1. Install Expo Go app from App Store or Play Store
2. Scan QR code from Expo CLI
3. Application will load on device

## Configuration

### API Configuration

Edit `services/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.9:8080/api', // Update with your IP
  TIMEOUT: 30000,
};
```

**Important**: Replace IP address with your development machine's IP:
```bash
# macOS - Get IP address
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

### Environment Setup

Development environment uses local backend services. Ensure backend is running before starting mobile app.

## Features

### Authentication
- Multi-step registration with email verification
- Email and password login
- Automatic token refresh
- Persistent authentication state
- Device tracking for sessions
- Secure token storage

### User Interface
- Dark mode support
- Responsive design
- Native animations
- Touch-optimized interactions
- Accessibility support

### State Management
- Global authentication state via Context API
- Secure token storage via Expo SecureStore
- Automatic session persistence
- Real-time state synchronization

## Development

### Code Organization

**Components**:
- Place reusable components in `components/`
- Use TypeScript interfaces for props
- Follow React best practices
- Implement proper error boundaries

**Screens**:
- Place screens in appropriate `app/` subdirectories
- Use file-based routing conventions
- Implement loading and error states
- Handle navigation properly

**Services**:
- Place API calls in `services/api/`
- Use consistent error handling
- Implement request/response typing
- Handle network failures gracefully

### Styling

**NativeWind Usage**:
```typescript
// Use className prop with Tailwind classes
<View className="flex-1 bg-white dark:bg-black">
  <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
    Welcome
  </Text>
</View>
```

**Color Scheme**:
```typescript
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
```

### Type Safety

**Define Interfaces**:
```typescript
interface UserData {
  userId: string;
  email: string;
  username: string;
  fullName: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
```

**Type API Responses**:
```typescript
const response = await apiCall<UserProfile>(
  '/auth/profile',
  'GET',
  null,
  true
);
```

## Authentication Flow

### Registration Flow
```typescript
// 1. Register email
const { sessionToken } = await authService.registerEmail(email);

// 2. Verify OTP
await authService.verifyOtp(sessionToken, otp);

// 3. Submit details
await authService.submitDetails(sessionToken, details);

// 4. Create password
await authService.createPassword(sessionToken, password);

// 5. Create username
await authService.createUsername(sessionToken, username);
```

### Login Flow
```typescript
// Login
const loginResponse = await authService.login(email, password);

// Tokens automatically stored in SecureStore
// User state updated in AuthContext
```

### Authenticated Requests
```typescript
// Automatic authentication
const profile = await apiCall('/auth/profile', 'GET', null, true);

// Token refresh handled automatically on 401
```

## API Integration

### Auth Service

**Methods**:
```typescript
authService.registerEmail(email: string)
authService.verifyOtp(sessionToken: string, otp: string)
authService.submitDetails(sessionToken: string, details: UserDetails)
authService.createPassword(sessionToken: string, password: string)
authService.createUsername(sessionToken: string, username: string)
authService.login(email: string, password: string)
authService.logout()
authService.refreshAccessToken()
authService.getCurrentUserProfile()
```

### Token Management

**Automatic Token Refresh**:
```typescript
// Implemented in apiCall wrapper
// On 401 response:
// 1. Calls refreshAccessToken()
// 2. Retries original request with new token
// 3. Returns result or throws error
```

**Manual Token Access**:
```typescript
const accessToken = await tokenManager.getAccessToken();
const refreshToken = await tokenManager.getRefreshToken();
const userData = await tokenManager.getUserData();
```

## State Management

### AuthContext

**Provider Setup**:
```typescript
// Root layout wraps app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>
```

**Usage in Components**:
```typescript
const { user, login, logout, loading } = useAuth();

// User data available
if (user) {
  console.log(user.fullName, user.username);
}

// Login
await login(email, password);

// Logout
await logout();
```

## Styling Guidelines

### NativeWind Classes
Use Tailwind utility classes via className prop:

```typescript
<View className="px-4 py-2">
  <Text className="text-lg font-semibold">Title</Text>
  <Text className="text-sm text-gray-500">Subtitle</Text>
</View>
```

### Dark Mode Support
```typescript
<View className="bg-white dark:bg-black">
  <Text className="text-gray-900 dark:text-gray-100">
    Content
  </Text>
</View>
```

### Responsive Design
```typescript
<View className="w-full md:w-1/2 lg:w-1/3">
  {/* Content */}
</View>
```

## Performance Optimization

### Best Practices
- Use React.memo for expensive components
- Implement FlatList for long lists
- Avoid inline function definitions in render
- Use useMemo and useCallback appropriately
- Optimize images with proper sizing
- Implement code splitting where beneficial

### Navigation Optimization
- Lazy load screens
- Preload critical screens
- Clear navigation stack when appropriate
- Handle deep linking efficiently

## Testing

### Component Testing
```bash
npm test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Build and Release

### Development Build
```bash
# iOS
expo build:ios --release-channel dev

# Android
expo build:android --release-channel dev
```

### Production Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### Over-The-Air Updates
```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

## Debugging

### Expo Dev Tools
Access dev menu:
- iOS Simulator: Cmd+D
- Android Emulator: Cmd+M
- Physical device: Shake device

### React Native Debugger
```bash
# Install
brew install react-native-debugger

# Start
open "rndebugger://set-debugger-loc?host=localhost&port=19000"
```

### Network Debugging
```bash
# Enable network inspection
# Access via Expo Dev Tools -> Debug Remote JS
```

## Common Issues

### Metro Bundler Cache
```bash
# Clear cache
npx expo start --clear
```

### Module Resolution
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Build Issues
```bash
# Clear Expo cache
expo prebuild --clean
```

## Dependencies

### Core Dependencies
- expo: SDK 52
- react: 18.x
- react-native: 0.76.x
- expo-router: File-based navigation
- nativewind: Tailwind styling
- expo-secure-store: Secure token storage

### Development Dependencies
- typescript: Type safety
- @types/*: Type definitions
- eslint: Code linting
- prettier: Code formatting

## Scripts

```json
{
  "start": "expo start",
  "ios": "expo start --ios",
  "android": "expo start --android",
  "web": "expo start --web",
  "lint": "eslint .",
  "type-check": "tsc --noEmit",
  "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
}
```

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [NativeWind Documentation](https://www.nativewind.dev)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction)

## Support

For mobile-specific issues:
1. Check Expo documentation
2. Review React Native troubleshooting
3. Verify API connectivity
4. Check device logs

## Version

Current Version: 1.0.0
Expo SDK: 52
React Native: 0.76
Last Updated: October 2025

