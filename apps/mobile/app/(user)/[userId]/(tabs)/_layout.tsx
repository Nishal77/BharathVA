import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, Text, View, useColorScheme } from 'react-native';
import { useTabStyles } from '../../../../hooks/useTabStyles';

// Theme-aware Image Icons with tintColor
const HomeIcon = ({ size, color }: { size: number; color: string }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Image
      source={require('../../../../assets/logo/home.png')}
      style={{ 
        width: size, 
        height: size,
        tintColor: isDark ? '#FFFFFF' : '#000000'
      }}
      resizeMode="contain"
    />
  );
};

const SearchIcon = ({ size, color }: { size: number; color: string }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Image
      source={require('../../../../assets/logo/search.png')}
      style={{ 
        width: size, 
        height: size,
        tintColor: isDark ? '#FFFFFF' : '#000000'
      }}
      resizeMode="contain"
    />
  );
};

const BellIcon = ({ size, color }: { size: number; color: string }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Image
      source={require('../../../../assets/logo/alarm.png')}
      style={{ 
        width: size, 
        height: size,
        tintColor: isDark ? '#FFFFFF' : '#000000'
      }}
      resizeMode="contain"
    />
  );
};

const ProfileIcon = ({ size, color }: { size: number; color: string }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Image
      source={require('../../../../assets/logo/userprofile.png')}
      style={{ 
        width: size, 
        height: size,
        tintColor: isDark ? '#FFFFFF' : '#000000'
      }}
      resizeMode="contain"
    />
  );
};

const SquarePlusIcon = ({ size, color }: { size: number; color: string }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Image
      source={require('../../../../assets/logo/plus.png')}
      style={{ 
        width: size, 
        height: size,
        tintColor: isDark ? '#FFFFFF' : '#000000'
      }}
      resizeMode="contain"
    />
  );
};

// Notification icon with badge
function NotificationTabIcon({ size, color }: { size: number; color: string }) {
  // For sample, let's use a realistic count
  const notificationCount = 8;
  return (
    <View className="relative items-center justify-center">
      <BellIcon size={size} color={color} />
      {notificationCount > 0 && (
        <View className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold text-center leading-[12px]">
            {notificationCount > 99 ? '99+' : notificationCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const tabStyles = useTabStyles();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabStyles.text.active,
        tabBarInactiveTintColor: tabStyles.text.inactive,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 16,
          height: Platform.OS === 'ios' ? 88 : 64,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={190}
            tint={tabStyles.container.backgroundColor === '#000000' ? 'dark' : 'light'}
            style={{
              flex: 1,
              borderTopWidth: 1,
              borderTopColor: tabStyles.border.color,
            }}
          />
        ),
        tabBarShowLabel: false, // Remove text labels
        tabBarIconStyle: {
          marginTop: 0,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ size }) => (
            <HomeIcon size={size} color={tabStyles.text.active} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ size }) => (
            <SearchIcon size={size} color={tabStyles.text.active} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ size }) => (
            <SquarePlusIcon size={size} color={tabStyles.text.active} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ size }) => (
            <NotificationTabIcon size={size} color={tabStyles.text.active} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ size }) => (
            <ProfileIcon size={size} color={tabStyles.text.active} />
          ),
        }}
      />
    </Tabs>
  );
}
