import { Stack } from 'expo-router';
import React from 'react';

export default function ExploreLayout() {
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
      <Stack.Screen name="ForYou" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="TodaysNew" options={{ headerShown: false, header: () => null }} />
    </Stack>
  );
}
