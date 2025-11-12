import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authService, tokenManager } from '../services/api/authService';
import { clearAuthCaches, clearFeedCaches } from '../utils/cacheManager';
import { clearUserProfileCache } from '../services/api/feedService';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface UserData {
  userId: string;
  email: string;
  username: string;
  fullName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use try-catch for router hooks to prevent errors
  let router: any = null;
  let segments: string[] = [];
  
  try {
    router = useRouter();
    segments = useSegments();
  } catch (error) {
    console.warn('Router hooks failed:', error);
  }

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup && router) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup && router) {
      console.log('✅ [AuthContext] User authenticated in auth group, redirecting to home:', user.userId);
      router.replace(`/(user)/${user.userId}/(tabs)`);
    }
  }, [user, segments, isLoading, router]);

  const checkAuthStatus = async () => {
    // Add timeout to prevent hanging on auth check
    const authCheckTimeout = setTimeout(() => {
      console.warn('⚠️ [AuthContext] Auth check timeout - forcing logout');
      setUser(null);
      setIsLoading(false);
    }, 10000); // 10 second timeout for entire auth check

    try {
      const accessToken = await tokenManager.getAccessToken();
      const refreshToken = await tokenManager.getRefreshToken();
      const userData = await tokenManager.getUserData();

      if (!accessToken || !refreshToken || !userData) {
        console.log('ℹ️ [AuthContext] No auth tokens or user data found - user not logged in');
        setUser(null);
        setIsLoading(false);
        clearTimeout(authCheckTimeout);
        return;
      }

      // CRITICAL: Verify user ID from token matches userData
      // This prevents using stale userData from a different user
      const tokenUserId = await tokenManager.getUserIdFromToken();
      if (tokenUserId && userData.userId && tokenUserId !== userData.userId) {
        console.warn('⚠️ [AuthContext] User ID mismatch detected. Clearing tokens and forcing re-login.', {
          tokenUserId,
          userDataUserId: userData.userId
        });
        // Clear all caches when user ID mismatch is detected
        try {
          await clearAuthCaches();
          await clearFeedCaches();
          clearUserProfileCache();
        } catch (error) {
          console.warn('⚠️ [AuthContext] Error clearing caches:', error);
        }
        await tokenManager.clearSecureStore();
        setUser(null);
        setIsLoading(false);
        clearTimeout(authCheckTimeout);
        return;
      }

      // Validate token with timeout
      const validatePromise = authService.validateToken();
      const validateTimeout = new Promise<boolean>((resolve) => 
        setTimeout(() => {
          console.warn('⚠️ [AuthContext] Token validation timeout - backend unreachable');
          resolve(false);
        }, 5000)
      );
      
      const isValid = await Promise.race([validatePromise, validateTimeout]);

      if (isValid) {
        console.log('✅ [AuthContext] Token validated successfully');
        setUser(userData);
        clearTimeout(authCheckTimeout);
      } else {
        console.log('ℹ️ [AuthContext] Token validation failed - attempting refresh');
        try {
          // Refresh token with timeout
          const refreshPromise = authService.refreshAccessToken();
          const refreshTimeout = new Promise<boolean>((resolve) => 
            setTimeout(() => {
              console.warn('⚠️ [AuthContext] Token refresh timeout - backend unreachable');
              resolve(false);
            }, 8000)
          );
          
          const refreshed = await Promise.race([refreshPromise, refreshTimeout]);

          if (refreshed) {
            console.log('✅ [AuthContext] Token refreshed successfully');
            // CRITICAL: Get fresh userData after refresh
            // Token refresh updates userData to match the new token
            const newUserData = await tokenManager.getUserData();
            if (newUserData) {
              setUser(newUserData);
            } else {
              console.warn('⚠️ [AuthContext] No userData after token refresh, forcing re-login');
              // Clear all caches when forcing re-login
              try {
                await clearAuthCaches();
                await clearFeedCaches();
                clearUserProfileCache();
              } catch (cacheError) {
                console.warn('⚠️ [AuthContext] Error clearing caches:', cacheError);
              }
              await tokenManager.clearSecureStore();
              setUser(null);
            }
          } else {
            console.log('ℹ️ [AuthContext] Token refresh failed - clearing auth state');
            // Clear all caches when refresh fails
            try {
              await clearAuthCaches();
              await clearFeedCaches();
              clearUserProfileCache();
            } catch (cacheError) {
              console.warn('⚠️ [AuthContext] Error clearing caches:', cacheError);
            }
            await tokenManager.clearSecureStore();
            setUser(null);
          }
          clearTimeout(authCheckTimeout);
        } catch (refreshError) {
          console.error('❌ [AuthContext] Token refresh error:', refreshError);
          // Clear all caches on refresh error
          try {
            await clearAuthCaches();
            await clearFeedCaches();
            clearUserProfileCache();
          } catch (cacheError) {
            console.warn('⚠️ [AuthContext] Error clearing caches:', cacheError);
          }
          await tokenManager.clearSecureStore();
          setUser(null);
          clearTimeout(authCheckTimeout);
        }
      }
    } catch (error) {
      console.error('❌ [AuthContext] Auth check error:', error);
      // Clear all caches on auth check error
      try {
        await clearAuthCaches();
        await clearFeedCaches();
        clearUserProfileCache();
      } catch (cacheError) {
        console.warn('⚠️ [AuthContext] Error clearing caches:', cacheError);
      }
      await tokenManager.clearSecureStore();
      setUser(null);
      clearTimeout(authCheckTimeout);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await authService.login(email, password);

      const userData: UserData = {
        userId: loginResponse.userId,
        email: loginResponse.email,
        username: loginResponse.username,
        fullName: loginResponse.fullName,
      };

      // Save user data to SecureStore for persistence
      await tokenManager.saveUserData(userData);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      try {
        await authService.logout();
      } catch (backendError) {
        // Silent fail for backend logout
      }
      
      // CRITICAL: Clear all caches and reset state
      // authService.logout() already clears caches, but we ensure state is reset here
      try {
        await clearAuthCaches();
        await clearFeedCaches();
        clearUserProfileCache();
      } catch (cacheError) {
        console.warn('⚠️ [AuthContext] Error clearing caches on logout:', cacheError);
      }
      
      await tokenManager.clearTokens();
      setUser(null);

      if (router) {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      // Ensure cleanup even if logout fails
      try {
        await clearAuthCaches();
        await clearFeedCaches();
        clearUserProfileCache();
      } catch (cacheError) {
        console.warn('⚠️ [AuthContext] Error clearing caches on logout error:', cacheError);
      }
      await tokenManager.clearTokens();
      setUser(null);
      if (router) {
        router.replace('/(auth)/login');
      }
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Instead of throwing an error, return a safe fallback
    console.warn('useAuth must be used within an AuthProvider, returning fallback');
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => {},
      logout: async () => {},
      refreshAuth: async () => {},
    };
  }
  return context;
}

