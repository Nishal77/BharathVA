import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
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
      <Stack.Screen name="LocalPulse/index" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen 
        name="LocalPulse/[newsId]" 
        options={{ 
          headerShown: false, 
          header: () => null,
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }} 
      />
      <Stack.Screen 
        name="LocalPulse/location-suggestion" 
        options={{ 
          headerShown: false, 
          header: () => null,
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }} 
      />
    </Stack>
  );
}

