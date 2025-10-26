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
    </Stack>
  );
}
