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
        name="LocalPulse/[updateId]" 
        options={{ 
          headerShown: false, 
          header: () => null,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }} 
      />
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
    </Stack>
  );
}

