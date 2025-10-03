import { Stack } from 'expo-router';
import React from 'react';
import { Dimensions } from 'react-native';
import { SidebarProvider } from '../../../contexts/SidebarContext';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

export default function UserIdLayout() {
  return (
    <SidebarProvider sidebarWidth={SIDEBAR_WIDTH}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" />
      </Stack>
    </SidebarProvider>
  );
}
