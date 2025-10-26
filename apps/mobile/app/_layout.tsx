import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider as AppThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../global.css';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Set index as the initial route to show hero page first
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading fonts...</Text>
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <ThemedRootLayout />
      </AppThemeProvider>
    </AuthProvider>
  );
}

function ThemedRootLayout() {
  const { isDark } = useTheme();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Centralized StatusBar Management */}
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <ThemeProvider value={DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            header: () => null,
          }}>
          <Stack.Screen name="index" options={{ headerShown: false, header: () => null }} />
          <Stack.Screen name="(user)" options={{ headerShown: false, header: () => null }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, header: () => null }} />
        </Stack>
      </ThemeProvider>
    </>
  );
}
