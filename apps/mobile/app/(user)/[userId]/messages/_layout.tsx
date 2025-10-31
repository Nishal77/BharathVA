import { Stack } from 'expo-router';
import React from 'react';

export default function MessagesLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="new" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="[chatId]" options={{ headerShown: false, header: () => null }} />
    </Stack>
  );
}
