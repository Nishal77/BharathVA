import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FeedIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="7" height="7" x="3" y="3" rx="1" />
    <Rect width="7" height="7" x="14" y="3" rx="1" />
    <Rect width="7" height="7" x="14" y="14" rx="1" />
    <Rect width="7" height="7" x="3" y="14" rx="1" />
  </Svg>
);

const MediaIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 2h10" />
    <Path d="M5 6h14" />
    <Rect width="18" height="12" x="3" y="10" rx="2" />
  </Svg>
);

const VideoIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="18" height="18" x="3" y="3" rx="2" />
    <Path d="M7 3v18" />
    <Path d="M3 7.5h4" />
    <Path d="M3 12h18" />
    <Path d="M3 16.5h4" />
    <Path d="M17 3v18" />
    <Path d="M17 7.5h4" />
    <Path d="M17 16.5h4" />
  </Svg>
);

const RepliesIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m12 17-5-5 5-5" />
    <Path d="M22 18v-2a4 4 0 0 0-4-4H7" />
    <Path d="m7 17-5-5 5-5" />
  </Svg>
);

const tabs = [
  { id: 'Feed', label: 'Feed', icon: FeedIcon },
  { id: 'Media', label: 'Media', icon: MediaIcon },
  { id: 'Video', label: 'Video', icon: VideoIcon },
  { id: 'Replies', label: 'Replies', icon: RepliesIcon },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={styles.tab}
            >
              <IconComponent 
                color={isActive ? colors.text : colors.textSecondary} 
                size={24} 
              />
              {isActive && (
                <View style={[styles.tabIndicator, { backgroundColor: '#FF6B35' }]} />
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 1.5,
  },
  separator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: -StyleSheet.hairlineWidth,
  },
});

