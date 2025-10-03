import { Stack } from 'expo-router';
import React from 'react';

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[userId]" />
    </Stack>
  );
}
