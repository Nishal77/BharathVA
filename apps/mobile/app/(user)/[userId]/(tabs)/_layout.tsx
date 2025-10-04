import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
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

const MessageIcon = ({ size, color }: { size: number; color: string }) => (
  <SvgXml
    width={size}
    height={size}
    xml={`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  />
);

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
            intensity={60}
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
        name="notifications"
        options={{
          tabBarIcon: ({ size }) => (
            <BellIcon size={size} color={tabStyles.text.active} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ size }) => (
            <MessageIcon size={size} color={tabStyles.text.active} />
          ),
        }}
      />
    </Tabs>
  );
}
