// API Configuration
// Update BASE_URL based on where you're testing from

// Using Local IP for better compatibility with Expo/React Native
export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.9:8080/api',
  TIMEOUT: 30000, // 30 seconds
};

// Alternative configurations:
// For localhost (might not work with Expo)
// export const API_CONFIG = {
//   BASE_URL: 'http://localhost:8080/api',
//   TIMEOUT: 30000,
// };

// For Android Emulator:
// export const API_CONFIG = {
//   BASE_URL: 'http://10.0.2.2:8080/api',
//   TIMEOUT: 30000,
// };

export const ENDPOINTS = {
  AUTH: {
    REGISTER_EMAIL: '/auth/register/email',
    VERIFY_OTP: '/auth/register/verify-otp',
    RESEND_OTP: '/auth/register/resend-otp',
    SUBMIT_DETAILS: '/auth/register/details',
    CREATE_PASSWORD: '/auth/register/password',
    CHECK_USERNAME: '/auth/register/check-username',
    CREATE_USERNAME: '/auth/register/username',
    HEALTH: '/auth/register/health',
  },
};

