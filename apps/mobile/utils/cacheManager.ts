/**
 * Cache Manager for BharathVA
 * Comprehensive cache clearing utility for SecureStore, AsyncStorage, and in-memory caches
 * Use this to completely reset app state and force fresh data fetch
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

/**
 * Clear all SecureStore keys related to authentication and user data
 */
export async function clearSecureStore(): Promise<void> {
  try {
    const keys = [
      TOKEN_KEYS.ACCESS_TOKEN,
      TOKEN_KEYS.REFRESH_TOKEN,
      TOKEN_KEYS.USER_DATA,
      'userId',
      'username',
      'email',
      'profile',
      'auth_user',
    ];

    for (const key of keys) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        // Continue even if one key fails
      }
    }

    console.log('✅ SecureStore cleared completely');
  } catch (error) {
    console.error('❌ Error clearing SecureStore:', error);
    throw error;
  }
}

/**
 * Clear all AsyncStorage data
 * This will reset all persisted state including feed caches, notification caches, etc.
 */
export async function clearAsyncStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared completely');
  } catch (error) {
    console.error('❌ Error clearing AsyncStorage:', error);
    throw error;
  }
}

/**
 * Clear specific AsyncStorage keys related to feeds and notifications
 * Use this if you want to preserve other data
 */
export async function clearFeedCaches(): Promise<void> {
  try {
    const keys = [
      'feed_cache',
      'notifications_cache',
      'feed_data',
      'cached_feeds',
      'registration_profile_draft',
    ];

    for (const key of keys) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        // Continue even if one key fails
      }
    }

    console.log('✅ Feed caches cleared');
  } catch (error) {
    console.error('❌ Error clearing feed caches:', error);
    throw error;
  }
}

/**
 * Nuclear option: Clear everything
 * This clears SecureStore, AsyncStorage, and should be called before clearing in-memory caches
 * 
 * After calling this, you should:
 * 1. Reset AuthContext state (setUser(null))
 * 2. Clear in-memory caches (userProfileCache.clear())
 * 3. Force app reload or navigate to login
 */
export async function clearAllCaches(): Promise<void> {
  try {
    console.log('🧹 Starting comprehensive cache clear...');
    
    await Promise.all([
      clearSecureStore(),
      clearAsyncStorage(),
    ]);
    
    console.log('✅ All caches cleared successfully');
  } catch (error) {
    console.error('❌ Error during comprehensive cache clear:', error);
    throw error;
  }
}

/**
 * Clear only authentication-related caches (SecureStore + auth-related AsyncStorage)
 * Preserves feed data and other non-auth caches
 */
export async function clearAuthCaches(): Promise<void> {
  try {
    console.log('🧹 Clearing authentication caches...');
    
    await clearSecureStore();
    
    // Also clear any auth-related AsyncStorage keys
    const authKeys = [
      'auth_user',
      'user_session',
      'login_state',
    ];
    
    for (const key of authKeys) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        // Continue even if one key fails
      }
    }
    
    console.log('✅ Authentication caches cleared');
  } catch (error) {
    console.error('❌ Error clearing auth caches:', error);
    throw error;
  }
}

