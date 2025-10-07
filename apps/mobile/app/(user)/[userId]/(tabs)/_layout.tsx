import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTabStyles } from '../../../../hooks/useTabStyles';

// SVG Icon Components with theme-aware colors
const HomeIcon = ({ size, color }: { size: number; color: string }) => (
  <SvgXml
    width={size}
    height={size}
    xml={`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12H15V22" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  />
);

const SearchIcon = ({ size, color }: { size: number; color: string }) => (
  <SvgXml
    width={size}
    height={size}
    xml={`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21L16.65 16.65" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  />
);

const BellIcon = ({ size, color }: { size: number; color: string }) => (
  <SvgXml
    width={size}
    height={size}
    xml={`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  />
);

const ProfileIcon = ({ size, color }: { size: number; color: string }) => (
  <SvgXml
    width={size}
    height={size}
    xml={`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  />
);

const SquarePlusIcon = ({ size, color }: { size: number; color: string }) => (
  <SvgXml
    width={size}
    height={size}
    xml={`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="8" x2="12" y2="16" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  />
);

// Notification icon with badge
function NotificationTabIcon({ size, color }: { size: number; color: string }) {
  // For sample, let's use a realistic count
  const notificationCount = 8;
  return (
    <View className="relative items-center justify-center">
      <BellIcon size={size} color={color} />
      {notificationCount > 0 && (
        <View className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white dark:border-black items-center justify-center px-1 shadow-md">
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
