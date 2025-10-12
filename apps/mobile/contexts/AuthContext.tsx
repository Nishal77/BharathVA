import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authService, tokenManager } from '../services/api/authService';

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
      router.replace(`/(user)/${user.userId}/(tabs)`);
    }
  }, [user, segments, isLoading]);

  const checkAuthStatus = async () => {
    try {
      const accessToken = await tokenManager.getAccessToken();
      const refreshToken = await tokenManager.getRefreshToken();
      const userData = await tokenManager.getUserData();

      if (!accessToken || !refreshToken || !userData) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const isValid = await authService.validateToken();

      if (isValid) {
        setUser(userData);
      } else {
        try {
          const refreshed = await authService.refreshAccessToken();

          if (refreshed) {
            const newUserData = await tokenManager.getUserData();
            setUser(newUserData);
          } else {
            await tokenManager.clearTokens();
            setUser(null);
          }
        } catch (refreshError) {
          await tokenManager.clearTokens();
          setUser(null);
        }
      }
    } catch (error) {
      await tokenManager.clearTokens();
      setUser(null);
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
      
      await tokenManager.clearTokens();
      setUser(null);

      if (router) {
        router.replace('/(auth)/login');
      }
    } catch (error) {
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

