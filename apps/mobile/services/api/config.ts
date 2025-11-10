// API Configuration
import { getBaseURL, getTimeout, isLoggingEnabled } from './environment';

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: getTimeout(),
  ENABLE_LOGGING: isLoggingEnabled(),
};

export const ENDPOINTS = {
  AUTH: {
    REGISTER_EMAIL: '/register/email',
    VERIFY_OTP: '/register/verify-otp',
    RESEND_OTP: '/register/resend-otp',
    SUBMIT_DETAILS: '/register/details',
    CREATE_PASSWORD: '/register/password',
    CHECK_USERNAME: '/register/check-username',
    CREATE_USERNAME: '/register/username',
    REGISTER_PROFILE: '/register/profile',
    REGISTER_COMPLETE: '/register/complete',
    HEALTH: '/register/health',
    LOGIN: '/login',
    REFRESH: '/refresh',
    LOGOUT: '/logout',
    VALIDATE: '/validate',
    PROFILE: '/profile',
    GET_SESSIONS: '/sessions',
    GET_CURRENT_REFRESH_TOKEN: '/sessions/current-refresh-token',
    LOGOUT_SESSION: '/sessions/logout',
    LOGOUT_ALL_OTHER: '/sessions/logout-all-other',
    USER_ME: '/user/me',
    USER_UPDATE_FULLNAME: '/user/me/fullname',
    USER_UPDATE_USERNAME: '/user/me/username',
    USER_UPDATE_DATEOFBIRTH: '/user/me/dateofbirth',
    USER_UPDATE_BIO: '/user/me/bio',
    USER_UPDATE_PROFILE_IMAGE: '/user/me/profile-image',
    USER_UPDATE_PROFILE: '/user/me/profile',
  },
};

