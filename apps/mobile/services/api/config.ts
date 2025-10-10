// API Configuration
// Update BASE_URL based on where you're testing from

// For iOS Simulator
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000, // 30 seconds
};

// For Android Emulator - uncomment this:
// export const API_CONFIG = {
//   BASE_URL: 'http://10.0.2.2:8080/api',
//   TIMEOUT: 30000,
// };

// For Physical Device - uncomment and add your IP:
// export const API_CONFIG = {
//   BASE_URL: 'http://YOUR_LOCAL_IP:8080/api', // e.g., http://192.168.1.100:8080/api
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

