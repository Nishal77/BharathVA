import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, Text, View, useColorScheme, StyleSheet } from 'react-native';
import { Svg, Path, Circle, Line, Rect } from 'react-native-svg';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import { useNotificationCount } from '../../../../hooks/useNotificationCount';

// Theme-aware SVG Icons
const HomeIcon = ({ size, color, focused }: { size: number; color: string; focused?: boolean }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FFFFFF' : '#000000';
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
    >
      {focused ? (
        // Filled/Active state when on home tab
        <Path
          d="M7.94127 1.36281C8.56694 0.887445 9.4333 0.886569 10.0591 1.36312L15.3088 5.35287C15.7448 5.68398 16 6.20008 16 6.746V14.25C16 15.7692 14.7692 17 13.25 17H9.75V13.75C9.75 13.3358 9.41421 13 9 13C8.58579 13 8.25 13.3358 8.25 13.75V17H4.75C3.23079 17 2 15.7692 2 14.25V6.746C2 6.19867 2.2559 5.68346 2.69155 5.3526L7.94127 1.36281Z"
          fill={iconColor}
        />
      ) : (
        // Outlined/Inactive state when not on home tab
        <>
          <Path
            d="M9 16V12.75"
            stroke={iconColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M3.145 5.95L8.395 1.96C8.753 1.688 9.248 1.688 9.605 1.96L14.855 5.95C15.104 6.139 15.25 6.434 15.25 6.746V14.25C15.25 15.355 14.355 16.25 13.25 16.25H4.75C3.645 16.25 2.75 15.355 2.75 14.25V6.746C2.75 6.433 2.896 6.139 3.145 5.95Z"
            stroke={iconColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
};

const SearchIcon = ({ size, color }: { size: number; color: string }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FFFFFF' : '#000000';
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
    >
      <Path
        d="M15.75 15.75L11.6386 11.6386"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M7.75 13.25C10.7875 13.25 13.25 10.7875 13.25 7.75C13.25 4.7125 10.7875 2.25 7.75 2.25C4.7125 2.25 2.25 4.7125 2.25 7.75C2.25 10.7875 4.7125 13.25 7.75 13.25Z"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

const BellIcon = ({ size, color, focused }: { size: number; color: string; focused?: boolean }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FFFFFF' : '#000000';
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
    >
      {focused ? (
        // Filled/Active state when on notifications tab
        <>
          <Path
            d="M15.75 12C15.061 12 14.5 11.439 14.5 10.75V6.5C14.5 3.467 12.033 1 9 1C5.967 1 3.5 3.467 3.5 6.5V10.75C3.5 11.439 2.939 12 2.25 12C1.836 12 1.5 12.336 1.5 12.75C1.5 13.164 1.836 13.5 2.25 13.5H15.75C16.164 13.5 16.5 13.164 16.5 12.75C16.5 12.336 16.164 12 15.75 12Z"
            fill={iconColor}
          />
          <Path
            d="M7.80099 15C7.64999 15 7.50799 15.068 7.41299 15.185C7.31799 15.302 7.28099 15.456 7.31199 15.603C7.48499 16.425 8.17999 17 9.00099 17C9.82199 17 10.517 16.425 10.69 15.603C10.721 15.456 10.684 15.302 10.589 15.185C10.494 15.068 10.352 15 10.201 15H7.80099Z"
            fill={iconColor}
          />
        </>
      ) : (
        // Outlined/Inactive state when not on notifications tab
        <>
          <Path
            d="M15.75 12.75C14.645 12.75 13.75 11.855 13.75 10.75V6.5C13.75 3.877 11.623 1.75 9 1.75C6.377 1.75 4.25 3.877 4.25 6.5V10.75C4.25 11.855 3.355 12.75 2.25 12.75H15.75Z"
            stroke={iconColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M10.5 15.3843C10.2005 15.9018 9.6409 16.25 9 16.25C8.3591 16.25 7.7995 15.9018 7.5 15.3843"
            stroke={iconColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
};

const ProfileIcon = ({ size, color, focused }: { size: number; color: string; focused?: boolean }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FFFFFF' : '#000000';
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
    >
      {focused ? (
        // Filled/Active state when on profile tab
        <>
          <Path
            d="M2.60518 13.1674C3.69058 10.7157 6.14168 9 8.99999 9C11.7634 9 14.1462 10.6037 15.2822 12.9257C15.3564 13.0774 15.4289 13.2326 15.4797 13.3894C15.8649 14.5805 15.1811 15.8552 13.9874 16.2313C12.705 16.6354 11.0072 17 8.99999 17C6.99283 17 5.29503 16.6354 4.01259 16.2313C2.74425 15.8317 2.05162 14.4186 2.60518 13.1674Z"
            fill={iconColor}
          />
          <Path
            d="M9 7.50049C10.7952 7.50049 12.25 6.04543 12.25 4.25049C12.25 2.45554 10.7952 1.00049 9 1.00049C7.20482 1.00049 5.75 2.45554 5.75 4.25049C5.75 6.04543 7.20482 7.50049 9 7.50049Z"
            fill={iconColor}
          />
        </>
      ) : (
        // Outlined/Inactive state when not on profile tab
        <>
          <Circle
            cx="9"
            cy="4.5"
            r="2.75"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Path
            d="M13.762,15.516c.86-.271,1.312-1.221,.947-2.045-.97-2.191-3.159-3.721-5.709-3.721s-4.739,1.53-5.709,3.721c-.365,.825,.087,1.774,.947,2.045,1.225,.386,2.846,.734,4.762,.734s3.537-.348,4.762-.734Z"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </>
      )}
    </Svg>
  );
};

const SquarePlusIcon = ({ size, color, focused }: { size: number; color: string; focused?: boolean }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#FFFFFF' : '#000000';
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
    >
      {focused ? (
        // Filled/Active state when on create tab
        <Path
          d="M13.25,2H4.75c-1.517,0-2.75,1.233-2.75,2.75V13.25c0,1.517,1.233,2.75,2.75,2.75H13.25c1.517,0,2.75-1.233,2.75-2.75V4.75c0-1.517-1.233-2.75-2.75-2.75Zm-1,7.75h-2.5v2.5c0,.414-.336,.75-.75,.75s-.75-.336-.75-.75v-2.5h-2.5c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75h2.5v-2.5c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v2.5h2.5c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
          fill={iconColor}
        />
      ) : (
        // Outlined/Inactive state when not on create tab
        <>
          <Rect
            x="2.75"
            y="2.75"
            width="12.5"
            height="12.5"
            rx="2"
            ry="2"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="5.75"
            y1="9"
            x2="12.25"
            y2="9"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Line
            x1="9"
            y1="5.75"
            x2="9"
            y2="12.25"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </>
      )}
    </Svg>
  );
};

// Notification Badge Component
const NotificationBadge = ({ count, isDark }: { count: number; isDark: boolean }) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  const borderColor = isDark ? '#000000' : '#FFFFFF';

  return (
    <View style={[styles.badgeContainer, { borderColor }]}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </View>
  );
};

export default function TabLayout() {
  const tabStyles = useTabStyles();
  const { count: notificationCount } = useNotificationCount();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          tabBarIcon: ({ size, focused }) => (
            <HomeIcon size={size} color={tabStyles.text.active} focused={focused} />
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
          tabBarIcon: ({ size, focused }) => (
            <SquarePlusIcon size={size} color={tabStyles.text.active} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <View style={styles.iconContainer}>
              <BellIcon size={size} color={tabStyles.text.active} focused={focused} />
              <NotificationBadge count={notificationCount} isDark={isDark} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <ProfileIcon size={size} color={tabStyles.text.active} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 0,
  },
});