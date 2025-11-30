import { Stack } from 'expo-router';
import React from 'react';

export default function UserIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        header: () => null,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="home" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="profile" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="settings" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="explore" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="messages" options={{ headerShown: false, header: () => null }} />
    </Stack>
  );
}
